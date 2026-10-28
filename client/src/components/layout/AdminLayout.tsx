import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import {
  ShieldAlert,
  BarChart3,
  UserCheck2,
  Coins,
  Scale,
  Users2,
  FolderTree,
  FileClock,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: t('admin.dashboardTitle'), path: '/admin/dashboard', icon: BarChart3 },
    { label: 'KYC Verifications', path: '/admin/verifications', icon: UserCheck2, highlight: true },
    { label: 'Escrow & Deliveries', path: '/admin/escrow', icon: Coins },
    { label: t('admin.openDisputes'), path: '/admin/disputes', icon: Scale },
    { label: t('admin.userManagement'), path: '/admin/users', icon: Users2 },
    { label: 'Category & Fields', path: '/admin/categories', icon: FolderTree },
    { label: t('admin.auditTrail'), path: '/admin/audit', icon: FileClock },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white text-[#0A0A0A] flex flex-col shrink-0 border-r border-[#E5E5E5]">
        <div className="p-6 border-b border-[#E5E5E5]">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-dot text-xl font-bold tracking-tight text-[#0A0A0A]">
              Deal<span className="text-[#FF5A1F] text-2xl leading-none">&</span>Demand
            </span>
          </Link>
          <div className="mt-3 flex items-center justify-between bg-white px-3 py-1.5 rounded-full border border-[#D9D9D9] shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#4A4A4A]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Admin Escrow Desk</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-nothing-sm text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white font-semibold shadow-xs'
                    : 'text-[#4A4A4A] hover:bg-neutral-100 hover:text-[#0A0A0A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#4A4A4A]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="font-mono text-[10px] bg-[#FFF1EB] text-[#FF5A1F] px-1.5 py-0.2 rounded-full uppercase border border-[#FF5A1F]/30 font-semibold">QUEUE</span>
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
              alt={user?.name || 'Admin'}
              className="w-9 h-9 rounded-full object-cover border border-[#D9D9D9]"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#0A0A0A] truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] font-mono text-[#4A4A4A]">Master Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono text-[#4A4A4A] hover:text-[#E1251B] hover:bg-red-50 rounded-nothing-sm transition-colors border border-[#D9D9D9]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Admin Console
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 border-b border-[#E5E5E5] px-6 flex items-center justify-between bg-white/90 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>ADMIN CONSOLE</span>
            <ChevronRight className="w-3 h-3 text-neutral-300" />
            <span className="text-black uppercase font-bold">{location.pathname.split('/')[2] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher size="sm" />
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>ESCROW AUDIT LEDGER ACTIVE</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
