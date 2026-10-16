import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Check, ShieldCheck } from 'lucide-react';

export const CommissionPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-12 bg-white">
      <div className="text-center">
        <Badge variant="orange" className="mb-2">TRANSPARENT ECONOMICS</Badge>
        <h1 className="font-dot text-4xl font-black text-[#0A0A0A] tracking-tight mb-3">
          FAIR COMMISSION POLICY
        </h1>
        <p className="text-sm font-mono text-neutral-500 max-w-lg mx-auto">
          We charge only a nominal 4% to 5% platform commission on completed, satisfied jobs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-white border-[#D9D9D9] space-y-4 shadow-xs">
          <h3 className="font-dot text-lg font-bold text-neutral-900">For Customers</h3>
          <p className="font-mono text-3xl font-black text-[#0A0A0A]">0% FEE</p>
          <ul className="text-xs font-mono text-neutral-600 space-y-2">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Free deal posting with AI assistant</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Free quotation comparisons</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> 100% Escrow security included</li>
          </ul>
        </Card>

        <Card className="p-8 bg-white text-[#0A0A0A] border border-[#D9D9D9] space-y-4 shadow-xs rounded-nothing">
          <h3 className="font-dot text-lg font-bold text-[#0A0A0A]">For Worker Partners</h3>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#FF5A1F]">4.5% - 5.0%</p>
          <ul className="text-sm font-medium text-[#4A4A4A] space-y-2">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FF5A1F]" /> Deducted only upon milestone approval</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FF5A1F]" /> Zero fee if deal cancelled or unpaid</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FF5A1F]" /> Covers payment gateway & dispute mediation</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
