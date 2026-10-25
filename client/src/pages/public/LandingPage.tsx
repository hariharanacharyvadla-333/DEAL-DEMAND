import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { RatingStars } from '../../components/ui/RatingStars';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Wrench,
  ChevronDown,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [stats, setStats] = useState({
    activeDeals: 0,
    verifiedWorkers: 0,
    completedDeals: 0,
    escrowVolume: 0,
  });
  const [realWorkers, setRealWorkers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live categories from database
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .catch(() => {});

    // Fetch real platform stats from database
    fetch('/api/stats/public')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.stats) setStats(d.stats);
      })
      .catch(() => {});

    // Fetch verified workers from database
    fetch('/api/workers?verifiedOnly=true')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workers) setRealWorkers(d.workers);
      })
      .catch(() => {});
  }, []);

  const statsList = [
    { label: 'Active Requirements', value: stats.activeDeals.toString() },
    { label: 'Verified Artisans', value: stats.verifiedWorkers.toString() },
    { label: 'Completed Deals', value: stats.completedDeals.toString() },
    { label: 'Escrow Protected', value: `₹${stats.escrowVolume.toLocaleString()}` },
  ];

  const steps = [
    {
      num: '01',
      title: 'Post Your Requirement',
      desc: 'Describe what you need crafted, fixed or built. Our AI turns your keywords into detailed specs, material recommendations and fair price estimates.',
    },
    {
      num: '02',
      title: 'Compare Itemized Quotations',
      desc: 'Local verified professionals submit proposals with transparent breakdowns of material grades, skilled labour, transit and warranties.',
    },
    {
      num: '03',
      title: 'Escrow-Secured Completion',
      desc: 'Funds are securely locked in platform escrow. Money is released milestone-by-milestone only when you inspect the craft and approve the results.',
    },
  ];

  const faqs = [
    {
      q: 'How does platform Escrow protect my money?',
      a: 'When you accept a quotation, your deposit is safely locked in Deal&Demand platform escrow custody. The artisan is not paid until each agreed milestone is completed and you personally inspect and approve the work.',
    },
    {
      q: 'How does the AI Assistant help me post a deal?',
      a: 'If you only know basic keywords (e.g. "teak wood double door"), our AI suggests the exact wood grades, dimensions, hardware specifications, questions to ask workers, and fair price estimates in Indian Rupees.',
    },
    {
      q: 'How are workers and artisans verified?',
      a: 'Every worker partner must upload government identification (Aadhaar/PAN), past work photographs, and municipal trade licenses. Our admin desk manually reviews each document before issuing trust badges.',
    },
    {
      q: 'What if there is a dispute or delay during execution?',
      a: 'Our Admin Dispute Resolution desk acts as a neutral operational mediator. We examine on-site progress photos, milestone agreements, and chat logs to enforce refunds or split releases fairly.',
    },
    {
      q: 'How much is the platform commission?',
      a: 'Deal&Demand charges a competitive, transparent 4% to 5% commission on successfully completed orders. There are zero upfront listing fees for customers or worker partners.',
    },
    {
      q: 'When do workers receive payment?',
      a: 'Funds are credited to the worker’s platform wallet immediately when a customer approves a milestone. Workers can withdraw their balance directly to their bank account or UPI ID anytime.',
    },
    {
      q: 'Can I negotiate price and timeline before accepting?',
      a: 'Yes! Customers and artisans can communicate in our secure built-in chat to negotiate terms, request material samples, or adjust quotation itemizations prior to escrow deposit.',
    },
    {
      q: 'Are direct customer-worker phone numbers protected?',
      a: 'Yes. Until a quotation is formally accepted and escrow funds are placed in trust, phone numbers and personal emails are masked in chat to prevent bypass fraud and spam.',
    },
  ];

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-[#E5E5E5] bg-white hero-dot-grid w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] text-xs font-semibold text-[#0A0A0A] mb-8 shadow-xs">
            <StatusDot status="active" size="sm" />
            <span>AI-POWERED CRAFTSMANSHIP & SERVICES MARKETPLACE</span>
          </div>

          {/* Main Display Heading */}
          <h1 className="font-dot text-4xl sm:text-6xl lg:text-7xl font-black text-[#0A0A0A] tracking-tight max-w-5xl mx-auto leading-none mb-6">
            POST A DEAL. <br className="hidden sm:inline" />
            GET <span className="text-[#FF5A1F] underline decoration-[#FF5A1F] decoration-4 underline-offset-8">DEMANDED.</span>
          </h1>

          <p className="text-base sm:text-[18px] text-[#4A4A4A] max-w-2xl mx-auto mb-10 font-normal leading-relaxed text-center px-4">
            Connect directly with verified carpenters, fabricators, painters, and skilled tradesmen. Compare itemized quotations, lock funds in escrow, and get work done with total peace of mind.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/customer/deals/new">
              <Button variant="orange" size="lg" icon={<Sparkles className="w-5 h-5" />}>
                Post a Deal with AI Assistant
              </Button>
            </Link>
            <Link to="/portal-select">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-full bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-neutral-50 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                <span>Select Access Portal</span>
                <ArrowRight className="w-5 h-5 text-[#0A0A0A]" />
              </button>
            </Link>
          </div>

          {/* Real Live Stats Counters */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {statsList.map((s) => (
              <Card key={s.label} className="p-6 text-center border-[#D9D9D9] bg-white shadow-xs">
                <p className="font-dot text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-1 tracking-tight">
                  {s.value}
                </p>
                <p className="text-xs text-[#4A4A4A] font-medium uppercase tracking-wider">
                  {s.label}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-20 border-b border-[#E5E5E5] bg-[#F7F7F7] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
              STREAMLINED EXECUTION
            </span>
            <h2 className="font-dot text-3xl sm:text-4xl font-black text-[#0A0A0A] mt-2 tracking-tight">
              HOW DEAL&DEMAND WORKS
            </h2>
            <p className="text-sm text-[#4A4A4A] mt-2 leading-relaxed">
              Three clear stages designed for fair pricing, verified workmanship, and risk-free payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st) => (
              <Card key={st.num} className="p-8 bg-white border-[#D9D9D9] hover:border-black transition-all rounded-nothing">
                <span className="font-dot text-4xl font-black text-[#FF5A1F] block mb-4">
                  {st.num}
                </span>
                <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">
                  {st.title}
                </h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  {st.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="py-20 border-b border-[#E5E5E5] bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
                EXPERTISE DIRECTORY
              </span>
              <h2 className="font-dot text-3xl font-black text-[#0A0A0A] mt-1 tracking-tight">
                PHYSICAL PRODUCTS & LOCAL TRADES
              </h2>
            </div>
            <Link to="/customer/deals/feed" className="mt-4 md:mt-0 text-sm text-[#0A0A0A] hover:text-[#FF5A1F] flex items-center gap-1 font-semibold">
              Explore All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat.id}
                to={`/customer/deals/feed?category=${cat.slug}`}
                className="group p-5 rounded-nothing-sm border border-[#D9D9D9] bg-white hover:border-black hover:shadow-nothing-hover transition-all flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#D9D9D9] flex items-center justify-center text-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white transition-colors mb-4">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] group-hover:text-[#FF5A1F] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#4A4A4A] mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#4A4A4A]">
                    <span>Verified Pros</span>
                    <span className="text-[#0A0A0A] font-semibold">{cat.commissionPct || 5}% Escrow</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VERIFIED ARTISANS (ONLY SHOWN WHEN REAL WORKERS EXIST) */}
      {realWorkers.length > 0 && (
        <section className="py-20 border-b border-[#E5E5E5] bg-[#F7F7F7] w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
                  VERIFIED MASTER ARTISANS
                </span>
                <h2 className="font-dot text-3xl font-black text-[#0A0A0A] mt-1 tracking-tight">
                  FEATURED PROFESSIONALS ACROSS INDIA
                </h2>
              </div>
              <Link to="/customer/workers" className="mt-4 md:mt-0 text-sm text-[#0A0A0A] hover:text-[#FF5A1F] flex items-center gap-1 font-semibold">
                Browse All Artisans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {realWorkers.map((w) => (
                <Card key={w.id} className="p-6 bg-white border border-[#D9D9D9] hover:border-black hover:shadow-nothing-hover transition-all flex flex-col justify-between rounded-nothing">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 border border-[#D9D9D9] flex items-center justify-center font-bold text-lg text-[#0A0A0A]">
                        {w.user?.name?.charAt(0) || 'P'}
                      </div>
                      <Badge variant="verified">VERIFIED</Badge>
                    </div>

                    <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-1">
                      {w.user?.name}
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    </h3>
                    <p className="text-xs font-semibold text-[#4A4A4A] mt-0.5">
                      {w.categories?.[0]?.category?.name || 'Artisan'} • {w.yearsExperience} yrs exp
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-[#4A4A4A]">
                      <RatingStars value={w.rating} showNumber size="sm" />
                      <span>({w.totalReviews})</span>
                      <span>• {w.serviceArea}</span>
                    </div>

                    <p className="text-xs text-[#4A4A4A] mt-3 line-clamp-2 leading-relaxed">
                      {w.skills}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#D9D9D9]">
                    <Link to="/customer/deals/new" className="block">
                      <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                        Invite to Deal
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TRUST & SAFETY (ESCROW MIDDLE-LAYER) */}
      <section className="py-20 border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#0A0A0A] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
              ZERO-RISK COMMERCE
            </span>
            <h2 className="font-dot text-3xl sm:text-4xl font-black mt-2 tracking-tight text-[#0A0A0A]">
              OUR ADMIN ESCROW MIDDLE-LAYER
            </h2>
            <p className="text-[#4A4A4A] text-sm mt-3 leading-relaxed">
              Deal&Demand holds customer payments securely in escrow. Workers are paid milestone-by-milestone, giving workers guaranteed payment and customers full quality protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-nothing border border-[#D9D9D9] bg-white shadow-xs">
              <Lock className="w-8 h-8 text-[#FF5A1F] mb-4" />
              <h3 className="text-base font-bold text-[#0A0A0A] mb-2">
                100% Escrow Protection
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                Money stays safely secured with our escrow service. It is only released after you inspect the physical work and click Approve.
              </p>
            </div>

            <div className="p-7 rounded-nothing border border-[#D9D9D9] bg-white shadow-xs">
              <ShieldCheck className="w-8 h-8 text-[#10B981] mb-4" />
              <h3 className="text-base font-bold text-[#0A0A0A] mb-2">
                Manual KYC Verification
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                All artisans undergo identity verification (Aadhaar, PAN, trade registration) and past job portfolio audits before receiving badges.
              </p>
            </div>

            <div className="p-7 rounded-nothing border border-[#D9D9D9] bg-white shadow-xs">
              <Zap className="w-8 h-8 text-[#FF5A1F] mb-4" />
              <h3 className="text-base font-bold text-[#0A0A0A] mb-2">
                Rapid Dispute Mediation
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                If there is any defect or timeline failure, our admin mediation desk inspects photo evidence and chat history to enforce refunds or split releases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="py-20 border-b border-[#E5E5E5] bg-white w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
              COMMON QUESTIONS
            </span>
            <h2 className="font-dot text-3xl font-black text-[#0A0A0A] mt-1 tracking-tight">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="border border-[#D9D9D9] rounded-nothing-sm bg-white overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-base font-bold text-[#0A0A0A]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#4A4A4A] transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-black' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-[#4A4A4A] leading-relaxed border-t border-[#D9D9D9] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-24 bg-white hero-dot-grid text-center border-b border-[#E5E5E5] w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-dot text-3xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4">
            READY TO BUILD OR GET HIRED?
          </h2>
          <p className="text-[#4A4A4A] text-base max-w-xl mx-auto mb-8 font-normal">
            Join customers and skilled workers across India using Deal&Demand today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/customer/deals/new">
              <Button variant="orange" size="lg" icon={<Sparkles className="w-5 h-5" />}>
                Post a Deal with AI Assistant
              </Button>
            </Link>
            <Link to="/portal-select">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-full bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-neutral-50 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                <span>Select Access Portal</span>
                <ArrowRight className="w-5 h-5 text-[#0A0A0A]" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
