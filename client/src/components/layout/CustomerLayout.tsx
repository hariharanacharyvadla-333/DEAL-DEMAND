import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Search,
  Users,
  PackageCheck,
  MessageSquare,
  Wallet,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
} from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Post a Deal', path: '/customer/deals/new', icon: PlusCircle, highlight: true },
    { label: 'My Deals', path: '/customer/deals', icon: FolderKanban },
    { label: 'Browse Feed', path: '/customer/deals/feed', icon: Search },
    { label: 'Find Workers', path: '/customer/workers', icon: Users },
    { label: 'Projects & Orders', path: '/customer/orders', icon: PackageCheck },
    { label: 'Live Chat', path: '/customer/chat', icon: MessageSquare },
    { label: 'Escrow Wallet', path: '/customer/wallet', icon: Wallet },
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
            <span className="text-xs font-mono font-medium text-[#4A4A4A]">Customer Portal</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/customer/dashboard' && location.pathname.startsWith(item.path));
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
                  <span className="font-mono text-[10px] bg-[#FF5A1F] text-white px-1.5 py-0.2 rounded-full uppercase font-semibold">NEW</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#E5E5E5] bg-white">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name || 'Customer'}
              className="w-10 h-10 rounded-full object-cover border border-[#D9D9D9]"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#0A0A0A] truncate">{user?.name || 'Customer'}</p>
              <p className="text-[11px] font-mono text-[#4A4A4A] truncate">{user?.city || 'Bengaluru, India'}</p>
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
        {/* Top bar */}
        <header className="h-16 border-b border-[#E5E5E5] px-4 sm:px-6 flex items-center justify-between bg-white/90 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-mono text-[#4A4A4A]">
            <span>PORTAL</span>
            <ChevronRight className="w-3 h-3 text-[#A3A3A3]" />
            <span className="text-[#0A0A0A] uppercase font-bold">{location.pathname.split('/')[2] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/customer/deals/new">
              <button className="bg-[#FF5A1F] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#E04810] flex items-center gap-1.5 shadow-xs transition-all">
                <PlusCircle className="w-3.5 h-3.5" />
                Post New Deal
              </button>
            </Link>
          </div>
        </header>

        {/* Child Router Outlet */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
