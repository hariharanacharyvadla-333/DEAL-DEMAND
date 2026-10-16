import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  User,
  Wrench,
  Shield,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const PortalSelectPage: React.FC = () => {
  const portals = [
    {
      role: 'CUSTOMER',
      title: 'Customer Portal',
      subtitle: 'Post physical deals, compare quotations side-by-side & pay securely via milestone escrow.',
      icon: User,
      badgeText: 'CUSTOMER',
      loginLink: '/login?role=customer',
      registerLink: '/register?role=customer',
      btnVariant: 'primary' as const,
      features: [
        '5-Step Deal Wizard with AI Scope & Specs Estimator',
        'Side-by-side Itemized Quotation Comparison Matrix',
        'Milestone-based 100% Escrow Protection',
        'Direct Chat with Identity & Contact Protection',
      ],
    },
    {
      role: 'WORKER',
      title: 'Worker Partner Portal',
      subtitle: 'Browse real client requirements, submit transparent itemized proposals & grow your trade business.',
      icon: Wrench,
      badgeText: 'WORKER PRO',
      loginLink: '/login?role=worker',
      registerLink: '/register?role=worker',
      btnVariant: 'orange' as const,
      features: [
        'Live Requirements Feed with AI Match Scoring',
        'Itemized Quotation Builder (Materials, Labour, Transport)',
        'Milestone Completion & Photo Proof Verification',
        'Direct Wallet Balance with Bank & UPI Payouts',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8 relative flex flex-col justify-center">
      {/* Discreet Fixed Top-Left Admin Shield Icon Button */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/admin/login"
          title="Admin Login"
          aria-label="Admin login"
          className="w-10 h-10 rounded-full border border-[#D9D9D9] bg-white hover:bg-neutral-100 hover:border-[#0A0A0A] flex items-center justify-center transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-[#4A4A4A] hover:text-[#0A0A0A]"
        >
          <Shield className="w-4 h-4 stroke-[2]" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-3">
            <span className="font-dot text-2xl font-black text-[#0A0A0A] tracking-tight">
              Deal<span className="text-[#FF5A1F] text-3xl leading-none">&</span>Demand
            </span>
          </Link>
          <h1 className="font-dot text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight">
            SELECT ACCESS PORTAL
          </h1>
          <p className="text-[#4A4A4A] text-sm mt-2 font-normal">
            Choose your dedicated workspace to enter the marketplace
          </p>
        </div>

        {/* 2 Centered Equal-Width Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Card
                key={portal.role}
                className="p-8 bg-white border border-[#D9D9D9] hover:border-[#0A0A0A] hover:shadow-nothing-hover transition-all flex flex-col justify-between rounded-nothing"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xs ${
                        portal.role === 'WORKER' ? 'bg-[#FF5A1F]' : 'bg-[#0A0A0A]'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={portal.role === 'WORKER' ? 'orange' : 'default'} className="font-semibold text-xs">
                      {portal.badgeText}
                    </Badge>
                  </div>

                  <h2 className="font-dot text-2xl font-black text-[#0A0A0A] mb-2 tracking-tight">
                    {portal.title}
                  </h2>
                  <p className="text-sm text-[#4A4A4A] mb-6 leading-relaxed">
                    {portal.subtitle}
                  </p>

                  <div className="border-t border-[#D9D9D9] pt-5 mb-8">
                    <p className="text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-3">
                      Core Workspace Capabilities:
                    </p>
                    <ul className="space-y-3">
                      {portal.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-[#2A2A2A] font-normal">
                          <span className="w-2 h-2 rounded-full bg-[#FF5A1F] mt-1.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link to={portal.loginLink} className="block">
                    <Button
                      variant={portal.btnVariant}
                      size="md"
                      className="w-full justify-center text-sm font-semibold py-3"
                    >
                      Sign In to {portal.title}
                    </Button>
                  </Link>

                  <Link to={portal.registerLink} className="block">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full justify-center text-sm font-semibold py-2.5 bg-white border-[#D9D9D9] hover:bg-neutral-50 hover:border-[#0A0A0A]"
                    >
                      Create New Account
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-xs font-semibold text-[#4A4A4A] hover:text-[#0A0A0A] transition-colors">
            ← Back to Deal&Demand Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
