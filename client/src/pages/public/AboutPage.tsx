import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Sparkles, Hammer, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 space-y-12 bg-white">
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="orange" className="mb-3">OUR PURPOSE</Badge>
        <h1 className="font-dot text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4">
          EMPOWERING CRAFTSMANSHIP WITH AI & ESCROW
        </h1>
        <p className="text-base text-neutral-600 leading-relaxed font-normal">
          Deal&Demand was built to solve the age-old trust problem in physical craftsmanship and local trade services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-white border-[#D9D9D9] shadow-xs">
          <Hammer className="w-8 h-8 text-[#FF5A1F] mb-4" />
          <h3 className="font-dot text-lg font-bold text-neutral-900 mb-2">Artisan First</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            We help skilled carpenters, welders, painters, and masons showcase their real craft, earn dignified incomes, and grow sustainable businesses.
          </p>
        </Card>

        <Card className="p-8 bg-white border-[#D9D9D9] shadow-xs">
          <ShieldCheck className="w-8 h-8 text-[#10B981] mb-4" />
          <h3 className="font-dot text-lg font-bold text-neutral-900 mb-2">Zero-Risk Escrow</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Customers never lose money to incomplete work, and workers are guaranteed full payment once milestones are delivered.
          </p>
        </Card>

        <Card className="p-8 bg-white border-[#D9D9D9] shadow-xs">
          <Sparkles className="w-8 h-8 text-black mb-4" />
          <h3 className="font-dot text-lg font-bold text-neutral-900 mb-2">AI Specifications</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Our AI helps customers express complex craftsmanship parameters with clarity, producing structured briefs and fair pricing models.
          </p>
        </Card>
      </div>
    </div>
  );
};
