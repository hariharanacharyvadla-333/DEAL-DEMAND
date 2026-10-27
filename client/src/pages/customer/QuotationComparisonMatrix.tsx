import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  Zap,
  Clock,
  ArrowUpDown,
  Lock,
  RotateCcw,
} from 'lucide-react';

export const QuotationComparisonMatrix: React.FC = () => {
  const { id: dealId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [deal, setDeal] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'timeline' | 'rating'>('price');

  // Negotiate Modal State
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [selectedQuoteForNeg, setSelectedQuoteForNeg] = useState<any>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);

  // Accept Quotation State
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const fetchDealAndQuotes = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const [dealRes, aiRes] = await Promise.all([
          fetch(`/api/deals/${dealId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/ai/summarize-quotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dealId }),
          }),
        ]);

        const dealData = await dealRes.json();
        const aiData = await aiRes.json();

        if (dealData.success) {
          setDeal(dealData.deal);
          setQuotations(dealData.deal.quotations || []);
        }
        if (aiData.success) {
          setAiSummary(aiData.result);
        }
      } catch (err) {
        console.error('Failed to load quotes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealAndQuotes();
  }, [dealId]);

  // Sort Quotations
  const sortedQuotes = [...quotations].sort((a, b) => {
    if (sortBy === 'price') return a.totalPrice - b.totalPrice;
    if (sortBy === 'timeline') return a.timelineDays - b.timelineDays;
    if (sortBy === 'rating') return (b.worker?.rating || 0) - (a.worker?.rating || 0);
    return 0;
  });

  // Handle Accept
  const handleAcceptQuote = async (quoteId: string) => {
    if (!window.confirm('Accept this quotation? Your project will be initialized and funds secured in Escrow.')) {
      return;
    }

    setIsAccepting(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch(`/api/quotations/${quoteId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryAddress: deal.address }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Quotation accepted! Funds placed into secure escrow.');
        navigate(`/customer/orders/${data.order.id}`);
      } else {
        toast.error(data.message || 'Failed to accept quotation.');
      }
    } catch (err) {
      toast.error('Error accepting quotation.');
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle Negotiate Submit
  const handleNegotiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterPrice || !selectedQuoteForNeg) return;
    setIsNegotiating(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch(`/api/quotations/${selectedQuoteForNeg.id}/negotiate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          counterPrice: Number(counterPrice),
          note: counterNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Counter offer sent to artisan.');
        setQuotations((prev) =>
          prev.map((q) => (q.id === selectedQuoteForNeg.id ? { ...q, status: 'NEGOTIATING', counterPrice: Number(counterPrice) } : q))
        );
        setNegotiateModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to send counter offer.');
      }
    } catch (err) {
      toast.error('Error sending negotiation.');
    } finally {
      setIsNegotiating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Matrix Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/customer/deals/${dealId}`} className="text-xs font-mono text-neutral-400 hover:text-black">
              ← Back to Deal
            </Link>
            <span className="text-neutral-300">•</span>
            <Badge variant="orange">{deal?.category?.name}</Badge>
          </div>
          <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
            QUOTATION COMPARISON MATRIX
          </h1>
          <p className="text-xs font-mono text-neutral-500">
            Side-by-side analysis for "{deal?.title}"
          </p>
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
          </span>
          <div className="flex bg-white p-0.5 rounded-full border border-[#D9D9D9] text-xs font-mono shadow-xs">
            <button
              onClick={() => setSortBy('price')}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === 'price' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setSortBy('timeline')}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === 'timeline' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Speed
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === 'rating' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Rating
            </button>
          </div>
        </div>
      </div>

      {/* AI Comparative Insights Banner */}
      {aiSummary && (
        <Card className="p-5 bg-white text-[#0A0A0A] border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF5A1F] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] tracking-wide mb-1">
                AI COMPARATIVE INTELLIGENCE
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed max-w-4xl">
                {aiSummary.summary}
              </p>
              {aiSummary.keyDifferences?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono text-[#0A0A0A]">
                  {aiSummary.keyDifferences.map((diff: string, i: number) => (
                    <span key={i} className="bg-white px-2.5 py-1 rounded-full border border-[#D9D9D9] shadow-2xs font-semibold">
                      {diff}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Grid (Cards per quote) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedQuotes.map((q) => {
          const isBestValue = aiSummary?.bestValueQuotationId === q.id;
          const isFastest = aiSummary?.fastestQuotationId === q.id;
          const isAccepted = q.status === 'ACCEPTED';

          return (
            <Card
              key={q.id}
              className={`p-6 bg-white border-2 transition-all flex flex-col justify-between ${
                isAccepted
                  ? 'border-[#10B981] shadow-lg ring-2 ring-[#ECFDF5]'
                  : isBestValue
                  ? 'border-[#FF5A1F] shadow-sm'
                  : 'border-neutral-200 hover:border-black'
              }`}
            >
              <div>
                {/* Header with badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={q.worker?.user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                      alt={q.worker?.user?.name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-300"
                    />
                    <div>
                      <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-1">
                        {q.worker?.user?.name}
                        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                      </h3>
                      <p className="text-[11px] font-mono text-neutral-500">
                        {q.worker?.yearsExperience || 5} yrs experience
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isBestValue && <Badge variant="orange">BEST VALUE</Badge>}
                    {isFastest && <Badge variant="fast">FASTEST</Badge>}
                    {isAccepted && <Badge variant="success">ACCEPTED</Badge>}
                  </div>
                </div>

                {/* Worker Stats */}
                <div className="flex items-center justify-between text-xs font-mono text-neutral-600 bg-white p-2.5 rounded-nothing-sm border border-[#D9D9D9] mb-4 shadow-2xs">
                  <RatingStars value={q.worker?.rating || 5} showNumber size="sm" />
                  <span>{q.worker?.jobsCompleted || 0} jobs done</span>
                  <span>{q.worker?.responseRatePct || 95}% response</span>
                </div>

                {/* Big Price Tag */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Total Bid Amount</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black text-[#0A0A0A]">
                      ₹{q.totalPrice.toLocaleString()}
                    </span>
                    {q.status === 'NEGOTIATING' && q.counterPrice && (
                      <span className="text-xs font-mono text-[#FF5A1F] font-bold line-through">
                        Counter: ₹{q.counterPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Itemized Price Breakdown */}
                <div className="border-t border-b border-dashed border-neutral-200 py-3 mb-4 space-y-1.5 text-xs font-mono text-neutral-600">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">
                    Itemized Cost Breakdown
                  </span>
                  {q.items && q.items.length > 0 ? (
                    q.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="truncate pr-2">{item.title}:</span>
                        <span className="font-semibold text-black shrink-0">₹{item.amount.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-400 text-[11px]">Standard inclusive pricing</div>
                  )}
                </div>

                {/* Logistics & Warranty Specs */}
                <div className="space-y-2 text-xs font-mono text-neutral-700 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Duration:</span>
                    <span className="font-semibold text-black">{q.timelineDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Warranty:</span>
                    <span className="font-semibold text-black">{q.warrantyMonths} Months Guarantee</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Terms:</span>
                    <span className="font-semibold text-black text-right max-w-[180px] truncate">
                      {q.deliveryTerms || 'Site setup included'}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {q.notes && (
                  <div className="p-3 bg-white rounded-nothing-sm border border-[#D9D9D9] text-xs text-neutral-600 mb-6 italic shadow-2xs">
                    "{q.notes}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                {isAccepted ? (
                  <Button variant="secondary" size="md" className="w-full justify-center" disabled>
                    Quotation Active in Project
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="orange"
                      size="md"
                      isLoading={isAccepting}
                      onClick={() => handleAcceptQuote(q.id)}
                      className="w-full justify-center"
                      icon={<Lock className="w-3.5 h-3.5" />}
                    >
                      Accept & Fund Escrow
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 justify-center text-xs"
                        onClick={() => {
                          setSelectedQuoteForNeg(q);
                          setCounterPrice(String(Math.round(q.totalPrice * 0.9)));
                          setNegotiateModalOpen(true);
                        }}
                      >
                        Negotiate
                      </Button>
                      <Link to={`/customer/chat?dealId=${deal?.id || dealId}&workerId=${q.workerId}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full justify-center text-xs" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Negotiation Modal */}
      <Modal
        isOpen={negotiateModalOpen}
        onClose={() => setNegotiateModalOpen(false)}
        title="NEGOTIATE QUOTATION"
        subtitle={`Propose a counter-offer to ${selectedQuoteForNeg?.worker?.user?.name}`}
      >
        <form onSubmit={handleNegotiateSubmit} className="space-y-4">
          <div className="p-3 bg-white rounded-nothing-sm border border-[#D9D9D9] text-xs font-mono shadow-2xs">
            <div className="flex justify-between mb-1">
              <span>Original Bid Price:</span>
              <span className="font-bold">₹{selectedQuoteForNeg?.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          <Input
            label="Your Counter Price Offer (₹ INR)"
            type="number"
            value={counterPrice}
            onChange={(e) => setCounterPrice(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1">
              Counter Proposal Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={counterNote}
              onChange={(e) => setCounterNote(e.target.value)}
              placeholder="e.g. Can you do ₹36,000 if I purchase the hardware myself?"
              className="w-full bg-white border border-[#D9D9D9] rounded-nothing-sm p-3 text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setNegotiateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit" isLoading={isNegotiating}>
              Send Counter Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
