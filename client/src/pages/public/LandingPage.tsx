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
  Hammer,
  Flame,
  Paintbrush,
  BrickWall,
  Wrench,
  Compass,
  Utensils,
  ChevronDown,
  Clock,
  MapPin,
  Lock,
  Quote,
  Star,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Verified Artisans', value: '25+' },
    { label: 'Physical Deals Posted', value: '17+' },
    { label: 'Metros & Cities', value: '8' },
    { label: 'Escrow Protected', value: '100%' },
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

  const featuredWorkers = [
    {
      name: 'Rajesh Sharma',
      trade: 'Master Carpenter',
      city: 'Bengaluru',
      exp: '14 yrs exp',
      rating: 4.9,
      reviews: 38,
      badge: 'PREMIUM',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160',
      skills: 'CP Teak Doors, Modular Wardrobes, Antique Polish',
    },
    {
      name: 'Girish Naidu',
      trade: 'Heritage Wood Carver',
      city: 'Hyderabad',
      exp: '16 yrs exp',
      rating: 4.9,
      reviews: 42,
      badge: 'PREMIUM',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160',
      skills: 'Rosewood Carving, Heritage Pillars, Teak Beds',
    },
    {
      name: 'Vikas Kumar',
      trade: 'Master Wall Decorator',
      city: 'Mumbai',
      exp: '8 yrs exp',
      rating: 4.9,
      reviews: 35,
      badge: 'PREMIUM',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160',
      skills: 'Royale Texture Art, PU Polishing, Weatherproofing',
    },
    {
      name: 'Harpreet Singh',
      trade: 'Smart Home Electrician',
      city: 'Delhi NCR',
      exp: '9 yrs exp',
      rating: 4.9,
      reviews: 52,
      badge: 'PREMIUM',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160',
      skills: 'Schneider Wiring, Inverters, Home Automation',
    },
    {
      name: 'Suresh Babu',
      trade: 'Metal Fabricator',
      city: 'Bengaluru',
      exp: '10 yrs exp',
      rating: 4.8,
      reviews: 29,
      badge: 'VERIFIED',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160',
      skills: 'Laser Cut SS Panels, MS Compound Gates, Railings',
    },
    {
      name: 'Farhan Ali',
      trade: 'Licensed Sanitary Plumber',
      city: 'Delhi NCR',
      exp: '12 yrs exp',
      rating: 4.7,
      reviews: 41,
      badge: 'VERIFIED',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160',
      skills: 'Jaquar Concealed Diverters, Pressure Pumps, Drainage',
    },
    {
      name: 'Gopal Krishnan',
      trade: 'Marble & Tiling Master',
      city: 'Kochi',
      exp: '15 yrs exp',
      rating: 4.8,
      reviews: 33,
      badge: 'VERIFIED',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160',
      skills: 'Italian Marble Mirror Polishing, Large Format Tiles',
    },
    {
      name: 'Anand Murthy',
      trade: 'Turnkey Modular Kitchens',
      city: 'Bengaluru',
      exp: '10 yrs exp',
      rating: 4.9,
      reviews: 36,
      badge: 'PREMIUM',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160',
      skills: 'BWP Marine Ply, Blum Tandembox, Quartz Slabs',
    },
  ];

  const testimonials = [
    {
      name: 'Ramesh & Sunita Kulkarni',
      location: 'Whitefield, Bengaluru',
      role: 'Customer • Custom Teak Double Door',
      text: 'We were nervous about paying high advances upfront for custom teak carpentry. Deal&Demand’s milestone escrow changed everything. Rajesh Sharma executed magnificent carving and we released funds only after installation.',
      rating: 5,
    },
    {
      name: 'Priya Venkataraman',
      location: 'Chetpet, Chennai',
      role: 'Customer • 12mm Shower Partitions',
      text: 'Comparing itemized quotes side-by-side was so refreshing. Every carpenter and glass fitter listed their exact material brand and hardware. No hidden markup or surprise extras.',
      rating: 5,
    },
    {
      name: 'Amit & Neha Sharma',
      location: 'Greater Kailash, Delhi NCR',
      role: 'Customer • Full Concealed Rewiring',
      text: 'Our electrician Harpreet completed the entire 3-phase rewiring on schedule. The platform photo proof verification before releasing milestone payments kept everyone accountable.',
      rating: 5,
    },
    {
      name: 'Rajesh Sharma',
      location: 'Bengaluru',
      role: 'Worker Partner • Master Carpenter',
      text: 'As an artisan with 14 years in the trade, Deal&Demand gives me serious clients who value quality woodwork. Payment is guaranteed in escrow before I even cut the first plank of teak.',
      rating: 5,
    },
    {
      name: 'Deepak Verma',
      location: 'Mumbai',
      role: 'Worker Partner • Waterproofing Specialist',
      text: 'The quotation builder allows me to specify chemicals, warranty terms, and labour clearly. Fair commission, verified customers, and instant UPI payouts to my bank.',
      rating: 5,
    },
    {
      name: 'Anand Murthy',
      location: 'Bengaluru',
      role: 'Worker Partner • Modular Kitchen Artisan',
      text: 'The AI match algorithm connected me to clients who specifically needed marine-grade BWP kitchens with Blum fittings. Closed 3 large orders in my first month.',
      rating: 5,
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

          {/* Live Stats Counters */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s) => (
              <Card key={s.label} className="p-6 text-center border-[#D9D9D9] bg-white shadow-xs">
                <p className="font-dot text-3xl sm:text-4xl font-black text-[#0A0A0A] mb-1 tracking-tight">
                  {s.value}
                </p>
                <p className="text-xs uppercase font-semibold tracking-wider text-[#4A4A4A]">
                  {s.label}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP PROCESS */}
      <section className="py-20 border-b border-[#E5E5E5] bg-[#F7F7F7] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
              STREAMLINED WORKFLOW
            </span>
            <h2 className="font-dot text-3xl font-black text-[#0A0A0A] mt-2 tracking-tight">
              HOW DEAL&DEMAND WORKS
            </h2>
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
                    <span className="text-[#0A0A0A] font-semibold">5% Escrow</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED TOP-RATED WORKERS (8 PROS) */}
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
              Browse All 25+ Artisans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWorkers.map((w) => (
              <Card key={w.name} className="p-6 bg-white border border-[#D9D9D9] hover:border-black hover:shadow-nothing-hover transition-all flex flex-col justify-between rounded-nothing">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <img
                      src={w.image}
                      alt={w.name}
                      className="w-14 h-14 rounded-full object-cover border border-[#D9D9D9]"
                    />
                    <Badge variant={w.badge === 'PREMIUM' ? 'premium' : 'verified'}>
                      {w.badge}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-1">
                    {w.name}
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  </h3>
                  <p className="text-xs font-semibold text-[#4A4A4A] mt-0.5">
                    {w.trade} • {w.exp}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-[#4A4A4A]">
                    <RatingStars value={w.rating} showNumber size="sm" />
                    <span>({w.reviews})</span>
                    <span>• {w.city}</span>
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

      {/* 5. SAMPLE DEAL & QUOTATION COMPARISON PREVIEW */}
      <section className="py-20 border-b border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
              TRANSPARENT COMPARISON
            </span>
            <h2 className="font-dot text-3xl font-black text-[#0A0A0A] mt-2 tracking-tight">
              COMPARE REAL QUOTATIONS SIDE-BY-SIDE
            </h2>
            <p className="text-sm text-[#4A4A4A] mt-2 leading-relaxed">
              Every bid contains explicit itemized material, labour, logistics and tax costs. No hidden surcharges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Quote Card 1: Rajesh Sharma */}
            <Card className="p-6 bg-white border border-[#D9D9D9] hover:border-black transition-all rounded-nothing">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120"
                    alt="Rajesh Sharma"
                    className="w-12 h-12 rounded-full object-cover border border-[#D9D9D9]"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-1.5">
                      Rajesh Sharma
                      <Badge variant="verified">VERIFIED</Badge>
                    </h3>
                    <p className="text-xs text-[#4A4A4A] font-medium">Master Carpenter • 14 yrs exp</p>
                  </div>
                </div>
                <Badge variant="orange">AI BEST QUALITY</Badge>
              </div>

              <div className="border-t border-b border-dashed border-[#D9D9D9] py-3 my-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-[#4A4A4A] font-semibold">Total Price Quote:</span>
                  <span className="font-mono text-xl font-bold text-[#0A0A0A]">₹42,000</span>
                </div>
                <div className="space-y-1.5 text-xs text-[#2A2A2A]">
                  <div className="flex justify-between">
                    <span>Grade-A CP Teak Timber:</span>
                    <span className="font-mono font-semibold">₹24,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Master Joinery Labour:</span>
                    <span className="font-mono font-semibold">₹12,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hafele Brass Hinges & Lock:</span>
                    <span className="font-mono font-semibold">₹3,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transit & Site Fitting:</span>
                    <span className="font-mono font-semibold">₹2,500</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#4A4A4A] mb-5 font-semibold">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#4A4A4A]" /> 7 Days</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> 36 Months Warranty</span>
              </div>

              <Link to="/customer/deals/new">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  Post Similar Requirement
                </Button>
              </Link>
            </Card>

            {/* Quote Card 2: Girish Naidu */}
            <Card className="p-6 bg-white border border-[#D9D9D9] hover:border-black transition-all rounded-nothing">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"
                    alt="Girish Naidu"
                    className="w-12 h-12 rounded-full object-cover border border-[#D9D9D9]"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-1.5">
                      Girish Naidu
                      <Badge variant="verified">VERIFIED</Badge>
                    </h3>
                    <p className="text-xs text-[#4A4A4A] font-medium">Heritage Wood Carver • 16 yrs exp</p>
                  </div>
                </div>
                <Badge variant="fast">FASTEST DELIVERY</Badge>
              </div>

              <div className="border-t border-b border-dashed border-[#D9D9D9] py-3 my-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-[#4A4A4A] font-semibold">Total Price Quote:</span>
                  <span className="font-mono text-xl font-bold text-[#0A0A0A]">₹38,500</span>
                </div>
                <div className="space-y-1.5 text-xs text-[#2A2A2A]">
                  <div className="flex justify-between">
                    <span>Seasoned Timber & Carcass:</span>
                    <span className="font-mono font-semibold">₹21,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carpentry Execution:</span>
                    <span className="font-mono font-semibold">₹11,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Melamine Matte Polish:</span>
                    <span className="font-mono font-semibold">₹4,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Transport & Setup:</span>
                    <span className="font-mono font-semibold">₹2,000</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#4A4A4A] mb-5 font-semibold">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> 5 Days</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> 24 Months Warranty</span>
              </div>

              <Link to="/customer/deals/new">
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  Post Similar Requirement
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. TRUST & SAFETY (ESCROW MIDDLE-LAYER) */}
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

      {/* 7. REAL TESTIMONIALS (6 TESTIMONIALS) */}
      <section className="py-20 border-b border-[#E5E5E5] bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
              VERIFIED EXPERIENCES
            </span>
            <h2 className="font-dot text-3xl font-black text-[#0A0A0A] mt-2 tracking-tight">
              WHAT HOMEOWNERS & ARTISANS SAY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="p-6 bg-white border border-[#D9D9D9] hover:border-black transition-all flex flex-col justify-between rounded-nothing">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-5 h-5 text-neutral-300" />
                  </div>
                  <p className="text-sm text-[#2A2A2A] leading-relaxed italic mb-6">
                    "{t.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D9D9D9]">
                  <h3 className="text-sm font-bold text-[#0A0A0A]">{t.name}</h3>
                  <p className="text-xs text-[#4A4A4A] mt-0.5">{t.role}</p>
                  <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {t.location}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION (8 ITEMS) */}
      <section className="py-20 border-b border-[#E5E5E5] bg-[#F7F7F7] w-full">
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

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-24 bg-white hero-dot-grid text-center border-b border-[#E5E5E5] w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-dot text-3xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight mb-4">
            READY TO BUILD OR GET HIRED?
          </h2>
          <p className="text-[#4A4A4A] text-base max-w-xl mx-auto mb-8 font-normal">
            Join thousands of customers and skilled workers across India using Deal&Demand today.
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
