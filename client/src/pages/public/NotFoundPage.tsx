import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] bg-white hero-dot-grid flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-[#D9D9D9] p-8 sm:p-10 text-center shadow-xs rounded-nothing">
        {/* Status Capsule */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] text-xs font-semibold text-[#0A0A0A] mb-6">
          <StatusDot status="urgent" size="sm" />
          <span className="font-mono tracking-wider">ERROR 404 // NOT FOUND</span>
        </div>

        {/* Big Dot Font 404 */}
        <h1 className="font-dot text-7xl sm:text-8xl font-black text-[#0A0A0A] tracking-tighter mb-2">
          404
        </h1>

        <h2 className="font-dot text-xl sm:text-2xl font-bold text-[#FF5A1F] tracking-tight mb-3">
          {t('errors.pageNotFound', 'Page Not Found')}
        </h2>

        <p className="text-sm text-[#4A4A4A] leading-relaxed mb-8 font-normal">
          The requested page or route does not exist. Your active deals, quotations, and escrow balances remain safely secured.
        </p>

        {/* Navigation Action Buttons */}
        <div className="space-y-3">
          <Link to="/" className="block w-full">
            <Button
              variant="orange"
              size="md"
              className="w-full justify-center text-sm font-semibold py-3"
              icon={<Home className="w-4 h-4" />}
            >
              {t('errors.backToHome', 'Back to Home')}
            </Button>
          </Link>

          <Link to="/portal-select" className="block w-full">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center text-sm font-semibold py-2.5 bg-white border-[#D9D9D9] hover:bg-neutral-50 hover:border-[#0A0A0A]"
              icon={<Compass className="w-4 h-4" />}
            >
              {t('auth.selectRole', 'Select Your Portal')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
