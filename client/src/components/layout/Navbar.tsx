import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import {
  PlusCircle,
  LogOut,
  Layers,
  Menu,
  X,
  Compass,
  Users,
  Percent,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPortalLink = () => {
    if (!role) return '/portal-select';
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'WORKER') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  const getPortalLabel = () => {
    if (role === 'ADMIN') return t('nav.adminPortal');
    if (role === 'WORKER') return t('nav.workerPortal');
    return t('nav.customerPortal');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <Link to="/" className="flex items-center gap-1 shrink-0 group">
            <span className="font-dot text-xl sm:text-2xl font-black tracking-tight text-[#0A0A0A]">
              Deal<span className="text-[#FF5A1F] text-2xl sm:text-3xl leading-none">&</span>Demand
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF5A1F] ml-0.5 animate-pulse" />
          </Link>

          {/* Desktop Nav Links (No wrap, sharp contrast) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs xl:text-sm font-semibold text-[#0A0A0A] whitespace-nowrap">
            <Link
              to="/customer/deals/feed"
              className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors whitespace-nowrap"
            >
              {t('nav.browseRequirements')}
            </Link>
            <Link
              to="/customer/workers"
              className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors whitespace-nowrap"
            >
              {t('nav.findProfessionals')}
            </Link>
            <Link
              to="/commission"
              className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors whitespace-nowrap"
            >
              {t('nav.fairCommission')}
            </Link>
            <Link
              to="/about"
              className="text-[#0A0A0A] hover:text-[#FF5A1F] transition-colors whitespace-nowrap"
            >
              {t('nav.howItWorks')}
            </Link>
          </nav>
        </div>

        {/* Right Actions & Controls */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
          {/* Language Switcher Pill */}
          <LanguageSwitcher size="sm" />

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Portal Switcher Button */}
              <Link to={getPortalLink()} className="shrink-0">
                <Button variant="secondary" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                  <span className="font-mono text-xs uppercase whitespace-nowrap">
                    {getPortalLabel()}
                  </span>
                </Button>
              </Link>

              {role === 'CUSTOMER' && (
                <Link to="/customer/deals/new" className="shrink-0 hidden xl:block">
                  <Button variant="orange" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />}>
                    <span className="whitespace-nowrap">{t('nav.postADeal')}</span>
                  </Button>
                </Link>
              )}

              {/* User Dropdown Preview */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5E5] shrink-0">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#D9D9D9]"
                />
                <div className="text-left hidden 2xl:block max-w-[100px] truncate">
                  <p className="text-xs font-bold leading-tight text-[#0A0A0A] truncate">{user.name}</p>
                  <p className="text-[10px] font-mono text-[#4A4A4A] capitalize">{user.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 text-[#4A4A4A] hover:text-red-600 transition-colors rounded-full hover:bg-neutral-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/portal-select">
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link to="/customer/deals/new">
                <Button variant="orange" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />} className="whitespace-nowrap">
                  {t('nav.postADeal')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Language Controls */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher size="sm" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0A0A0A] hover:text-[#FF5A1F] focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5E5E5] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <nav className="space-y-1">
            <Link
              to="/customer/deals/feed"
              className="flex items-center gap-2.5 text-sm font-semibold text-[#0A0A0A] py-2.5 border-b border-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Compass className="w-4 h-4 text-[#FF5A1F]" />
              <span>{t('nav.browseRequirements')}</span>
            </Link>
            <Link
              to="/customer/workers"
              className="flex items-center gap-2.5 text-sm font-semibold text-[#0A0A0A] py-2.5 border-b border-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="w-4 h-4 text-[#FF5A1F]" />
              <span>{t('nav.findProfessionals')}</span>
            </Link>
            <Link
              to="/commission"
              className="flex items-center gap-2.5 text-sm font-semibold text-[#0A0A0A] py-2.5 border-b border-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Percent className="w-4 h-4 text-[#FF5A1F]" />
              <span>{t('nav.fairCommission')}</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2.5 text-sm font-semibold text-[#0A0A0A] py-2.5 border-b border-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HelpCircle className="w-4 h-4 text-[#FF5A1F]" />
              <span>{t('nav.howItWorks')}</span>
            </Link>
          </nav>

          <div className="pt-2">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link to={getPortalLink()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full justify-center">
                    {getPortalLabel()}
                  </Button>
                </Link>
                {role === 'CUSTOMER' && (
                  <Link to="/customer/deals/new" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="orange" size="md" className="w-full justify-center" icon={<PlusCircle className="w-4 h-4" />}>
                      {t('nav.postADeal')}
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="md" onClick={logout} className="w-full justify-center text-red-600 border-red-200">
                  {t('nav.signOut')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/portal-select" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full justify-center">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/customer/deals/new" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="orange" size="md" className="w-full justify-center" icon={<PlusCircle className="w-4 h-4" />}>
                    {t('nav.postADeal')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
