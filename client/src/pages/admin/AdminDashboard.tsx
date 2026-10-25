import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users,
  Wrench,
  Coins,
  ShieldAlert,
  Scale,
  FolderTree,
  ArrowRight,
  UserCheck2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Flag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [categorySplit, setCategorySplit] = useState<any[]>([]);
  const [flaggedItems, setFlaggedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const [statsRes, flaggedRes] = await Promise.all([
          fetch('/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/flagged', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const data = await statsRes.json();
        const flaggedData = await flaggedRes.json();

        if (data.success) {
          setStats(data.stats);
          setCategorySplit(data.categorySplit || []);
        }
        if (flaggedData.success) {
          setFlaggedItems(flaggedData.flagged || []);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-44" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Admin Control Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9D9D9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
              MASTER ESCROW & PLATFORM CONTROL
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
            Real-time financial custody ledger • Middle-layer operational monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/verifications">
            <Button variant="orange" size="sm" icon={<UserCheck2 className="w-4 h-4" />}>
              KYC Queue ({stats?.pendingKYC || 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Escrow Held In Trust</span>
            <Coins className="w-5 h-5 text-[#FF5A1F]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            ₹{(stats?.escrowHeldTotal || 0).toLocaleString()}
          </p>
          <span className="text-sm font-semibold text-[#10B981] mt-2 block">
            100% Locked custody
          </span>
        </Card>

        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Platform Commission</span>
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            ₹{(stats?.platformRevenue || 0).toLocaleString()}
          </p>
          <span className="text-sm text-[#4A4A4A] mt-2 block font-medium">
            5% average platform cut
          </span>
        </Card>

        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Pending KYC Reviews</span>
            <UserCheck2 className="w-5 h-5 text-[#FF5A1F]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            {stats?.pendingKYC || 0}
          </p>
          <span className="text-sm font-semibold text-amber-700 mt-2 block">
            Awaiting document review
          </span>
        </Card>

        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Open Disputes</span>
            <Scale className="w-5 h-5 text-[#E1251B]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            {stats?.openDisputes || 0}
          </p>
          <span className="text-sm font-semibold text-[#E1251B] mt-2 block">
            Requires mediation
          </span>
        </Card>
      </div>

      {/* Platform Performance & Category Volume Chart */}
      <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0A0A0A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF5A1F]" />
              CATEGORY DEMAND & PLATFORM VOLUME
            </h2>
            <p className="text-xs text-[#4A4A4A] mt-0.5">
              Live distribution of posted requirements across craft categories
            </p>
          </div>
        </div>

        {categorySplit.some((c) => (c._count?.deals || 0) > 0) ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySplit.map((c) => ({ name: c.name, deals: c._count?.deals || 0 }))}>
                <XAxis dataKey="name" stroke="#4A4A4A" fontSize={11} fontFamily="Space Grotesk" />
                <YAxis stroke="#0A0A0A" fontSize={11} fontFamily="JetBrains Mono" allowDecimals={false} />
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
                <Bar dataKey="deals" name="Deals Posted" fill="#FF5A1F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 w-full border border-dashed border-[#D9D9D9] rounded-nothing flex flex-col items-center justify-center text-center p-6 bg-[#FAFAFA]">
            <TrendingUp className="w-8 h-8 text-[#4A4A4A] mb-2" />
            <p className="font-bold text-sm text-[#0A0A0A]">No platform transaction history yet</p>
            <p className="text-xs text-[#4A4A4A] mt-1 max-w-sm font-normal">
              Volume charts and escrow metrics will render dynamically as requirements are posted and escrow orders funded.
            </p>
          </div>
        )}
      </Card>

      {/* Flagged Deals & Safety Alerts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight flex items-center gap-2">
              <Flag className="w-5 h-5 text-[#E1251B]" />
              FLAGGED DEALS & SAFETY ALERTS ({flaggedItems.length} ACTIVE)
            </h2>
            <p className="text-xs text-[#4A4A4A] mt-0.5 font-normal">
              Automated AI risk detection & user-reported terms-of-service violations
            </p>
          </div>
          <Badge variant={flaggedItems.length > 0 ? 'danger' : 'default'} className="font-semibold text-xs">
            {flaggedItems.length} Review Items
          </Badge>
        </div>

        {flaggedItems.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#10B981] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">Zero safety violations detected</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto leading-relaxed font-normal">
              No deals or users currently flagged for off-platform contact or fraudulent activity. All communications are clean.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {flaggedItems.map((item) => (
              <Card
                key={item.id}
                className="p-5 bg-white border border-[#D9D9D9] hover:border-black transition-all rounded-nothing-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#0A0A0A] bg-white px-2.5 py-0.5 rounded border border-[#D9D9D9] shadow-2xs">
                      {item.id}
                    </span>
                    <Badge variant={item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'danger' : 'default'}>
                      {item.severity} RISK
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] mt-1">
                    {item.target}
                  </h3>
                  <p className="text-xs text-[#4A4A4A] mt-0.5">
                    Reason: {item.type || item.reason}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#0A0A0A] bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                    {item.actionNeeded}
                  </span>
                  <Link to="/admin/disputes">
                    <Button variant="outline" size="sm" className="text-xs">
                      Inspect Evidence
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Operational Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/verifications" className="block">
          <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all rounded-nothing">
            <UserCheck2 className="w-6 h-6 text-[#FF5A1F] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A]">Worker Verifications Queue</h3>
            <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
              Review Aadhaar documents, trade certificates, and issue badges for registered artisans.
            </p>
          </Card>
        </Link>

        <Link to="/admin/escrow" className="block">
          <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all rounded-nothing">
            <Coins className="w-6 h-6 text-[#10B981] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A]">Escrow & Deliveries Board</h3>
            <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
              Oversee escrow custody accounts and monitor active delivery tracking records.
            </p>
          </Card>
        </Link>

        <Link to="/admin/disputes" className="block">
          <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all rounded-nothing">
            <Scale className="w-6 h-6 text-[#E1251B] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A]">Dispute Mediation Desk</h3>
            <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
              Examine chat history, on-site photographs, and adjudicate open disputes.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
};
