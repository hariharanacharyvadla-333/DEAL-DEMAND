import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  allowedRole?: Role | Role[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole, children }) => {
  const { user, isLoading, isAuthenticated, role, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#FF5A1F] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#0A0A0A]">Authenticating session...</p>
        <p className="text-xs text-[#4A4A4A] mt-1">Verifying your secure credentials</p>
      </div>
    );
  }

  // Not authenticated -> redirect to appropriate login
  if (!isAuthenticated || !user) {
    let redirectPath = '/login?role=customer';
    if (allowedRole === 'ADMIN') {
      redirectPath = '/admin/login';
    } else if (allowedRole === 'WORKER') {
      redirectPath = '/login?role=worker';
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Role verification
  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    const hasRequiredRole = role && roles.includes(role);

    if (!hasRequiredRole) {
      const userDashboard =
        role === 'ADMIN'
          ? '/admin/dashboard'
          : role === 'WORKER'
          ? '/worker/dashboard'
          : '/customer/dashboard';

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#D9D9D9] rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-[#E1251B] flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0A0A0A] mb-2">Access Restricted</h2>
            <p className="text-sm text-[#4A4A4A] mb-6 leading-relaxed">
              You are signed in as a <span className="font-semibold text-[#0A0A0A] capitalize">{role?.toLowerCase()}</span>.
              This portal requires <span className="font-semibold text-[#0A0A0A] capitalize">{roles.join(' or ').toLowerCase()}</span> access.
            </p>
            <div className="space-y-3">
              <Link to={userDashboard} className="block w-full">
                <Button variant="primary" className="w-full justify-center">
                  Go to My Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={logout}
                className="w-full justify-center text-[#4A4A4A] hover:text-[#0A0A0A]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out & Switch Account
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
