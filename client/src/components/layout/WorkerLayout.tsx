import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  FileText,
  Wrench,
  Wallet,
  UserCheck,
  MessageSquare,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const WorkerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const worker = user?.workerProfile;

  const navItems = [
    { label: 'Dashboard', path: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Browse Deals', path: '/worker/feed', icon: Compass, highlight: true },
    { label: 'My Quotations', path: '/worker/quotes', icon: FileText },
    { label: 'Active Projects', path: '/worker/projects', icon: Wrench },
    { label: 'Earnings & Escrow', path: '/worker/earnings', icon: Wallet },
    { label: 'Profile & KYC', path: '/worker/profile', icon: UserCheck },
    { label: 'Live Chat', path: '/worker/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E5E5E5] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#E5E5E5]">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-dot text-xl font-bold tracking-tight text-[#0A0A0A]">
              Deal<span className="text-[#FF5A1F] text-2xl leading-none">&</span>Demand
            </span>
          </Link>
          <div className="mt-3 flex items-center justify-between bg-white px-3 py-1.5 rounded-full border border-[#D9D9D9] shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-medium text-[#4A4A4A]">Worker Partner</span>
              {worker?.verificationState === 'VERIFIED' && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              )}
            </div>
            <span className="text-[10px] font-mono bg-white text-[#0A0A0A] px-2 py-0.5 rounded-full uppercase border border-[#E5E5E5] font-semibold">
              {worker?.badgeLevel || 'BASIC'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/worker/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-nothing-sm text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white shadow-xs font-semibold'
                    : item.highlight
                    ? 'bg-[#FFF1EB] text-[#FF5A1F] hover:bg-[#FFE5DC]'
                    : 'text-[#4A4A4A] hover:bg-neutral-100 hover:text-[#0A0A0A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#FF5A1F]' : 'text-[#4A4A4A]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="font-mono text-[10px] bg-[#FF5A1F] text-white px-1.5 py-0.2 rounded-full uppercase font-semibold">FEED</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Worker Balance Widget */}
        <div className="p-4 border-t border-[#E5E5E5] bg-white">
          <div className="bg-white p-3 rounded-nothing-sm border border-[#D9D9D9] mb-3 shadow-xs">
            <p className="text-[10px] font-mono text-[#4A4A4A] uppercase font-semibold">Available Balance</p>
            <p className="font-mono text-base font-bold text-[#0A0A0A]">
              ₹{(worker?.walletBalance || 0).toLocaleString()}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#4A4A4A] border-t border-dashed border-[#E5E5E5] pt-1">
              <span>Pending Escrow:</span>
              <span className="text-[#FF5A1F] font-semibold">₹{(worker?.pendingEscrow || 0).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono text-[#4A4A4A] hover:text-[#E1251B] hover:bg-red-50 rounded-nothing-sm transition-colors border border-[#D9D9D9]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-x-hidden">
        <header className="h-16 border-b border-[#E5E5E5] px-4 sm:px-6 flex items-center justify-between bg-white/90 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-mono text-[#4A4A4A]">
            <span>WORKER</span>
            <ChevronRight className="w-3 h-3 text-[#A3A3A3]" />
            <span className="text-[#0A0A0A] uppercase font-bold">{location.pathname.split('/')[2] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/worker/feed">
              <button className="bg-[#0A0A0A] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs transition-all">
                <Compass className="w-3.5 h-3.5 text-[#FF5A1F]" />
                Browse Work
              </button>
            </Link>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
