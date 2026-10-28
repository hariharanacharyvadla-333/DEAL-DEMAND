import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Landmark,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useToast } from '../../context/ToastContext';

export const WorkerEarningsPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const worker = user?.workerProfile;

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('10000');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  const earningsHistory = [
    { month: 'May 2026', earnings: 42000, orders: 4 },
    { month: 'Jun 2026', earnings: 55000, orders: 5 },
    { month: 'Jul 2026', earnings: 48000, orders: 4 },
    { month: 'Aug 2026', earnings: 62000, orders: 6 },
    { month: 'Sep 2026', earnings: 58000, orders: 5 },
    { month: 'Oct 2026', earnings: 74500, orders: 7 },
  ];

  const payouts = [
    {
      id: 'PAY-8821',
      date: '2026-10-06',
      amount: '₹22,000',
      status: 'APPROVED',
      account: 'rajesh.sharma@okaxis',
      method: 'Instant UPI',
    },
    {
      id: 'PAY-7419',
      date: '2026-09-25',
      amount: '₹14,000',
      status: 'APPROVED',
      account: 'rajesh.sharma@okaxis',
      method: 'Instant UPI',
    },
    {
      id: 'PAY-6102',
      date: '2026-09-10',
      amount: '₹18,500',
      status: 'APPROVED',
      account: 'rajesh.sharma@okaxis',
      method: 'IMPS Bank Transfer',
    },
    {
      id: 'PAY-5591',
      date: '2026-08-18',
      amount: '₹25,000',
      status: 'APPROVED',
      account: 'rajesh.sharma@okaxis',
      method: 'Instant UPI',
    },
  ];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/workers/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      });

      const data = await res.json();
      if (data.success) {
        const msg = data.message || 'Payout request submitted successfully!';
        setPayoutMsg(msg);
        toast.success(msg);
        setPayoutModalOpen(false);
      } else {
        toast.error(data.message || 'Payout request failed.');
      }
    } catch (err) {
      toast.error('Error requesting payout.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          EARNINGS & ESCROW WITHDRAWALS
        </h1>
        <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
          Manage your verified wallet balance and transfer funds to your UPI or bank account
        </p>
      </div>

      {payoutMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-nothing-sm text-sm text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{payoutMsg}</span>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Available for Withdrawal</span>
            <Wallet className="w-5 h-5 text-[#FF5A1F]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            ₹{(worker?.walletBalance || 24500).toLocaleString()}
          </p>
          <div className="mt-4 pt-4 border-t border-[#D9D9D9] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#10B981]">Instant UPI & IMPS Payouts</span>
            <Button
              variant="orange"
              size="sm"
              onClick={() => setPayoutModalOpen(true)}
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              Withdraw Funds
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Pending In Escrow</span>
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            ₹{(worker?.pendingEscrow || 18000).toLocaleString()}
          </p>
          <div className="mt-4 pt-4 border-t border-[#D9D9D9]">
            <span className="text-sm text-[#4A4A4A] font-medium">
              Released proportionally as clients approve on-site milestones
            </span>
          </div>
        </Card>
      </div>

      {/* 6-Month Earnings Chart */}
      <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0A0A0A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF5A1F]" />
              6-MONTH EARNINGS OVERVIEW
            </h2>
            <p className="text-xs text-[#4A4A4A] mt-0.5">
              Net revenue generated across completed craftsmanship orders
            </p>
          </div>
          <span className="font-mono text-xs font-semibold px-3 py-1 bg-white rounded-full border border-[#D9D9D9] text-[#0A0A0A] shadow-2xs">
            Total 6M: ₹3,39,500
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earningsHistory}>
              <XAxis dataKey="month" stroke="#4A4A4A" fontSize={11} fontFamily="Space Grotesk" />
              <YAxis stroke="#4A4A4A" fontSize={11} fontFamily="JetBrains Mono" tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Earnings']}
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
              <Bar dataKey="earnings" fill="#FF5A1F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Withdrawal History (4 records) */}
      <div>
        <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight mb-4">
          PAYOUT DISBURSEMENT HISTORY
        </h2>

        <div className="space-y-3">
          {payouts.map((p) => (
            <Card key={p.id} className="p-5 bg-white border border-[#D9D9D9] flex items-center justify-between rounded-nothing-sm hover:border-black transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] border border-[#D9D9D9] shadow-2xs">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A]">Withdrawal to {p.method}</h3>
                  <p className="text-xs text-[#4A4A4A] font-mono mt-0.5">
                    {p.id} • {p.date} • {p.account}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono text-base font-bold text-[#0A0A0A]">{p.amount}</p>
                <Badge variant="success">{p.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* WITHDRAW MODAL */}
      <Modal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        title="REQUEST WALLET WITHDRAWAL"
        subtitle={`Available balance: ₹${(worker?.walletBalance || 24500).toLocaleString()}`}
      >
        <form onSubmit={handleWithdraw} className="space-y-4">
          <Input
            label="Withdrawal Amount (₹ INR)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            required
          />

          <div className="p-3 bg-white rounded-nothing-sm border border-[#D9D9D9] text-xs text-[#4A4A4A] shadow-xs">
            Funds will be disbursed to: <strong className="text-[#0A0A0A]">rajesh.sharma@okaxis</strong> (Bank Account on file)
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setPayoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit" isLoading={isWithdrawing}>
              Confirm Withdrawal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
