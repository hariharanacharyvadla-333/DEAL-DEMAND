import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  UserCheck2,
  ShieldCheck,
  Check,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminVerificationsPage: React.FC = () => {
  const toast = useToast();
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [badgeLevel, setBadgeLevel] = useState('VERIFIED');
  const [adminNote, setAdminNote] = useState('Documents validated with official UIDAI and Municipal records.');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('dd_token');
      const res = await fetch('/api/admin/verifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setQueue(data.queue);
      }
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleUpdateStatus = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!selectedWorker) return;
    setIsUpdating(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch(`/api/admin/verifications/${selectedWorker.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          badgeLevel: status === 'VERIFIED' ? badgeLevel : 'NONE',
          adminNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Artisan ${status === 'VERIFIED' ? 'verified successfully' : 'verification rejected'}.`);
        setReviewModalOpen(false);
        fetchQueue();
      } else {
        toast.error(data.message || 'Failed to update verification status.');
      }
    } catch (err) {
      toast.error('Error updating status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          WORKER KYC VERIFICATION QUEUE
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Review artisan identity proofs, trade licenses, and issue trust badges
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : queue.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-[#10B981] mb-3" />
          <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">No workers to verify</h3>
          <p className="text-sm text-[#4A4A4A] max-w-md mx-auto leading-relaxed font-normal">
            All registered artisan KYC applications have been reviewed. When new workers complete registration and upload identity proofs, they will appear in this queue.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((w) => {
            const isPending = w.verificationState === 'PENDING';
            const docs = w.kycDocuments || [];

            return (
              <Card
                key={w.id}
                className={`p-6 bg-white border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isPending ? 'border-[#FF5A1F] shadow-xs' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={w.user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                    alt={w.user?.name}
                    className="w-14 h-14 rounded-full object-cover border border-neutral-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0A0A0A]">
                        {w.user?.name}
                      </h3>
                      <Badge
                        variant={
                          w.verificationState === 'VERIFIED'
                            ? 'success'
                            : w.verificationState === 'NEEDS_MORE_INFO'
                            ? 'default'
                            : 'orange'
                        }
                      >
                        {w.verificationState}
                      </Badge>
                      <Badge variant={w.badgeLevel === 'PREMIUM' ? 'premium' : 'default'}>
                        {w.badgeLevel}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#4A4A4A] mb-2 font-medium">
                      Email: {w.user?.email} • Phone: {w.user?.phone || 'N/A'} • {w.serviceArea}
                    </p>

                    {/* Attached KYC Docs tags */}
                    <div className="flex flex-wrap gap-2">
                      {docs.map((doc: any) => (
                        <span
                          key={doc.id}
                          className="text-[11px] font-mono bg-white text-neutral-700 px-2.5 py-1 rounded-full border border-[#D9D9D9] shadow-2xs flex items-center gap-1.5"
                        >
                          <FileText className="w-3 h-3 text-[#FF5A1F]" />
                          {doc.docType} ({doc.docNumber || 'Uploaded'})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedWorker(w);
                      setReviewModalOpen(true);
                    }}
                  >
                    Inspect & Review
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* KYC Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="VERIFY ARTISAN CREDENTIALS"
        subtitle={`Reviewing ${selectedWorker?.user?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-nothing-sm border border-[#D9D9D9] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span>Artisan Name:</span>
              <strong className="text-black">{selectedWorker?.user?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span>Service Area:</span>
              <span className="text-black">{selectedWorker?.serviceArea}</span>
            </div>
            <div className="flex justify-between">
              <span>Skills:</span>
              <span className="text-black">{selectedWorker?.skills}</span>
            </div>
          </div>

          {selectedWorker?.kycDocuments && selectedWorker.kycDocuments.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-[#4A4A4A]">
                Uploaded ID & Certification Proofs:
              </label>
              <div className="space-y-1.5">
                {selectedWorker.kycDocuments.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2.5 border border-[#D9D9D9] rounded-nothing-sm text-xs bg-[#FAFAFA]">
                    <span className="font-mono text-[#0A0A0A] font-medium">{doc.docType}: {doc.docNumber || 'Proof File'}</span>
                    {doc.docUrl && (
                      <a href={doc.docUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1">
                        View Document <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1">
              Assign Verification Badge Level
            </label>
            <Select
              options={[
                { value: 'BASIC', label: 'Basic Badge (Unverified ID)' },
                { value: 'VERIFIED', label: 'Verified Badge (Aadhaar & Trade Approved)' },
                { value: 'PREMIUM', label: 'Premium Gold Badge (Top Tier Verified)' },
              ]}
              value={badgeLevel}
              onChange={(e) => setBadgeLevel(e.target.value)}
            />
          </div>

          <Input
            label="Administrative Audit Note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button
              variant="danger"
              type="button"
              isLoading={isUpdating}
              onClick={() => handleUpdateStatus('REJECTED')}
            >
              Reject KYC
            </Button>
            <Button
              variant="orange"
              type="button"
              isLoading={isUpdating}
              onClick={() => handleUpdateStatus('VERIFIED')}
              icon={<Check className="w-4 h-4" />}
            >
              Approve & Grant Badge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
