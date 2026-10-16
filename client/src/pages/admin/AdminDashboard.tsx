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
  const [isLoading, setIsLoading] = useState(true);

  // 6-Month platform metrics for charts
  const sixMonthData = [
    { month: 'May 2026', users: 140, deals: 38, revenue: 195000, commission: 9750 },
    { month: 'Jun 2026', users: 210, deals: 54, revenue: 285000, commission: 14250 },
    { month: 'Jul 2026', users: 290, deals: 72, revenue: 360000, commission: 18000 },
    { month: 'Aug 2026', users: 380, deals: 95, revenue: 475000, commission: 23750 },
    { month: 'Sep 2026', users: 490, deals: 120, revenue: 610000, commission: 30500 },
    { month: 'Oct 2026', users: 620, deals: 158, revenue: 790000, commission: 39500 },
  ];

  // 5 Flagged deals and reported users
  const flaggedItems = [
    {
      id: 'FLAG-01',
      target: 'DEAL-891: Teak Wood Carving',
      type: 'Suspicious Off-Platform Contact Attempt',
      riskScore: 0.88,
      severity: 'HIGH',
      date: '2026-10-10',
      actionNeeded: 'Review Chat & Mask Phone',
    },
    {
      id: 'FLAG-02',
      target: 'DEAL-442: Full 3BHK Italian Marble',
      type: 'Unusually Low Budget Outlier (<₹10k for 1200sqft)',
      riskScore: 0.76,
      severity: 'MEDIUM',
      date: '2026-10-09',
      actionNeeded: 'Clarify Scope with Customer',
    },
    {
      id: 'FLAG-03',
      target: 'DEAL-219: Commercial Rolling Shutter',
      type: 'Duplicate Posting Across Multiple Locations',
      riskScore: 0.82,
      severity: 'HIGH',
      date: '2026-10-08',
      actionNeeded: 'Merge Duplicate Listings',
    },
    {
      id: 'FLAG-04',
      target: 'USER-904: Customer (Rajeev M.)',
      type: 'Frequent Escrow Cancellation Pattern',
      riskScore: 0.79,
      severity: 'MEDIUM',
      date: '2026-10-07',
      actionNeeded: 'Account Under Review',
    },
    {
      id: 'FLAG-05',
      target: 'USER-311: Worker (Brijesh P.)',
      type: 'Shared External UPI Details in Chat Prior to Acceptance',
      riskScore: 0.91,
      severity: 'CRITICAL',
      date: '2026-10-06',
      actionNeeded: 'Warning Notice Sent',
    },
  ];

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setCategorySplit(data.categorySplit || []);
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
              KYC Queue ({stats?.pendingKYC || 8})
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
            ₹{(stats?.escrowHeldTotal || 68500).toLocaleString()}
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
            ₹{(stats?.platformRevenue || 34250).toLocaleString()}
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
            {stats?.pendingKYC || 8}
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
            {stats?.openDisputes || 3}
          </p>
          <span className="text-sm font-semibold text-[#E1251B] mt-2 block">
            Requires mediation
          </span>
        </Card>
      </div>

      {/* 6-Month Platform Performance & Revenue Chart */}
      <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0A0A0A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF5A1F]" />
              6-MONTH PLATFORM METRICS & ESCROW VOLUME
            </h2>
            <p className="text-xs text-[#4A4A4A] mt-0.5">
              Historical trends across users registered, deals posted, and platform commission
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0A0A0A]" /> Deals Posted</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FF5A1F]" /> Commission (₹)</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sixMonthData}>
              <XAxis dataKey="month" stroke="#4A4A4A" fontSize={11} fontFamily="Space Grotesk" />
              <YAxis yAxisId="left" orientation="left" stroke="#0A0A0A" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis yAxisId="right" orientation="right" stroke="#FF5A1F" fontSize={11} fontFamily="JetBrains Mono" tickFormatter={(v) => `₹${v / 1000}k`} />
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
              <Bar yAxisId="left" dataKey="deals" name="Deals Posted" fill="#0A0A0A" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="commission" name="Commission Earned (₹)" fill="#FF5A1F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 5 Flagged Deals & Reported Users Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight flex items-center gap-2">
              <Flag className="w-5 h-5 text-[#E1251B]" />
              FLAGGED DEALS & SAFETY ALERTS (5 ACTIVE)
            </h2>
            <p className="text-xs text-[#4A4A4A] mt-0.5 font-normal">
              Automated AI risk detection & user-reported terms-of-service violations
            </p>
          </div>
          <Badge variant="danger" className="font-semibold text-xs">
            5 Critical Review Items
          </Badge>
        </div>

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
                  <span className="text-xs text-[#4A4A4A] font-mono">
                    Score: {(item.riskScore * 100).toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0A0A0A] mt-1">
                  {item.target}
                </h3>
                <p className="text-xs text-[#4A4A4A] mt-0.5">
                  Reason: {item.type}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#0A0A0A] bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  {item.actionNeeded}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Review action initiated for ${item.id}`)}
                  className="text-xs"
                >
                  Inspect Evidence
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Operational Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/verifications" className="block">
          <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all rounded-nothing">
            <UserCheck2 className="w-6 h-6 text-[#FF5A1F] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A]">Worker Verifications Queue</h3>
            <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
              Review Aadhaar documents, trade certificates, and issue badges for 8 artisans.
            </p>
          </Card>
        </Link>

        <Link to="/admin/escrow" className="block">
          <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all rounded-nothing">
            <Coins className="w-6 h-6 text-[#10B981] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A]">Escrow & Deliveries Board</h3>
            <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
              Oversee 6 escrow custody accounts and monitor 4 delivery tracking records.
            </p>
          </Card>
        </Link>

        <Link to="/admin/disputes" className="block">
          <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all rounded-nothing">
            <Scale className="w-6 h-6 text-[#E1251B] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A]">Dispute Mediation Desk</h3>
            <p className="text-xs text-[#4A4A4A] mt-1 leading-relaxed">
              Examine chat history, on-site photographs, and adjudicate 3 open disputes.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
};
