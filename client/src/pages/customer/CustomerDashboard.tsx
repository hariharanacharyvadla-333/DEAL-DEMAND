import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  PlusCircle,
  FolderKanban,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Coins,
  ChevronRight,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [recommendedWorkers, setRecommendedWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const [dealsRes, workersRes] = await Promise.all([
          fetch('/api/deals/my-deals', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/workers?verifiedOnly=true'),
        ]);

        const dealsData = await dealsRes.json();
        const workersData = await workersRes.json();

        if (dealsData.success) setDeals(dealsData.deals);
        if (workersData.success) setRecommendedWorkers(workersData.workers.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute metrics
  const activeDeals = deals.filter((d) => d.status !== 'COMPLETED' && d.status !== 'CANCELLED');
  const totalQuotations = deals.reduce((sum, d) => sum + (d.quotations?.length || 0), 0);
  const ongoingProjects = deals.filter((d) => d.status === 'IN_PROGRESS' || d.status === 'WORKER_SELECTED');
  const totalEscrowHeld = deals.reduce((acc, d) => {
    const orderHeld = d.orders?.reduce((sum: number, o: any) => sum + (o.escrow?.status === 'HELD' ? (o.escrow?.amountHeld || 0) : 0), 0) || 0;
    return acc + orderHeld;
  }, 0);

  return (
    <div className="space-y-8 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
              {t('customer.dashboardTitle', 'CUSTOMER COMMAND CENTER')}
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <p className="text-sm font-mono text-[#4A4A4A] mt-1 font-medium">
            {user?.name || 'Customer'} • {user?.city || 'Bengaluru, India'} • {t('common.escrowSecured', 'Escrow Secured')}
          </p>
        </div>

        <Link to="/customer/deals/new" className="shrink-0">
          <Button variant="orange" size="md" icon={<PlusCircle className="w-4 h-4" />}>
            {t('customer.postNewDeal', 'Post a New Deal')}
          </Button>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">{t('customer.activeRequirements', 'Active Deals')}</span>
            <FolderKanban className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            {formatNumber(activeDeals.length, i18n.language)}
          </p>
          <span className="text-sm text-[#4A4A4A] mt-1.5 block font-medium">Live in marketplace</span>
        </Card>

        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">{t('customer.totalQuotations', 'Quotes Received')}</span>
            <FileText className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            {formatNumber(totalQuotations, i18n.language)}
          </p>
          <span className="text-sm text-[#4A4A4A] mt-1.5 block font-medium">Awaiting comparison</span>
        </Card>

        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">{t('common.inProgress', 'In Progress')}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            {formatNumber(ongoingProjects.length, i18n.language)}
          </p>
          <span className="text-sm text-[#4A4A4A] mt-1.5 block font-medium">Milestones active</span>
        </Card>

        <Card className="p-5 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          <div className="flex items-center justify-between text-[#4A4A4A] mb-2">
            <span className="font-mono text-xs font-semibold uppercase">{t('customer.fundsInEscrow', 'Escrow Held')}</span>
            <Coins className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="font-sans text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            {formatCurrency(totalEscrowHeld || 0, i18n.language)}
          </p>
          <span className="text-sm font-semibold text-[#10B981] mt-1.5 block">100% Protected</span>
        </Card>
      </div>

      {/* Active Deals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-dot text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight">
            {t('customer.activeRequirements', 'YOUR ACTIVE REQUIREMENTS')}
          </h2>
          <Link to="/customer/deals" className="text-xs sm:text-sm font-mono text-[#4A4A4A] hover:text-[#0A0A0A] flex items-center gap-1 font-semibold">
            {t('common.view', 'View All')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : deals.length === 0 ? (
          <Card className="p-10 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <FolderKanban className="w-10 h-10 text-[#FF5A1F] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">{t('customer.noDealsYet', "You haven't posted any requirements yet")}</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto mb-5 leading-relaxed font-normal">
              {t('customer.postYourFirstDeal', 'Post your first physical craft or local service requirement to start receiving competitive itemized quotations from verified artisans.')}
            </p>
            <div className="flex justify-center">
              <Link to="/customer/deals/new">
                <Button variant="orange" size="md" icon={<PlusCircle className="w-4 h-4" />}>
                  {t('customer.postNewDeal', 'Post Your First Deal')}
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.slice(0, 4).map((deal) => {
              const quotesCount = deal.quotations?.length || 0;
              return (
                <Card
                  key={deal.id}
                  className="p-5 bg-white border border-[#D9D9D9] shadow-xs hover:border-black transition-all flex flex-col justify-between rounded-nothing"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono bg-white text-[#0A0A0A] px-2.5 py-0.5 rounded-full font-semibold border border-[#D9D9D9]">
                        {deal.category?.name || 'General Craft'}
                      </span>
                      <Badge
                        variant={
                          deal.status === 'COMPLETED'
                            ? 'success'
                            : deal.status === 'IN_PROGRESS'
                            ? 'orange'
                            : 'default'
                        }
                      >
                        {deal.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-[#0A0A0A] mb-1 line-clamp-1">
                      {deal.title}
                    </h3>
                    <p className="text-sm text-[#4A4A4A] line-clamp-2 mb-4 leading-relaxed font-normal">
                      {deal.description}
                    </p>
                  </div>

                  <div className="border-t border-[#D9D9D9] pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-[#4A4A4A]">Budget Range</p>
                      <p className="font-mono text-sm font-bold text-[#0A0A0A]">
                        ₹{deal.minBudget.toLocaleString()} - ₹{deal.maxBudget.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {quotesCount > 0 ? (
                        <Link to={`/customer/deals/${deal.id}/compare`}>
                          <Button variant="orange" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                            Compare ({quotesCount})
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/customer/deals/${deal.id}`}>
                          <Button variant="outline" size="sm">
                            View Status
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Verified Workers (6 Artisans) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-dot text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight">
            TOP-RATED VERIFIED ARTISANS NEAR YOU
          </h2>
          <Link to="/customer/workers" className="text-xs sm:text-sm font-mono text-[#4A4A4A] hover:text-[#0A0A0A] flex items-center gap-1 font-semibold">
            Browse Directory <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedWorkers.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-[#4A4A4A] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">No verified artisans yet</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto mb-4 leading-relaxed font-normal">
              New artisans are currently undergoing KYC verification by administrators. Once approved, top-rated craftspeople will appear here.
            </p>
            <Link to="/customer/deals/new">
              <Button variant="outline" size="sm">
                Post a Requirement to Invite Artisans
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedWorkers.map((worker) => (
              <Card
                key={worker.id}
                className="p-5 bg-white border border-[#D9D9D9] hover:border-black hover:shadow-nothing-hover transition-all flex flex-col justify-between rounded-nothing"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                      alt={worker.user?.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#D9D9D9]"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-[#0A0A0A] truncate flex items-center gap-1">
                        {worker.user?.name}
                        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                      </h4>
                      <p className="text-xs text-[#4A4A4A] truncate font-medium">
                        {worker.categories?.[0]?.category?.name || 'Artisan'} • {worker.serviceArea || 'Bengaluru'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#4A4A4A] line-clamp-2 mb-3 leading-relaxed">
                    {worker.tagline || worker.bio}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono text-[#4A4A4A] border-t border-[#E5E5E5] pt-2 mb-4 font-medium">
                    <RatingStars value={worker.rating} showNumber size="sm" />
                    <span>{worker.jobsCompleted} completed jobs</span>
                  </div>
                </div>

                <Link to={`/customer/workers/${worker.id}`}>
                  <Button variant="secondary" size="sm" className="w-full justify-center text-xs font-semibold">
                    View Portfolio
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
