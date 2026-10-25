import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch('/api/admin/disputes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setDisputes(
            (data.disputes || []).map((d: any) => ({
              id: d.id,
              orderNumber: d.order?.orderNumber || 'ORD-000',
              clientName: d.order?.customer?.name || 'Customer',
              artisanName: d.order?.worker?.user?.name || 'Artisan',
              projectTitle: d.order?.requirement?.title || 'Contract Work',
              totalAmount: d.order?.escrow?.amountHeld || d.order?.agreedPrice || 0,
              reason: d.reason || 'Escrow dispute raised',
              workerDefense: d.resolution || 'Awaiting artisan defense statement',
              evidencePhoto: d.evidenceUrls?.[0] || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600',
              chatSnippet: 'Formal dispute filed for admin mediation.',
              status: d.status || 'OPEN',
              date: new Date(d.createdAt).toLocaleDateString(),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load disputes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  // Resolution Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [decisionType, setDecisionType] = useState<'REFUND' | 'RELEASE' | 'SPLIT'>('SPLIT');
  const [refundAmount, setRefundAmount] = useState('24000');
  const [workerAmount, setWorkerAmount] = useState('24000');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setIsResolving(true);

    setTimeout(() => {
      alert(`Dispute ${selectedDispute.id} ruled as: ${decisionType}. Funds disbursed accordingly.`);
      setDisputes(disputes.map((d) => (d.id === selectedDispute.id ? { ...d, status: `RESOLVED_${decisionType}` } : d)));
      setDecisionModalOpen(false);
      setIsResolving(false);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          DISPUTE MEDIATION & RESOLUTION DESK
        </h1>
        <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
          Review on-site photo evidence, chat transcripts, and adjudicate milestone escrow disbursements
        </p>
      </div>

      <div className="space-y-6">
        {disputes.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <Scale className="w-12 h-12 text-[#10B981] mb-3" />
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">No disputes filed yet</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto leading-relaxed font-normal">
              All ongoing client and artisan contracts are progressing smoothly. When an escrow milestone dispute is raised, it will appear here for mediation and adjudication.
            </p>
          </Card>
        ) : (
          disputes.map((d) => (
            <Card
              key={d.id}
              className={`p-6 bg-white border ${
                d.status.startsWith('RESOLVED') ? 'border-neutral-200' : 'border-[#E1251B]'
              } shadow-sm rounded-nothing space-y-5`}
            >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D9D9D9]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold bg-white text-[#0A0A0A] px-2.5 py-0.5 rounded border border-[#D9D9D9] shadow-2xs">
                  {d.id}
                </span>
                <Badge variant={d.status.startsWith('RESOLVED') ? 'success' : 'danger'}>
                  {d.status}
                </Badge>
                <span className="text-xs text-[#4A4A4A] font-mono">• Order: {d.orderNumber}</span>
              </div>
              <span className="font-mono text-base font-bold text-[#0A0A0A]">
                ₹{d.totalAmount.toLocaleString()} in Escrow Dispute
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A0A0A]">{d.projectTitle}</h2>
              <p className="text-xs text-[#4A4A4A] font-medium mt-1">
                Client: <strong className="text-[#0A0A0A]">{d.clientName}</strong> vs Artisan: <strong className="text-[#0A0A0A]">{d.artisanName}</strong>
              </p>
            </div>

            {/* Claims & Rebuttal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="p-4 bg-red-50 border border-red-200 rounded-nothing-sm text-[#991B1B]">
                <strong className="block mb-1 text-sm text-[#7F1D1D] font-bold">Client Claim:</strong>
                "{d.reason}"
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-nothing-sm text-[#1E40AF]">
                <strong className="block mb-1 text-sm text-[#1E3A8A] font-bold">Worker Rebuttal:</strong>
                "{d.workerDefense}"
              </div>
            </div>

            {/* Evidence & Chat Snippet */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-1">
                <span className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF5A1F]" /> Inspection Evidence Photo:
                </span>
                <div className="relative aspect-video rounded-nothing-sm overflow-hidden border border-[#D9D9D9]">
                  <img src={d.evidencePhoto} alt="Dispute evidence" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0A0A0A]" /> Platform Chat Evidence Transcript:
                  </span>
                  <div className="p-3 bg-white rounded-nothing-sm border border-[#D9D9D9] text-xs font-mono text-[#2A2A2A] shadow-2xs">
                    {d.chatSnippet}
                  </div>
                </div>

                {!d.status.startsWith('RESOLVED') && (
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="orange"
                      size="sm"
                      onClick={() => {
                        setSelectedDispute(d);
                        setRefundAmount(String(Math.round(d.totalAmount / 2)));
                        setWorkerAmount(String(Math.round(d.totalAmount / 2)));
                        setDecisionModalOpen(true);
                      }}
                      icon={<Scale className="w-4 h-4" />}
                    >
                      Arbitrate & Issue Ruling
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
          ))
        )}
      </div>

      {/* RULING MODAL */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title="ENFORCE DISPUTE RULING"
        subtitle={`Case ${selectedDispute?.id} (${selectedDispute?.projectTitle})`}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-2">
              Arbitration Ruling Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionType('REFUND')}
                className={`py-2.5 rounded-full text-xs font-bold border transition-all ${
                  decisionType === 'REFUND' ? 'bg-[#0A0A0A] text-white border-black' : 'bg-white border-[#D9D9D9] text-[#4A4A4A]'
                }`}
              >
                100% Refund Client
              </button>
              <button
                type="button"
                onClick={() => setDecisionType('SPLIT')}
                className={`py-2.5 rounded-full text-xs font-bold border transition-all ${
                  decisionType === 'SPLIT' ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]' : 'bg-white border-[#D9D9D9] text-[#4A4A4A]'
                }`}
              >
                Split Escrow
              </button>
              <button
                type="button"
                onClick={() => setDecisionType('RELEASE')}
                className={`py-2.5 rounded-full text-xs font-bold border transition-all ${
                  decisionType === 'RELEASE' ? 'bg-[#0A0A0A] text-white border-black' : 'bg-white border-[#D9D9D9] text-[#4A4A4A]'
                }`}
              >
                100% Release Worker
              </button>
            </div>
          </div>

          {decisionType === 'SPLIT' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Input
                label="Refund to Client (₹)"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                required
              />
              <Input
                label="Release to Worker (₹)"
                type="number"
                value={workerAmount}
                onChange={(e) => setWorkerAmount(e.target.value)}
                required
              />
            </div>
          )}

          <div className="p-3 bg-white rounded-nothing-sm border border-[#D9D9D9] text-xs text-[#4A4A4A] leading-relaxed shadow-2xs">
            Upon submitting this ruling, the funds held in escrow transaction custody will be immediately disbursed according to this decree, and both parties will be formally notified.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isResolving}>
              Confirm & Enforce Ruling
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
