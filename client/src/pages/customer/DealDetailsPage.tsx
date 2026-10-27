import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { RatingStars } from '../../components/ui/RatingStars';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  FileText,
  DollarSign,
  AlertCircle,
  Columns,
} from 'lucide-react';

export const DealDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch(`/api/deals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setDeal(data.deal);
        }
      } catch (err) {
        console.error('Failed to fetch deal:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeal();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-16">
        <h3 className="font-dot text-xl font-bold">Deal not found</h3>
        <Link to="/customer/deals" className="mt-4 inline-block">
          <Button variant="secondary">Back to My Deals</Button>
        </Link>
      </div>
    );
  }

  const quotes = deal.quotations || [];
  let dynamicValuesObj: Record<string, any> = {};
  try {
    dynamicValuesObj = typeof deal.dynamicValues === 'string' ? JSON.parse(deal.dynamicValues) : (deal.dynamicValues || {});
  } catch {}

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Deal Header Overview */}
      <Card className="p-6 bg-white border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="orange">{deal.category?.name}</Badge>
              <Badge
                variant={
                  deal.status === 'COMPLETED'
                    ? 'success'
                    : deal.status === 'IN_PROGRESS'
                    ? 'orange'
                    : 'default'
                }
              >
                {deal.status.replace('_', ' ')}
              </Badge>
              {deal.urgency === 'URGENT' && <Badge variant="danger">URGENT</Badge>}
            </div>
            <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
              {deal.title}
            </h1>
            <p className="text-xs font-mono text-neutral-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {deal.address}, {deal.city} • Target: {new Date(deal.deadline).toLocaleDateString()}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Estimated Budget</span>
            <p className="font-mono text-2xl font-bold text-black">
              ₹{deal.minBudget.toLocaleString()} - ₹{deal.maxBudget.toLocaleString()}
            </p>
            {quotes.length > 0 && (
              <Link to={`/customer/deals/${deal.id}/compare`}>
                <Button variant="orange" size="sm" className="mt-3" icon={<Columns className="w-4 h-4" />}>
                  Compare {quotes.length} Quotes Side-by-Side
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Description & Dynamic Spec */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h4 className="font-mono text-xs uppercase text-neutral-400 font-bold mb-1">Description</h4>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {deal.description}
              </p>
            </div>

            {/* Images */}
            {deal.images && deal.images.length > 0 && (
              <div>
                <h4 className="font-mono text-xs uppercase text-neutral-400 font-bold mb-2">Drawings & Photos</h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {deal.images.map((img: any) => (
                    <img
                      key={img.id}
                      src={img.fileUrl}
                      alt="Attachment"
                      className="w-28 h-28 object-cover rounded-nothing-sm border border-neutral-200 shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Specs Sidebar */}
          <div className="bg-white p-4 rounded-nothing-sm border border-[#D9D9D9] shadow-2xs">
            <h4 className="font-mono text-xs uppercase text-neutral-500 font-bold mb-3">
              Technical Parameters
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {Object.entries(dynamicValuesObj).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-neutral-200/60 pb-1">
                  <span className="text-neutral-500 capitalize">{key}:</span>
                  <span className="text-black font-semibold">{String(val)}</span>
                </div>
              ))}
              <div className="flex justify-between border-b border-neutral-200/60 pb-1">
                <span className="text-neutral-500">Materials:</span>
                <span className="text-black">{deal.materialsSupplied ? 'Customer Supplies' : 'Worker Supplies'}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200/60 pb-1">
                <span className="text-neutral-500">Installation:</span>
                <span className="text-black">{deal.installationReq ? 'Yes, On-Site' : 'Delivery Only'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Received Quotations Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight">
              RECEIVED QUOTATIONS ({quotes.length})
            </h2>
            <p className="text-xs font-mono text-neutral-500">
              Compare itemized bids or enter direct chat threads
            </p>
          </div>

          {quotes.length > 1 && (
            <Link to={`/customer/deals/${deal.id}/compare`}>
              <Button variant="primary" size="sm" icon={<Columns className="w-3.5 h-3.5" />}>
                Open Comparison Matrix
              </Button>
            </Link>
          )}
        </div>

        {quotes.length === 0 ? (
          <Card className="p-8 text-center bg-white border-dashed border-[#D9D9D9]">
            <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-mono text-neutral-600 mb-1">
              Waiting for artisan bids...
            </p>
            <p className="text-xs text-neutral-400">
              Verified workers are being notified based on their skills and radius.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {quotes.map((q: any) => (
              <Card
                key={q.id}
                className="p-6 bg-white border-[#D9D9D9] hover:border-black transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={q.worker?.user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                    alt={q.worker?.user?.name}
                    className="w-14 h-14 rounded-full object-cover border border-neutral-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-[#0A0A0A]">
                        {q.worker?.user?.name}
                      </h4>
                      <Badge variant="verified">VERIFIED</Badge>
                      <Badge variant={q.status === 'ACCEPTED' ? 'success' : 'default'}>
                        {q.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 mb-2">
                      <RatingStars value={q.worker?.rating || 5} showNumber size="sm" />
                      <span>• {q.worker?.jobsCompleted || 0} jobs completed</span>
                      <span>• Warranty: {q.warrantyMonths}m</span>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 max-w-xl">
                      {q.notes || q.deliveryTerms}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 shrink-0">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Total Bid Price</span>
                  <p className="font-mono text-2xl font-bold text-[#0A0A0A]">
                    ₹{q.totalPrice.toLocaleString()}
                  </p>
                  <span className="text-xs font-mono text-neutral-500 mb-3">
                    Completion in {q.timelineDays} days
                  </span>

                  <div className="flex items-center gap-2">
                    <Link to={`/customer/chat?dealId=${deal.id}&workerId=${q.workerId}`}>
                      <Button variant="outline" size="sm" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                        Chat
                      </Button>
                    </Link>
                    <Link to={`/customer/deals/${deal.id}/compare`}>
                      <Button variant="orange" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Review & Accept
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
