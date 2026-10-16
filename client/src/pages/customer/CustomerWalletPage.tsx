import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Wallet,
  Coins,
  ShieldCheck,
  Tag,
  Download,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const CustomerWalletPage: React.FC = () => {
  const [couponCode, setCouponCode] = useState('');
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'FIRSTDEAL') {
      setCouponSuccess('Coupon FIRSTDEAL applied! 10% platform discount (up to ₹1,500) will be deducted at checkout.');
    } else if (couponCode.toUpperCase() === 'FESTIVE2026') {
      setCouponSuccess('Coupon FESTIVE2026 applied! 15% festive waiver credited.');
    } else {
      alert('Invalid or expired coupon code. Try FIRSTDEAL or FESTIVE2026.');
    }
  };

  const transactions = [
    {
      id: 'TXN-9812',
      date: '2026-10-08',
      type: 'Escrow Lock (Modular Kitchen)',
      amount: '₹145,000',
      status: 'HELD',
    },
    {
      id: 'TXN-7731',
      date: '2026-10-01',
      type: 'Milestone Release (False Ceiling)',
      amount: '₹28,000',
      status: 'RELEASED',
    },
    {
      id: 'TXN-5541',
      date: '2026-09-22',
      type: 'Deposit (Balcony Grill)',
      amount: '₹18,500',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          ESCROW WALLET & PAYMENTS
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Zero-risk payments secured by platform escrow middle-layer
        </p>
      </div>

      {/* Wallet Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">Currently in Escrow</span>
            <Coins className="w-5 h-5 text-[#FF5A1F]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">₹45,000</p>
          <span className="text-sm font-semibold text-[#10B981] mt-1.5 block">
            100% Protected until you approve
          </span>
        </Card>

        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">Completed Payments</span>
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">₹46,500</p>
          <span className="text-sm text-[#4A4A4A] mt-1.5 block font-medium">
            Paid upon milestone approval
          </span>
        </Card>

        <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">Reward Credits</span>
            <Tag className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">₹1,500</p>
          <span className="text-sm font-semibold text-amber-700 mt-1.5 block">
            Referral & coupon credits
          </span>
        </Card>
      </div>

      <Card className="p-6 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing-sm">
        <h3 className="text-base font-bold text-[#0A0A0A] mb-1">
          REDEEM PROMO CODE OR COUPON
        </h3>
        <p className="text-xs text-[#4A4A4A] mb-4">
          Available codes: <code className="text-[#0A0A0A] font-bold font-mono">FIRSTDEAL</code> (10% off) or <code className="text-[#0A0A0A] font-bold font-mono">FESTIVE2026</code>
        </p>

        <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <Input
            placeholder="Enter promo code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="uppercase"
            required
          />
          <Button variant="primary" type="submit" size="md">
            Apply Code
          </Button>
        </form>

        {couponSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-nothing-sm text-xs font-mono text-emerald-800">
            {couponSuccess}
          </div>
        )}
      </Card>

      {/* Escrow Transaction Ledger */}
      <div>
        <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight mb-4">
          TRANSACTION HISTORY & INVOICES
        </h2>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <Card
              key={tx.id}
              className="p-5 bg-white border-[#D9D9D9] flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] font-mono text-xs border border-[#D9D9D9] shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0A0A0A]">{tx.type}</h4>
                  <p className="text-xs font-mono text-[#4A4A4A]">
                    {tx.id} • {tx.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-mono text-base font-bold text-black">{tx.amount}</p>
                  <Badge variant={tx.status === 'HELD' ? 'orange' : 'success'}>
                    {tx.status}
                  </Badge>
                </div>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
                  title="Download Tax Invoice"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
