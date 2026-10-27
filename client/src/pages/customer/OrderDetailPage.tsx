import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  MessageSquare,
  AlertTriangle,
  Star,
  Camera,
  Coins,
  MapPin,
  Truck,
  Check,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingComm, setRatingComm] = useState(5);
  const [ratingTime, setRatingTime] = useState(5);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('dd_token');
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Approve Milestone Handler
  const handleApproveMilestone = async (milestoneId: string) => {
    if (!window.confirm('Approve milestone and release funds to artisan wallet?')) return;
    setIsApproving(milestoneId);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch(`/api/orders/${id}/milestones/${milestoneId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchOrder();
      } else {
        alert(data.message || 'Failed to approve milestone.');
      }
    } catch (err) {
      alert('Error approving milestone.');
    } finally {
      setIsApproving(null);
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/orders/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          ratingQuality,
          ratingComm,
          ratingTime,
          ratingValue,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewModalOpen(false);
        fetchOrder();
      } else {
        alert(data.message || 'Failed to publish review.');
      }
    } catch (err) {
      alert('Error submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Submit Dispute Handler
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason) return;
    setIsSubmittingDispute(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/orders/dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          reason: disputeReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDisputeModalOpen(false);
        fetchOrder();
      } else {
        alert(data.message || 'Failed to file dispute.');
      }
    } catch (err) {
      alert('Error filing dispute.');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-44" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h3 className="font-dot text-xl font-bold">Order not found</h3>
      </div>
    );
  }

  const milestones = order.milestones || [];
  const allMilestonesApproved = milestones.length > 0 && milestones.every((m: any) => m.status === 'CUSTOMER_APPROVED' || m.status === 'PAYMENT_RELEASED');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Order Contract Header */}
      <Card className="p-6 bg-white border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-neutral-400">
                {order.orderNumber}
              </span>
              <Badge variant={order.status === 'COMPLETED' ? 'success' : 'orange'}>
                {order.status.replace('_', ' ')}
              </Badge>
              <Badge variant="verified">100% ESCROW SECURED</Badge>
            </div>

            <h1 className="font-dot text-2xl font-black text-[#0A0A0A] tracking-tight">
              {order.requirement?.title}
            </h1>

            <p className="text-xs font-mono text-neutral-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Delivery Address: {order.deliveryAddress}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Total Contract Value</span>
            <p className="font-mono text-2xl font-black text-black">
              ₹{order.totalAmount.toLocaleString()}
            </p>
            <span className="text-[11px] font-mono text-[#10B981] block mt-0.5">
              Funds locked in Escrow
            </span>
          </div>
        </div>

        {/* Worker Info Card */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={order.worker?.user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
              alt={order.worker?.user?.name}
              className="w-12 h-12 rounded-full object-cover border border-neutral-200"
            />
            <div>
              <h4 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-1.5">
                {order.worker?.user?.name}
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              </h4>
              <p className="text-xs text-[#4A4A4A]">
                Phone: {order.worker?.user?.phone || 'Revealed upon acceptance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/customer/chat?dealId=${order.requirementId}&workerId=${order.workerId}`}>
              <Button variant="outline" size="sm" icon={<MessageSquare className="w-3.5 h-3.5" />}>
                Live Chat
              </Button>
            </Link>
            {order.status !== 'COMPLETED' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-alert hover:bg-red-50"
                onClick={() => setDisputeModalOpen(true)}
              >
                Dispute Desk
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Project Milestones Execution Tracker */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight">
              PROJECT MILESTONES & RELEASES
            </h2>
            <p className="text-xs font-mono text-neutral-500">
              Inspect artisan progress photos and release milestone payouts
            </p>
          </div>

          {allMilestonesApproved && !order.review && (
            <Button
              variant="orange"
              size="sm"
              onClick={() => setReviewModalOpen(true)}
              icon={<Star className="w-3.5 h-3.5" />}
            >
              Write 4-Metric Review
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {milestones.map((m: any, idx: number) => {
            const isApproved = m.status === 'CUSTOMER_APPROVED' || m.status === 'PAYMENT_RELEASED';
            const isCompletedByWorker = m.status === 'WORKER_COMPLETED';

            return (
              <Card
                key={m.id}
                className={`p-6 bg-white border-2 transition-all ${
                  isApproved
                    ? 'border-[#10B981] bg-white'
                    : isCompletedByWorker
                    ? 'border-[#FF5A1F] shadow-sm'
                    : 'border-[#D9D9D9]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isApproved
                          ? 'bg-[#10B981] text-white'
                          : isCompletedByWorker
                          ? 'bg-[#FF5A1F] text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {isApproved ? <Check className="w-4 h-4 stroke-[3]" /> : `0${idx + 1}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-[#0A0A0A]">
                          {m.title}
                        </h4>
                        <Badge
                          variant={
                            isApproved
                              ? 'success'
                              : isCompletedByWorker
                              ? 'orange'
                              : 'default'
                          }
                        >
                          {m.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed mb-2 max-w-xl">
                        {m.description}
                      </p>

                      {/* Photo evidence if uploaded */}
                      {m.photoUrl && (
                        <div className="mt-2">
                          <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block mb-1">
                            Artisan Progress Photo:
                          </span>
                          <a href={m.photoUrl} target="_blank" rel="noreferrer">
                            <img
                              src={m.photoUrl}
                              alt="Milestone progress"
                              className="w-32 h-24 object-cover rounded border border-neutral-300 hover:opacity-90 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Approval Action */}
                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-neutral-100 pt-3 md:pt-0 shrink-0">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Milestone Escrow</span>
                    <p className="font-mono text-xl font-bold text-black mb-3">
                      ₹{m.amount.toLocaleString()}
                    </p>

                    {isApproved ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#10B981] font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Funds Released
                      </span>
                    ) : isCompletedByWorker ? (
                      <Button
                        variant="orange"
                        size="sm"
                        isLoading={isApproving === m.id}
                        onClick={() => handleApproveMilestone(m.id)}
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve & Release Funds
                      </Button>
                    ) : (
                      <span className="text-xs font-mono text-neutral-400">
                        Work in progress...
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Review Box (if already submitted) */}
      {order.review && (
        <Card className="p-6 bg-white border-[#D9D9D9] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-[#0A0A0A]">
              YOUR PUBLISHED REVIEW
            </h4>
            <RatingStars value={order.review.overallRating} showNumber size="md" />
          </div>
          <p className="text-sm text-neutral-700 italic mb-3">
            "{order.review.comment}"
          </p>
          {order.review.workerReply && (
            <div className="p-3 bg-white rounded border border-[#D9D9D9] text-xs text-neutral-600">
              <span className="font-bold text-black">Artisan Reply:</span> "{order.review.workerReply}"
            </div>
          )}
        </Card>
      )}

      {/* 4-DIMENSION REVIEW MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="RATE ARTISAN CRAFTSMANSHIP"
        subtitle="Evaluate across our 4 core quality pillars"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="space-y-3 bg-white p-4 rounded-nothing-sm border border-[#D9D9D9] text-xs font-mono">
            <div className="flex items-center justify-between">
              <span>Workmanship Quality:</span>
              <RatingStars value={ratingQuality} onChange={setRatingQuality} readOnly={false} />
            </div>
            <div className="flex items-center justify-between">
              <span>Communication & Politeness:</span>
              <RatingStars value={ratingComm} onChange={setRatingComm} readOnly={false} />
            </div>
            <div className="flex items-center justify-between">
              <span>Punctuality & Timeliness:</span>
              <RatingStars value={ratingTime} onChange={setRatingTime} readOnly={false} />
            </div>
            <div className="flex items-center justify-between">
              <span>Value for Money:</span>
              <RatingStars value={ratingValue} onChange={setRatingValue} readOnly={false} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1">
              Written Testimonial
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Describe your satisfaction with the finish, alignment, and professionalism..."
              className="w-full bg-white border border-[#D9D9D9] rounded-nothing-sm p-3 text-xs focus:outline-none focus:border-black"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit" isLoading={isSubmittingReview}>
              Publish Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* DISPUTE MODAL */}
      <Modal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        title="ESCALATE TO DISPUTE MEDIATION"
        subtitle="Our admin escrow middle-layer will review evidence and enforce resolution"
      >
        <form onSubmit={handleSubmitDispute} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1">
              Dispute Reason & Specific Breach
            </label>
            <textarea
              rows={4}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe what went wrong (defective materials, unfinished milestones, unresponsiveness)..."
              className="w-full bg-white border border-[#D9D9D9] rounded-nothing-sm p-3 text-xs focus:outline-none focus:border-black"
              required
            />
          </div>

          <p className="text-[11px] font-mono text-neutral-500">
            Escrow payouts are immediately frozen until admin mediation completes.
          </p>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setDisputeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" isLoading={isSubmittingDispute}>
              Submit Dispute
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
