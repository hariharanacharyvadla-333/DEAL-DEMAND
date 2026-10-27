import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Calendar,
  FileText,
  User,
} from 'lucide-react';

export const AdminDisputesPage: React.FC = () => {
  const toast = useToast();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Resolution Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [decisionType, setDecisionType] = useState<'REFUND' | 'RELEASE' | 'SPLIT'>('SPLIT');
  const [refundAmount, setRefundAmount] = useState('0');
  const [workerAmount, setWorkerAmount] = useState('0');
  const [note, setNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Chat Transcript Modal
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [transcriptDispute, setTranscriptDispute] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

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
            orderId: d.orderId,
            orderNumber: d.order?.orderNumber || 'ORD-000',
            clientName: d.order?.customer?.name || 'Customer',
            artisanName: d.order?.worker?.user?.name || 'Artisan',
            projectTitle: d.order?.requirement?.title || 'Contract Work',
            totalAmount: d.order?.escrow?.amountHeld || d.order?.totalAmount || 0,
            reason: d.reason || 'Escrow dispute raised',
            workerDefense: d.decision || 'Awaiting adjudication',
            evidencePhoto: d.evidenceUrl || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600',
            status: d.status || 'OPEN',
            date: new Date(d.createdAt).toLocaleDateString(),
          }))
        );
      } else {
        toast.error(data.message || 'Failed to load disputes.');
      }
    } catch (err) {
      toast.error('Network error loading disputes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleOpenTranscript = async (dispute: any) => {
    setTranscriptDispute(dispute);
    setTranscriptModalOpen(true);
    setIsLoadingChat(true);

    try {
      const token = localStorage.getItem('dd_token');
      const res = await fetch(`/api/admin/orders/${dispute.orderId}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
      } else {
        toast.error(data.message || 'Failed to fetch transcript.');
      }
    } catch (err) {
      toast.error('Network error loading chat transcript.');
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setIsResolving(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision: decisionType,
          refundAmount: Number(refundAmount) || 0,
          workerAmount: Number(workerAmount) || 0,
          note: note || 'Resolved by Administrator',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Dispute resolved as ${decisionType}. Funds disbursed accordingly.`);
        setDisputes((prev) =>
          prev.map((d) =>
            d.id === selectedDispute.id ? { ...d, status: `RESOLVED_${decisionType}` } : d
          )
        );
        setDecisionModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to resolve dispute.');
      }
    } catch (err) {
      toast.error('Error resolving dispute.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          DISPUTE MEDIATION & RESOLUTION DESK
        </h1>
        <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
          Review on-site photo evidence, direct escrow chat transcripts, and adjudicate milestone fund disbursements
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : disputes.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <Scale className="w-12 h-12 text-[#10B981] mb-3" />
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">No active disputes</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto leading-relaxed font-normal">
              All ongoing client and artisan contracts are progressing smoothly. When an escrow milestone dispute is raised, it will appear here for mediation and adjudication.
            </p>
          </Card>
        ) : (
          disputes.map((d) => (
            <Card
              key={d.id}
              className={`p-6 bg-white border ${
                d.status.startsWith('RESOLVED') ? 'border-neutral-200' : 'border-[#FF5A1F]'
              } shadow-sm rounded-nothing space-y-5`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D9D9D9]">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold bg-white text-[#0A0A0A] px-2.5 py-0.5 rounded border border-[#D9D9D9] shadow-2xs">
                    {d.id.slice(0, 8)}
                  </span>
                  <Badge variant={d.status.startsWith('RESOLVED') ? 'success' : 'danger'}>
                    {d.status}
                  </Badge>
                  <span className="text-xs text-[#4A4A4A] font-mono">• Order: {d.orderNumber}</span>
                </div>
                <span className="font-mono text-base font-bold text-[#0A0A0A]">
                  ₹{Number(d.totalAmount).toLocaleString()} in Escrow Custody
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0A0A0A]">{d.projectTitle}</h2>
                <p className="text-xs text-[#4A4A4A] font-medium mt-1">
                  Client: <strong className="text-[#0A0A0A]">{d.clientName}</strong> vs Artisan: <strong className="text-[#0A0A0A]">{d.artisanName}</strong>
                </p>
              </div>

              {/* Claims Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="p-4 bg-red-50 border border-red-200 rounded-nothing-sm text-[#991B1B]">
                  <strong className="block mb-1 text-sm text-[#7F1D1D] font-bold">Dispute Reason / Claim:</strong>
                  "{d.reason}"
                </div>
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-nothing-sm text-[#4A4A4A]">
                  <strong className="block mb-1 text-sm text-[#0A0A0A] font-bold">Case Status:</strong>
                  {d.status.startsWith('RESOLVED')
                    ? `Adjudicated: ${d.status.replace('RESOLVED_', '')}`
                    : 'Awaiting Administrator arbitration and fund release.'}
                </div>
              </div>

              {/* Evidence & Chat Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => handleOpenTranscript(d)}
                  className="flex items-center gap-2 px-3 py-2 border border-[#D9D9D9] hover:border-black text-xs font-mono font-medium text-[#0A0A0A] rounded-nothing transition-colors self-start"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>View Escrow Chat Transcript</span>
                </button>

                {!d.status.startsWith('RESOLVED') && (
                  <Button
                    variant="orange"
                    size="sm"
                    onClick={() => {
                      setSelectedDispute(d);
                      const half = Math.round(Number(d.totalAmount) / 2);
                      setRefundAmount(String(half));
                      setWorkerAmount(String(half));
                      setDecisionModalOpen(true);
                    }}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Adjudicate & Disburse
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Chat Transcript Modal (Read-Only) */}
      {transcriptDispute && (
        <Modal
          isOpen={transcriptModalOpen}
          onClose={() => setTranscriptModalOpen(false)}
          title={`ESCROW CHAT TRANSCRIPT: ${transcriptDispute.orderNumber}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-neutral-500">Project:</span>{' '}
                <strong className="text-black">{transcriptDispute.projectTitle}</strong>
              </div>
              <Badge variant="verified">OFFICIAL RECORD</Badge>
            </div>

            {isLoadingChat ? (
              <div className="p-8 space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 border border-dashed border-neutral-200">
                No chat messages recorded in platform database for this project contract.
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto space-y-3 p-3 bg-neutral-50/50 border border-neutral-200">
                {chatMessages.map((m) => {
                  const isWorker = m.sender?.role === 'WORKER';
                  return (
                    <div
                      key={m.id}
                      className={`p-3 border text-xs ${
                        isWorker
                          ? 'bg-white border-[#D9D9D9] mr-6'
                          : 'bg-white border-blue-200 ml-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-neutral-100">
                        <span className="font-bold font-mono text-neutral-800">
                          {m.sender?.name || 'User'} ({m.sender?.role})
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-900 leading-relaxed font-sans">{m.text}</p>
                      {m.fileUrl && (
                        <div className="mt-2 pt-2 border-t border-neutral-100">
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono text-[#FF5A1F] hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> View Attachment ({m.fileUrl.split('/').pop()})
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setTranscriptModalOpen(false)}>
                Close Transcript
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decision Adjudication Modal */}
      {selectedDispute && (
        <Modal
          isOpen={decisionModalOpen}
          onClose={() => setDecisionModalOpen(false)}
          title={`ADJUDICATE ESCROW: ${selectedDispute.orderNumber}`}
        >
          <form onSubmit={handleResolveSubmit} className="space-y-5">
            <div className="p-3 bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span>
                Arbitration decision is legally binding and executes instant platform escrow transfers.
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase font-bold text-neutral-600">
                Arbitration Ruling
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'REFUND', label: '100% Client Refund' },
                  { id: 'SPLIT', label: 'Compromise Split' },
                  { id: 'RELEASE', label: '100% Artisan Release' },
                ].map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => {
                      setDecisionType(type.id as any);
                      const total = Number(selectedDispute.totalAmount);
                      if (type.id === 'REFUND') {
                        setRefundAmount(String(total));
                        setWorkerAmount('0');
                      } else if (type.id === 'RELEASE') {
                        setRefundAmount('0');
                        setWorkerAmount(String(total));
                      } else {
                        const half = Math.round(total / 2);
                        setRefundAmount(String(half));
                        setWorkerAmount(String(total - half));
                      }
                    }}
                    className={`py-2 px-3 text-xs font-mono font-semibold border rounded-nothing text-center transition-all ${
                      decisionType === type.id
                        ? 'border-black bg-black text-white'
                        : 'border-[#D9D9D9] bg-white text-neutral-700 hover:border-black'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {decisionType === 'SPLIT' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Refund to Client (₹)"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                />
                <Input
                  label="Disburse to Artisan (₹)"
                  type="number"
                  value={workerAmount}
                  onChange={(e) => setWorkerAmount(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase font-bold text-neutral-600">
                Arbitration Ruling Note (Logged to Audit Trail)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="State basis for adjudication (e.g. material defect verified, partial workmanship delivered)..."
                rows={3}
                className="w-full bg-white border border-[#D9D9D9] p-3 text-xs focus:outline-none focus:border-black"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setDecisionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="orange"
                size="sm"
                type="submit"
                disabled={isResolving}
              >
                {isResolving ? 'Executing...' : 'Confirm Ruling & Disburse'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
