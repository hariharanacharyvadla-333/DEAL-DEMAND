import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Coins,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  PackageCheck,
  Clock,
} from 'lucide-react';

export const AdminEscrowDeliveriesPage: React.FC = () => {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState<string | null>(null);

  const fetchEscrowBoard = async () => {
    try {
      const token = localStorage.getItem('dd_token');
      const [escrowRes, delRes] = await Promise.all([
        fetch('/api/admin/escrow-board', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/deliveries', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const data = await escrowRes.json();
      const delData = await delRes.json();

      if (data.success) {
        setEscrows(data.escrows || []);
        setPayouts(data.payouts || []);
      }
      if (delData.success) {
        setDeliveries(delData.deliveries || []);
      }
    } catch (err) {
      console.error('Failed to load escrow board:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrowBoard();
  }, []);

  const handleForceRelease = async (escrowId: string) => {
    if (!window.confirm('Force release escrow funds to worker? This releases funds from platform trust custody.')) return;
    setIsReleasing(escrowId);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch(`/api/admin/escrow-release/${escrowId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchEscrowBoard();
      } else {
        alert(data.message || 'Failed to release escrow.');
      }
    } catch (err) {
      alert('Error releasing escrow.');
    } finally {
      setIsReleasing(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          ESCROW CUSTODY & LOGISTICS OVERSIGHT
        </h1>
        <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
          Direct middle-layer financial custody management, physical deliveries, and payout disbursements
        </p>
      </div>

      {/* Escrow Transactions Table (6 Transactions) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#FF5A1F]" />
            ESCROW TRANSACTIONS IN PLATFORM TRUST ({escrows.length})
          </h2>
          <span className="text-xs font-mono font-semibold text-[#4A4A4A]">
            Held / Released / Refunded
          </span>
        </div>

        {isLoading ? (
          <Skeleton className="h-48" />
        ) : escrows.length === 0 ? (
          <Card className="p-10 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <Coins className="w-10 h-10 text-[#FF5A1F] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">No escrow transactions yet</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto leading-relaxed font-normal">
              When customers accept quotations and fund milestones, platform escrow trust transactions will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {escrows.map((e) => (
              <Card
                key={e.id}
                className="p-6 bg-white border border-[#D9D9D9] hover:border-black transition-all rounded-nothing flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#0A0A0A] bg-white px-2.5 py-0.5 rounded border border-[#D9D9D9] shadow-2xs">
                      {e.order?.orderNumber}
                    </span>
                    <Badge
                      variant={
                        e.status === 'HELD'
                          ? 'orange'
                          : e.status === 'REFUNDED_TO_CUSTOMER'
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {e.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-[#0A0A0A] mb-1">
                    Buyer: {e.order?.customer?.name} → Artisan: {e.order?.worker?.user?.name}
                  </h3>

                  <p className="text-xs text-[#4A4A4A]">
                    Location: {e.order?.customer?.city} • Delivery Tracking: {e.order?.delivery?.trackingId || 'In Transit'}
                  </p>
                </div>

                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-[#D9D9D9] pt-3 md:pt-0 shrink-0">
                  <span className="text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">Escrow Custody Amount</span>
                  <p className="font-mono text-2xl font-bold text-[#0A0A0A] mb-3">
                    ₹{e.amountHeld.toLocaleString()}
                  </p>

                  {e.status === 'HELD' ? (
                    <Button
                      variant="orange"
                      size="sm"
                      isLoading={isReleasing === e.id}
                      onClick={() => handleForceRelease(e.id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Admin Release to Worker
                    </Button>
                  ) : e.status === 'REFUNDED_TO_CUSTOMER' ? (
                    <Badge variant="danger">REFUNDED TO CLIENT</Badge>
                  ) : (
                    <Badge variant="success">FUNDS RELEASED</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Records Across Different Stages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#10B981]" />
            DELIVERY & ON-SITE INSPECTION RECORDS ({deliveries.length})
          </h2>
          <span className="text-xs font-mono font-semibold text-[#4A4A4A]">
            Logistics Pipeline
          </span>
        </div>

        {deliveries.length === 0 ? (
          <Card className="p-10 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <Truck className="w-10 h-10 text-[#10B981] mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">No active delivery dispatches yet</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto leading-relaxed font-normal">
              Active physical dispatches, courier tracking IDs, and on-site delivery proofs will appear here once artisans dispatch completed works.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveries.map((del) => (
              <Card key={del.id} className="p-5 bg-white border border-[#D9D9D9] rounded-nothing-sm flex items-start gap-4">
                <div className="w-16 h-16 rounded-nothing-sm overflow-hidden border border-[#D9D9D9] shrink-0 bg-white shadow-2xs">
                  <img src={del.proofUrls?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'} alt={del.trackingId} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#0A0A0A]">{del.trackingId || del.id}</span>
                    <Badge variant={del.status === 'DELIVERED' ? 'success' : 'orange'}>
                      {del.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] truncate">{del.order?.requirement?.title || 'Contract Order'}</h3>
                  <p className="text-xs text-[#4A4A4A] mt-0.5">
                    {del.order?.customer?.name} • Pro: {del.order?.worker?.user?.name}
                  </p>
                  <p className="text-[11px] font-mono text-[#6B6B6B] mt-1">
                    Order: {del.order?.orderNumber} • Updated {new Date(del.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Worker Withdrawal Payout Requests */}
      <div>
        <h2 className="font-dot text-xl font-bold text-[#0A0A0A] tracking-tight mb-4 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
          RECENT WORKER WITHDRAWAL DISBURSEMENTS ({payouts.length})
        </h2>

        {payouts.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-dashed border-[#D9D9D9] shadow-xs rounded-nothing flex flex-col items-center justify-center">
            <ArrowUpRight className="w-10 h-10 text-[#4A4A4A] mb-2" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">No payout withdrawal requests yet</h3>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto leading-relaxed font-normal">
              When verified artisans request wallet balance payouts to their bank accounts or UPI IDs, they will appear here for settlement.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <Card key={p.id} className="p-5 bg-white border border-[#D9D9D9] flex items-center justify-between rounded-nothing-sm">
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A]">
                    {p.worker?.user?.name || 'Verified Artisan'}
                  </h3>
                  <p className="text-xs text-[#4A4A4A] font-mono mt-0.5">
                    {p.id} • Processed on {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-bold text-[#0A0A0A]">
                    ₹{p.amount.toLocaleString()}
                  </span>
                  <Badge variant={p.status === 'APPROVED' ? 'success' : 'orange'}>
                    {p.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
