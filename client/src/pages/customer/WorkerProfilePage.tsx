import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Award,
  MessageSquare,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [worker, setWorker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await fetch(`/api/workers/${id}`);
        const data = await res.json();
        if (data.success) {
          setWorker(data.worker);
        }
      } catch (err) {
        console.error('Failed to fetch worker:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorker();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-56" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-16">
        <h3 className="font-dot text-xl font-bold">Worker profile not found</h3>
      </div>
    );
  }

  const portfolio = worker.portfolioItems || [];
  const reviews = worker.reviewsReceived || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Hero Header */}
      <Card className="p-8 bg-white border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={worker.user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160'}
              alt={worker.user?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-neutral-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-dot text-2xl font-black text-[#0A0A0A]">
                  {worker.user?.name}
                </h1>
                {worker.verificationState === 'VERIFIED' && (
                  <Badge variant="verified">VERIFIED PRO</Badge>
                )}
                {worker.badgeLevel === 'PREMIUM' && (
                  <Badge variant="premium">PREMIUM</Badge>
                )}
              </div>

              <p className="text-xs font-mono text-neutral-500 mb-2">
                {worker.categories?.[0]?.category?.name || 'Skilled Professional'} • {worker.yearsExperience} Years Experience
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-neutral-600">
                <RatingStars value={worker.rating} showNumber size="sm" />
                <span>• {worker.totalReviews} Reviews</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {worker.serviceArea}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/customer/deals/new">
              <Button variant="orange" size="md">
                Invite to Deal
              </Button>
            </Link>
          </div>
        </div>

        {/* Bio & Tagline */}
        <div className="pt-6">
          <h4 className="font-mono text-xs uppercase text-neutral-400 font-bold mb-2">
            About the Professional
          </h4>
          <p className="text-sm text-neutral-700 leading-relaxed max-w-3xl">
            {worker.bio || worker.tagline}
          </p>

          {worker.skills && (
            <div className="mt-4 flex flex-wrap gap-2">
              {worker.skills.split(',').map((skill: string, i: number) => (
                <span key={i} className="text-xs font-mono bg-white text-neutral-800 px-3 py-1 rounded-full border border-[#D9D9D9] shadow-2xs">
                  {skill.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Before & After Portfolio Gallery */}
      <div>
        <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight mb-4">
          PORTFOLIO & PREVIOUS WORK
        </h2>

        {portfolio.length === 0 ? (
          <Card className="p-8 text-center bg-white border-dashed border-[#D9D9D9]">
            <p className="text-xs font-mono text-neutral-500">No portfolio items added yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.map((item: any) => (
              <Card key={item.id} className="overflow-hidden bg-white border-[#D9D9D9] hover:border-black transition-all">
                <div className="relative aspect-video overflow-hidden bg-neutral-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  {item.beforeImageUrl && (
                    <span className="absolute bottom-2 left-2 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                      After Finished Craft
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="text-base font-bold text-[#0A0A0A] mb-1">{item.title}</h4>
                  <p className="text-xs text-[#4A4A4A] leading-relaxed">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews & Quality Dimensions */}
      <div>
        <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight mb-4">
          VERIFIED CUSTOMER REVIEWS ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <Card className="p-8 text-center bg-white border-dashed border-[#D9D9D9]">
            <p className="text-xs font-mono text-neutral-500">No customer reviews yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <Card key={r.id} className="p-6 bg-white border-[#D9D9D9]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.customer?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={r.customer?.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#0A0A0A]">
                        {r.customer?.name}
                      </h4>
                      <p className="text-xs text-[#4A4A4A]">
                        {r.customer?.city || 'Verified Buyer'} • {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <RatingStars value={r.overallRating} showNumber size="sm" />
                </div>

                {/* 4-Pillar Quality Breakdown */}
                <div className="flex flex-wrap gap-4 text-[11px] font-mono text-neutral-500 bg-white p-2.5 rounded-nothing-sm border border-[#D9D9D9] mb-3 shadow-2xs">
                  <span>Quality: <strong className="text-black">{r.ratingQuality}★</strong></span>
                  <span>Communication: <strong className="text-black">{r.ratingComm}★</strong></span>
                  <span>Timeliness: <strong className="text-black">{r.ratingTime}★</strong></span>
                  <span>Value: <strong className="text-black">{r.ratingValue}★</strong></span>
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed italic mb-3">
                  "{r.comment}"
                </p>

                {r.workerReply && (
                  <div className="p-3 bg-white rounded border border-[#D9D9D9] border-l-4 border-l-[#FF5A1F] text-xs text-neutral-600 shadow-2xs">
                    <span className="font-bold text-black font-mono">Artisan Reply:</span> {r.workerReply}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
