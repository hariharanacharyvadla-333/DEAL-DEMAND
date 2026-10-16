import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { StatusDot } from '../ui/StatusDot';
import {
  PlusCircle,
  LogOut,
  User as UserIcon,
  Shield,
  Briefcase,
  Layers,
  Globe,
  Bell,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState('EN');

  const getPortalLink = () => {
    if (!role) return '/portal-select';
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'WORKER') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-1 group">
            <span className="font-dot text-2xl font-black tracking-tighter text-[#0A0A0A]">
              Deal<span className="text-[#FF5A1F] text-3xl leading-none">&</span>Demand
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF5A1F] ml-0.5 animate-pulse" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#0A0A0A]">
            <Link to="/customer/deals/feed" className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors">
              Browse Requirements
            </Link>
            <Link to="/customer/workers" className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors">
              Find Professionals
            </Link>
            <Link to="/commission" className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors">
              Fair Commission
            </Link>
            <Link to="/about" className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors">
              How It Works
            </Link>
          </nav>
        </div>

        {/* Right Section Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-white rounded-full p-0.5 text-xs font-mono border border-[#D9D9D9] shadow-xs">
            {['EN', 'HI', 'ML'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  lang === l ? 'bg-[#0A0A0A] text-white font-bold' : 'text-[#0A0A0A] hover:text-[#FF5A1F] font-semibold'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Portal Switcher Button */}
              <Link to={getPortalLink()}>
                <Button variant="secondary" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                  <span className="font-mono text-xs uppercase">{role} Portal</span>
                </Button>
              </Link>

              {role === 'CUSTOMER' && (
                <Link to="/customer/deals/new">
                  <Button variant="orange" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                    Post a Deal
                  </Button>
                </Link>
              )}

              {/* User Dropdown Preview */}
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-300"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold leading-tight text-neutral-900">{user.name}</p>
                  <p className="text-[10px] font-mono text-neutral-400 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-neutral-400 hover:text-alert transition-colors rounded-full hover:bg-neutral-100 ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/portal-select">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/customer/deals/new">
                <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4 text-[#FF5A1F]" />}>
                  Post a Deal
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-700 hover:text-black focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/customer/deals/feed"
            className="block text-sm font-medium text-neutral-800 py-2 border-b border-neutral-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Requirements
          </Link>
          <Link
            to="/customer/workers"
            className="block text-sm font-medium text-neutral-800 py-2 border-b border-neutral-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Professionals
          </Link>
          <Link
            to="/commission"
            className="block text-sm font-medium text-neutral-800 py-2 border-b border-neutral-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Commission Info
          </Link>
          {user ? (
            <div className="pt-2 flex flex-col gap-2">
              <Link to={getPortalLink()} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="md" className="w-full justify-center">
                  Go to {role} Dashboard
                </Button>
              </Link>
              <Button variant="danger" size="md" onClick={logout} className="w-full justify-center">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/portal-select" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full justify-center">
                  Sign In / Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
