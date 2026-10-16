import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowLeft,
} from 'lucide-react';

export const SubmitQuotationPage: React.FC = () => {
  const { id: dealId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Itemized Cost Lines
  const [items, setItems] = useState<Array<{ title: string; category: string; amount: number }>>([
    { title: 'Raw Material & Hardware Procurement', category: 'MATERIAL', amount: 18000 },
    { title: 'Skilled Artisan Joinery Labour', category: 'LABOUR', amount: 10000 },
    { title: 'Protective Transport & On-site Setup', category: 'TRANSPORT', amount: 2000 },
    { title: 'Taxes & Insurance Surcharges', category: 'TAX', amount: 1000 },
  ]);

  const [timelineDays, setTimelineDays] = useState(7);
  const [warrantyMonths, setWarrantyMonths] = useState(24);
  const [deliveryTerms, setDeliveryTerms] = useState('Includes complete door-to-door delivery and on-site alignment fitting.');
  const [notes, setNotes] = useState('We use genuine ISI/CP Grade timber with anti-termite treatment. 100% satisfaction guaranteed.');

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`/api/deals/${dealId}`);
        const data = await res.json();
        if (data.success) {
          setDeal(data.deal);
          // Set sensible default material cost based on deal budget
          const baseEst = Math.round((data.deal.minBudget + data.deal.maxBudget) / 2);
          setItems([
            { title: 'Raw Material & Hardware Procurement', category: 'MATERIAL', amount: Math.round(baseEst * 0.58) },
            { title: 'Skilled Artisan Joinery Labour', category: 'LABOUR', amount: Math.round(baseEst * 0.32) },
            { title: 'Protective Transport & Setup', category: 'TRANSPORT', amount: Math.round(baseEst * 0.05) },
            { title: 'Taxes & Insurance Surcharges', category: 'TAX', amount: Math.round(baseEst * 0.05) },
          ]);
        }
      } catch (err) {
        console.error('Failed to load deal:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  // Compute Total Live
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAddItem = () => {
    setItems([...items, { title: 'Additional Component', category: 'MATERIAL', amount: 1000 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requirementId: dealId,
          totalPrice,
          timelineDays: Number(timelineDays),
          warrantyMonths: Number(warrantyMonths),
          deliveryTerms,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (data.success) {
        navigate('/worker/quotes');
      } else {
        alert(data.message || 'Failed to submit quotation.');
      }
    } catch (err) {
      alert('Error submitting quotation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link to="/worker/feed" className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-black">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Opportunities Feed
        </Link>
      </div>

      {/* Requirement Summary Box */}
      <Card className="p-6 bg-white border-[#D9D9D9] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
          <div>
            <Badge variant="orange" className="mb-1">{deal?.category?.name}</Badge>
            <h2 className="font-dot text-xl font-bold text-neutral-900">{deal?.title}</h2>
            <p className="text-xs font-mono text-neutral-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {deal?.city} ({deal?.address})
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Customer Budget Range</span>
            <p className="font-mono text-xl font-bold text-black">
              ₹{deal?.minBudget?.toLocaleString()} - ₹{deal?.maxBudget?.toLocaleString()}
            </p>
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
          {deal?.description}
        </p>
      </Card>

      {/* Quotation Builder Form */}
      <Card className="p-8 bg-white border-[#D9D9D9] shadow-xs space-y-6">
        <div>
          <h2 className="font-dot text-2xl font-black text-[#0A0A0A] tracking-tight">
            ITEMIZED QUOTATION BUILDER
          </h2>
          <p className="text-xs font-mono text-neutral-500">
            Break down material, labour and delivery costs. Customers value itemized transparency.
          </p>
        </div>

        <form onSubmit={handleSubmitQuote} className="space-y-6">
          {/* Dynamic Itemized Table */}
          <div className="border border-[#D9D9D9] rounded-nothing-sm p-4 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-bold text-neutral-700">
                Line Items Breakdown
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} icon={<Plus className="w-3.5 h-3.5" />}>
                Add Cost Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded border border-[#D9D9D9]">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                    placeholder="Component description"
                    className="flex-1 w-full text-xs font-mono p-2 border border-[#D9D9D9] rounded focus:border-black outline-none"
                    required
                  />

                  <select
                    value={item.category}
                    onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                    className="w-full sm:w-32 text-xs font-mono p-2 border border-[#D9D9D9] rounded bg-white"
                  >
                    <option value="MATERIAL">Material</option>
                    <option value="LABOUR">Labour</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="TAX">Tax / Surcharge</option>
                  </select>

                  <div className="flex items-center gap-1 w-full sm:w-36">
                    <span className="text-xs font-mono text-neutral-400">₹</span>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(idx, 'amount', Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold p-2 border border-[#D9D9D9] rounded text-right focus:border-black outline-none"
                      required
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-neutral-400 hover:text-alert rounded"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Calculated Total Bar */}
            <div className="border-t border-dashed border-[#D9D9D9] pt-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-bold text-neutral-600">
                Calculated Total Bid Price:
              </span>
              <span className="font-mono text-2xl font-black text-[#0A0A0A]">
                ₹{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Timeline and Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Turnaround Execution Timeline (Days)"
              type="number"
              value={timelineDays}
              onChange={(e) => setTimelineDays(Number(e.target.value))}
              prefixIcon={<Clock className="w-4 h-4 text-neutral-400" />}
              required
            />
            <Input
              label="Warranty Guarantee (Months)"
              type="number"
              value={warrantyMonths}
              onChange={(e) => setWarrantyMonths(Number(e.target.value))}
              prefixIcon={<ShieldCheck className="w-4 h-4 text-neutral-400" />}
              required
            />
          </div>

          {/* Delivery & Setup Terms */}
          <Input
            label="Delivery, Fitting & Setup Terms"
            value={deliveryTerms}
            onChange={(e) => setDeliveryTerms(e.target.value)}
            required
          />

          {/* Proposal Notes */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1.5">
              Artisan Proposal Notes & Material Specifications
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Highlight your timber quality, joinery precision, and past experience..."
              className="w-full bg-white border border-[#D9D9D9] rounded-nothing-sm p-3 text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="p-3 bg-white text-[#0A0A0A] border border-[#D9D9D9] rounded-nothing-sm text-xs font-mono flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Platform Escrow holds client funds. Commission is only 5% upon verified completion.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/worker/feed')}>
              Cancel
            </Button>
            <Button variant="orange" type="submit" isLoading={isSubmitting} size="lg">
              Submit Quotation Proposal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
