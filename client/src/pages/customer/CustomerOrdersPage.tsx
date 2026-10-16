import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  PackageCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const [dealsWithOrders, setDealsWithOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('dd_token');
        const res = await fetch('/api/deals/my-deals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          // Filter deals that have created orders
          const withOrders = data.deals.filter((d: any) => d.orders && d.orders.length > 0);
          setDealsWithOrders(withOrders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          PROJECTS & ORDERS
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Monitor milestone execution, inspection photos, and escrow release
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : dealsWithOrders.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-[#D9D9D9] shadow-xs">
          <PackageCheck className="w-10 h-10 text-[#4A4A4A] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0A0A0A] mb-1">
            No active orders yet
          </h3>
          <p className="text-xs font-mono text-neutral-500 max-w-md mx-auto mb-6">
            Once you accept an artisan quotation on a posted deal, an escrow-protected order is generated here.
          </p>
          <Link to="/customer/deals/new">
            <Button variant="orange" size="sm">
              Post a Deal Now
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {dealsWithOrders.map((d: any) => {
            const order = d.orders[0];
            const milestones = order.milestones || [];
            const approvedCount = milestones.filter(
              (m: any) => m.status === 'CUSTOMER_APPROVED' || m.status === 'PAYMENT_RELEASED'
            ).length;

            return (
              <Card
                key={order.id}
                className="p-6 bg-white border-neutral-200 hover:border-black transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-neutral-400">
                      {order.orderNumber}
                    </span>
                    <Badge variant={order.status === 'COMPLETED' ? 'success' : 'orange'}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="verified">ESCROW LOCKED</Badge>
                  </div>

                  <h3 className="font-dot text-lg font-bold text-neutral-900 mb-1">
                    {d.title}
                  </h3>

                  <p className="text-xs font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {order.deliveryAddress}
                  </p>

                  {/* Milestone mini progress bar */}
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
                    <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] transition-all"
                        style={{
                          width: `${milestones.length > 0 ? (approvedCount / milestones.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span>
                      {approvedCount} of {milestones.length} Milestones Approved
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 shrink-0">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Contract Total</span>
                  <p className="font-mono text-2xl font-bold text-black mb-3">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>

                  <Link to={`/customer/orders/${order.id}`}>
                    <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Track Milestones & Photos
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
