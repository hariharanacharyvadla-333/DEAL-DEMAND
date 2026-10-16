import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F7F7F7] text-[#0A0A0A] border-t border-[#E5E5E5] pt-16 pb-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E5E5E5]">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-1 mb-4">
              <span className="font-dot text-2xl font-black text-[#0A0A0A]">
                Deal<span className="text-[#FF5A1F] text-3xl leading-none">&</span>Demand
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#FF5A1F] ml-1" />
            </Link>
            <p className="text-[#4A4A4A] text-sm mb-6 leading-relaxed">
              India's premier AI-powered marketplace connecting customers who need physical products or local services with verified craftsmen and skilled professionals.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0A0A0A]">
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#D9D9D9] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Escrow Secured
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#D9D9D9] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" /> AI Powered
              </span>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] mb-4">
              Marketplace
            </h4>
            <ul className="space-y-3 text-sm text-[#4A4A4A]">
              <li><Link to="/customer/deals/feed" className="hover:text-[#0A0A0A] font-medium transition-colors">Browse Requirements</Link></li>
              <li><Link to="/customer/workers" className="hover:text-[#0A0A0A] font-medium transition-colors">Verified Professionals</Link></li>
              <li><Link to="/customer/deals/new" className="hover:text-[#0A0A0A] font-medium transition-colors">Post a Deal</Link></li>
              <li><Link to="/commission" className="hover:text-[#0A0A0A] font-medium transition-colors">Pricing & Commission</Link></li>
            </ul>
          </div>

          {/* Dedicated Portals */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] mb-4">
              Portals
            </h4>
            <ul className="space-y-3 text-sm text-[#4A4A4A]">
              <li><Link to="/login?role=customer" className="hover:text-[#0A0A0A] font-medium transition-colors">Customer Portal</Link></li>
              <li><Link to="/login?role=worker" className="hover:text-[#0A0A0A] font-medium transition-colors">Worker Partner Portal</Link></li>
              <li><Link to="/portal-select" className="hover:text-[#0A0A0A] font-medium transition-colors">Select Access Portal</Link></li>
              <li><Link to="/about" className="hover:text-[#0A0A0A] font-medium transition-colors">How Escrow Works</Link></li>
            </ul>
          </div>

          {/* Platform Trust & Safety */}
          <div className="bg-white p-5 rounded-nothing-sm border border-[#D9D9D9] shadow-xs text-sm">
            <div className="flex items-center gap-2 text-[#0A0A0A] font-bold mb-3">
              <Lock className="w-4 h-4 text-[#FF5A1F]" />
              <span>PLATFORM ASSURANCE</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#4A4A4A] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                <span>Funds held in middle-layer escrow until milestone approval.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                <span>Manual government ID & trade license verification for artisans.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                <span>Dedicated administrative dispute mediation desk.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#4A4A4A] gap-4">
          <p>© 2026 Deal&Demand Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-[#0A0A0A] font-medium transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-[#0A0A0A] font-medium transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-[#0A0A0A] font-medium transition-colors">Dispute Resolution Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
