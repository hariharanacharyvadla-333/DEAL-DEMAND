import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Wallet,
  Compass,
  FileText,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Coins,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const worker = user?.workerProfile;

  const [quotes, setQuotes] = useState<any[]>([]);
  const [feedDeals, setFeedDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const [quotesRes, feedRes] = await Promise.all([
          fetch('/api/quotations/my-quotations', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/deals?status=OPEN'),
        ]);

        const quotesData = await quotesRes.json();
        const feedData = await feedRes.json();

        if (quotesData.success) setQuotes(quotesData.quotations);
        if (feedData.success) setFeedDeals(feedData.deals.slice(0, 3));
      } catch (err) {
        console.error('Failed to load worker data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkerData();
  }, []);

  const earningsData = [
    { month: 'May', earnings: 12000 },
    { month: 'Jun', earnings: 18500 },
    { month: 'Jul', earnings: 16000 },
    { month: 'Aug', earnings: 24000 },
    { month: 'Sep', earnings: 31000 },
    { month: 'Oct', earnings: 42000 },
  ];

  const pendingQuotes = quotes.filter((q) => q.status === 'PENDING' || q.status === 'NEGOTIATING');
  const wonQuotes = quotes.filter((q) => q.status === 'ACCEPTED');

  return (
    <div className="space-y-8">
      {/* Worker Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
              ARTISAN WORKBENCH: {user?.name ? user.name.toUpperCase() : 'ARTISAN'}
            </h1>
            {worker?.verificationState === 'VERIFIED' && (
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            )}
          </div>
          <p className="text-sm font-mono text-[#4A4A4A] mt-1 font-medium">
            {worker?.categories?.[0]?.category?.name || 'Skilled Professional'} • {worker?.serviceArea} • Badge: {worker?.badgeLevel || 'BASIC'}
          </p>
        </div>

        <Link to="/worker/feed">
          <Button variant="orange" size="md" icon={<Compass className="w-4 h-4" />}>
            Browse Available Deals
          </Button>
        </Link>
      </div>

      {/* Profile Completeness & KYC Alert */}
      {worker?.verificationState === 'PENDING' && (
        <div className="p-4 rounded-nothing-sm bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                KYC VERIFICATION UNDER REVIEW
              </h4>
              <p className="text-sm text-amber-800 mt-0.5">
                Our admin desk is inspecting your ID documents. You can still submit quotations on open deals.
              </p>
            </div>
          </div>
          <Link to="/worker/profile">
            <Button variant="outline" size="sm" className="bg-white">
              View KYC
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">Available Wallet</span>
            <Wallet className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            ₹{(worker?.walletBalance || 0).toLocaleString()}
          </p>
          <span className="text-sm font-semibold text-[#10B981] mt-1.5 block">
            Ready for instant bank/UPI withdrawal
          </span>
        </Card>

        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">Pending Escrow</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            ₹{(worker?.pendingEscrow || 0).toLocaleString()}
          </p>
          <span className="text-sm text-[#4A4A4A] mt-1.5 block">
            Secured in ongoing milestone jobs
          </span>
        </Card>

        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">Active Quotes</span>
            <FileText className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            {pendingQuotes.length}
          </p>
          <span className="text-sm text-[#4A4A4A] mt-1.5 block font-medium">
            {wonQuotes.length} won contracts
          </span>
        </Card>

        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">Customer Rating</span>
            <Award className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
              {worker?.rating || '5.0'}★
            </p>
            <span className="text-sm font-mono text-[#4A4A4A]">
              ({worker?.totalReviews || 0} reviews)
            </span>
          </div>
          <span className="text-sm font-semibold text-[#10B981] mt-1.5 block">
            98% response rate
          </span>
        </Card>
      </div>

      {/* Earnings Trend Chart */}
      <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">
              MONTHLY EARNINGS TRAJECTORY (₹ INR)
            </h3>
            <p className="text-sm text-[#4A4A4A] mt-0.5 font-normal">
              Direct disbursements from completed milestones
            </p>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-sm text-[#10B981] font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+35.4% Growth</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="workerEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5A1F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF5A1F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#4A4A4A" fontSize={12} fontFamily="Space Grotesk" />
              <YAxis stroke="#4A4A4A" fontSize={12} fontFamily="JetBrains Mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D9D9D9',
                  borderRadius: '12px',
                  color: '#0A0A0A',
                  fontFamily: 'Space Grotesk',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#FF5A1F"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#workerEarnings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Fresh Opportunities Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-dot text-lg font-bold text-[#0A0A0A] tracking-tight">
            RECENT JOBS MATCHING YOUR SKILLS
          </h2>
          <Link to="/worker/feed" className="text-xs font-mono text-neutral-600 hover:text-black flex items-center gap-1 font-semibold">
            Explore All Opportunities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedDeals.map((deal) => (
            <Card
              key={deal.id}
              className="p-5 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all flex flex-col justify-between rounded-nothing"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="orange">{deal.category?.name}</Badge>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    94% AI MATCH
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0A0A0A] mb-1 line-clamp-1">
                  {deal.title}
                </h3>
                <p className="text-xs text-[#4A4A4A] line-clamp-2 mb-4 leading-relaxed font-normal">
                  {deal.description}
                </p>
              </div>

              <div className="border-t border-neutral-200/80 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-neutral-400">Budget Range</p>
                  <p className="font-mono text-xs font-bold text-black">
                    ₹{deal.minBudget.toLocaleString()} - ₹{deal.maxBudget.toLocaleString()}
                  </p>
                </div>

                <Link to={`/worker/deals/${deal.id}/quote`}>
                  <Button variant="primary" size="sm">
                    Quote
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
