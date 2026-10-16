import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Wrench,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Upload,
  Coins,
  Check,
} from 'lucide-react';

export const WorkerProjectsPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Milestone Photo Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchWorkerProjects = async () => {
    try {
      const token = localStorage.getItem('dd_token');
      const res = await fetch('/api/quotations/my-quotations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Collect orders from accepted quotations
        const accepted = data.quotations.filter((q: any) => q.status === 'ACCEPTED' && q.orders?.length > 0);
        // Fetch order details for each
        const orderList = await Promise.all(
          accepted.map(async (q: any) => {
            const ordRes = await fetch(`/api/orders/${q.orders[0].id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const ordData = await ordRes.json();
            return ordData.order;
          })
        );
        setOrders(orderList.filter(Boolean));
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerProjects();
  }, []);

  const handleCompleteMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    setIsUpdating(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch(`/api/orders/${selectedMilestone.orderId}/milestones/${selectedMilestone.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photoUrl,
          status: 'WORKER_COMPLETED',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUploadModalOpen(false);
        fetchWorkerProjects();
      } else {
        alert(data.message || 'Failed to update progress.');
      }
    } catch (err) {
      alert('Error updating milestone progress.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          ONGOING CRAFTSMANSHIP PROJECTS
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Upload milestone progress photos to request client payouts
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-56" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-[#D9D9D9]">
          <Wrench className="w-10 h-10 text-[#4A4A4A] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0A0A0A] mb-1">
            No active project orders yet
          </h3>
          <p className="text-xs text-[#4A4A4A] max-w-md mx-auto">
            Once a customer accepts your quotation, the active milestone checklist will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {orders.map((ord) => (
            <Card key={ord.id} className="p-6 bg-white border-[#D9D9D9] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-neutral-400">{ord.orderNumber}</span>
                    <Badge variant={ord.status === 'COMPLETED' ? 'success' : 'orange'}>
                      {ord.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="font-dot text-xl font-bold text-neutral-900">{ord.requirement?.title}</h3>
                  <p className="text-xs font-mono text-neutral-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Client: {ord.customer?.name} ({ord.deliveryAddress})
                  </p>
                </div>

                <div className="md:text-right">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Your Net Payout</span>
                  <p className="font-mono text-2xl font-black text-black">
                    ₹{ord.workerNetPay.toLocaleString()}
                  </p>
                  <span className="text-[11px] font-mono text-[#10B981]">
                    5% platform fee deducted
                  </span>
                </div>
              </div>

              {/* Milestones list */}
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase text-neutral-400 font-bold block mb-2">
                  Project Milestones
                </span>

                {ord.milestones?.map((m: any, idx: number) => {
                  const isApproved = m.status === 'CUSTOMER_APPROVED' || m.status === 'PAYMENT_RELEASED';
                  const isSubmitted = m.status === 'WORKER_COMPLETED';

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-nothing-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isApproved
                          ? 'bg-white border-[#10B981]'
                          : isSubmitted
                          ? 'bg-white border-[#FF5A1F] shadow-xs'
                          : 'bg-white border-[#D9D9D9]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isApproved
                              ? 'bg-[#10B981] text-white'
                              : isSubmitted
                              ? 'bg-[#FF5A1F] text-white'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {isApproved ? <Check className="w-3.5 h-3.5" /> : `0${idx + 1}`}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#0A0A0A]">{m.title}</h4>
                          <p className="text-xs text-[#4A4A4A] line-clamp-1">{m.description}</p>
                          {m.photoUrl && (
                            <span className="text-[10px] font-mono text-[#FF5A1F] block mt-1">
                              ✓ Completion Photo Uploaded
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:justify-end shrink-0">
                        <span className="font-mono text-sm font-bold text-black">
                          ₹{m.amount.toLocaleString()}
                        </span>

                        {isApproved ? (
                          <Badge variant="success">APPROVED & PAID</Badge>
                        ) : isSubmitted ? (
                          <Badge variant="orange">PENDING CLIENT APPROVAL</Badge>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedMilestone({ ...m, orderId: ord.id });
                              setUploadModalOpen(true);
                            }}
                            icon={<Camera className="w-3.5 h-3.5 text-[#FF5A1F]" />}
                          >
                            Upload Proof & Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Milestone Proof Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="SUBMIT MILESTONE COMPLETION PROOF"
        subtitle={`Upload photo inspection evidence for ${selectedMilestone?.title}`}
      >
        <form onSubmit={handleCompleteMilestone} className="space-y-4">
          <Input
            label="Photo Evidence URL (or sample)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            required
          />

          <div className="border border-neutral-200 rounded p-2 text-center">
            <img src={photoUrl} alt="Inspection Proof" className="max-h-48 mx-auto rounded object-cover" />
          </div>

          <p className="text-xs font-mono text-neutral-500">
            Submitting marks this milestone as ready. The customer will inspect and approve funds release to your wallet.
          </p>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit" isLoading={isUpdating}>
              Submit for Customer Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
