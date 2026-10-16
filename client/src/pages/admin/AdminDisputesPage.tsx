import React, { useState } from 'react';
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
  const [disputes, setDisputes] = useState<any[]>([
    {
      id: 'DISP-2026-01',
      orderNumber: 'ORD-2026-9921',
      clientName: 'Divya Iyer (Chennai)',
      artisanName: 'Deepak Verma (Mumbai)',
      projectTitle: 'Terrace Waterproofing with Fiber Mesh Membrane',
      totalAmount: 48000,
      reason: 'Seepage re-occurred in master bedroom ceiling after first rain. Membrane peeling at parapet edges.',
      workerDefense: 'Client walked on wet polymer slurry during curing stage despite warnings. Parapet joints need re-grouting.',
      evidencePhoto: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600',
      chatSnippet: "Customer: 'The ceiling is dripping again!' • Worker: 'Madam, the chemical needed 48h drying time.'",
      status: 'OPEN',
      date: '2026-10-09',
    },
    {
      id: 'DISP-2026-02',
      orderNumber: 'ORD-2026-8814',
      clientName: 'Vikram Patel (Ahmedabad)',
      artisanName: 'Girish Naidu (Hyderabad)',
      projectTitle: 'Custom Teak Wood Temple Mandir Carving',
      totalAmount: 36000,
      reason: 'Pooja mandir brass bells were missing from delivery carton and polish tone is darker walnut rather than honey teak.',
      workerDefense: 'Brass bells were dispatched separately via BlueDart tracking #BD9912. Melamine polish lightens after 14 days of UV cure.',
      evidencePhoto: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
      chatSnippet: "Customer: 'Bells are missing and finish is too dark.' • Worker: 'Bells couriered today morning; tracking sent.'",
      status: 'OPEN',
      date: '2026-10-08',
    },
    {
      id: 'DISP-2026-03',
      orderNumber: 'ORD-2026-7740',
      clientName: 'Kunal Deshmukh (Mumbai)',
      artisanName: 'Suresh Babu (Bengaluru)',
      projectTitle: 'Laser-Cut MS Safety Compound Gate (14ft x 6ft)',
      totalAmount: 28000,
      reason: 'Gate hinges bind when swinging open past 90 degrees due to uneven pillar alignment.',
      workerDefense: 'Existing civil pillar is out of plumb by 1.5 inches. We can fit an offset spacer bracket to allow 120-degree swing.',
      evidencePhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
      chatSnippet: "Customer: 'Gate catches the boundary pillar.' • Worker: 'Pillar plumb line is off; I can install an offset hinge bracket tomorrow.'",
      status: 'OPEN',
      date: '2026-10-07',
    },
  ]);

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
        {disputes.map((d) => (
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
        ))}
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
