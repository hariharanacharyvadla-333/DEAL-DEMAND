import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  defaultRole?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultRole }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin') || defaultRole === 'admin';
  const initialRole = isAdminRoute ? 'admin' : (searchParams.get('role') || 'customer');

  const [role, setRole] = useState<string>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdminRoute) {
      setRole('admin');
    }
  }, [isAdminRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please verify your email and password.');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);

      // Redirect based on user role
      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'WORKER') {
        navigate('/worker/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setError('Network connection error. Ensure the platform server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      {/* Top Right Language Switcher */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSwitcher size="sm" />
      </div>

      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-dot text-2xl font-black text-[#0A0A0A] tracking-tight">
              Deal<span className="text-[#FF5A1F] text-3xl leading-none">&</span>Demand
            </span>
          </Link>
          <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
            {role === 'admin' ? t('admin.dashboardTitle', 'ADMIN ESCROW LOGIN') : t('auth.loginTitle', 'SIGN IN TO PORTAL')}
          </h1>
          <p className="text-sm text-[#4A4A4A] mt-1.5 font-normal">
            {role === 'admin'
              ? 'Enter authorized administrator credentials to manage platform escrow'
              : t('auth.loginSubtitle', 'Access your secure marketplace workspace')}
          </p>
        </div>

        {/* Role Toggle */}
        {!isAdminRoute ? (
          <div className="flex bg-white p-1 rounded-full border border-[#D9D9D9] mb-6 text-sm font-medium shadow-xs">
            <button
              type="button"
              onClick={() => {
                setRole('customer');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                role === 'customer' ? 'bg-[#0A0A0A] text-[#FFFFFF] shadow-xs' : 'text-[#4A4A4A] hover:text-[#0A0A0A]'
              }`}
            >
              {t('nav.customerPortal', 'Customer')}
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('worker');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                role === 'worker' ? 'bg-[#FF5A1F] text-[#FFFFFF] shadow-xs' : 'text-[#4A4A4A] hover:text-[#0A0A0A]'
              }`}
            >
              {t('nav.workerPortal', 'Worker Partner')}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-6 p-2 rounded-full bg-white border border-[#D9D9D9] text-xs font-semibold text-[#0A0A0A] shadow-xs">
            <Shield className="w-4 h-4 text-[#FF5A1F]" />
            <span>Restricted Internal Escrow Console</span>
          </div>
        )}

        <Card className="p-8 bg-white border border-[#D9D9D9] shadow-sm rounded-nothing">
          {error && (
            <div className="mb-5 p-3.5 rounded-nothing-sm bg-red-50 border border-red-300 text-sm text-[#E1251B] font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label={t('auth.email', 'Email Address')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                prefixIcon={<Mail className="w-4 h-4 text-[#4A4A4A]" />}
                required
              />
            </div>

            <div>
              <Input
                label={t('auth.password', 'Password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                prefixIcon={<Lock className="w-4 h-4 text-[#4A4A4A]" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant={role === 'worker' ? 'orange' : 'primary'}
              size="md"
              isLoading={isLoading}
              className="w-full justify-center text-sm font-semibold py-3 mt-2"
            >
              {role === 'admin'
                ? t('nav.signIn', 'Sign In as Administrator')
                : `${t('nav.signIn', 'Sign In')} → ${role === 'worker' ? t('nav.workerPortal', 'Worker') : t('nav.customerPortal', 'Customer')}`}
            </Button>
          </form>

          {role !== 'admin' ? (
            <div className="mt-6 text-center text-sm text-[#4A4A4A] border-t border-[#D9D9D9] pt-5 font-normal">
              {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
              <Link to={`/register?role=${role}`} className="text-[#0A0A0A] font-semibold hover:underline">
                {t('auth.signUpNow', 'Create new account')}
              </Link>
            </div>
          ) : (
            <div className="mt-6 text-center text-xs text-[#4A4A4A] border-t border-[#D9D9D9] pt-5">
              <Link to="/portal-select" className="text-[#0A0A0A] font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Portal Selection
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
