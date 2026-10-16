import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const WorkerQuotesPage: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch('/api/quotations/my-quotations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setQuotations(data.quotations);
        }
      } catch (err) {
        console.error('Failed to load quotes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const filtered = quotations.filter((q) => {
    if (filterTab === 'ALL') return true;
    return q.status === filterTab;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          MY SUBMITTED QUOTATIONS
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Track customer responses, negotiations, and won craftsmanship contracts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-full border border-[#D9D9D9] text-xs font-mono max-w-md shadow-xs">
        {(['ALL', 'PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`flex-1 py-1.5 rounded-full capitalize font-semibold transition-all ${
              filterTab === tab ? 'bg-black text-white shadow-xs' : 'text-neutral-500 hover:text-black'
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-[#D9D9D9]">
          <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-mono text-neutral-600 mb-4">No quotations in this tab.</p>
          <Link to="/worker/feed">
            <Button variant="orange" size="sm">
              Browse Available Deals
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => (
            <Card
              key={q.id}
              className="p-6 bg-white border-[#D9D9D9] hover:border-black transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="orange">{q.requirement?.category?.name}</Badge>
                  <Badge
                    variant={
                      q.status === 'ACCEPTED'
                        ? 'success'
                        : q.status === 'NEGOTIATING'
                        ? 'orange'
                        : 'default'
                    }
                  >
                    {q.status}
                  </Badge>
                  {q.status === 'NEGOTIATING' && (
                    <span className="text-[11px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                      Counter: ₹{q.counterPrice?.toLocaleString()}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#0A0A0A] mb-1">
                  {q.requirement?.title}
                </h3>

                <p className="text-xs text-[#4A4A4A] mb-2 font-medium">
                  Customer: {q.requirement?.customer?.name} • {q.requirement?.city}
                </p>

                <p className="text-xs text-neutral-600 line-clamp-1 max-w-xl">
                  {q.notes || q.deliveryTerms}
                </p>
              </div>

              <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 shrink-0">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Your Bid Amount</span>
                <p className="font-mono text-2xl font-bold text-black mb-1">
                  ₹{q.totalPrice.toLocaleString()}
                </p>
                <span className="text-xs font-mono text-neutral-400 mb-3">
                  {q.timelineDays} Days Timeline
                </span>

                <div className="flex items-center gap-2">
                  <Link to="/worker/chat">
                    <Button variant="outline" size="sm" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                      Chat
                    </Button>
                  </Link>

                  {q.status === 'ACCEPTED' && q.orders?.[0] && (
                    <Link to={`/worker/projects`}>
                      <Button variant="orange" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Go to Project
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
