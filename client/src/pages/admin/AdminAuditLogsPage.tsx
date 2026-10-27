import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { FileClock, Search, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('dd_token');
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        toast.error(data.message || 'Failed to load audit logs.');
      }
    } catch (err: any) {
      toast.error('Network error loading audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      log.admin?.name?.toLowerCase().includes(q) ||
      log.admin?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
            COMPLIANCE & AUDIT TRAIL
          </h1>
          <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
            Immutable system logs documenting KYC approvals, escrow releases, and dispute adjudications
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D9D9D9] hover:border-black text-xs font-mono text-[#0A0A0A] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Trail
        </button>
      </div>

      {/* Filter Card */}
      <Card className="p-4 bg-white border border-[#D9D9D9] shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search audit trail by admin, action, or target ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#D9D9D9] px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-black"
          />
        </div>
        <span className="text-xs font-mono text-[#4A4A4A]">
          Showing {filteredLogs.length} of {logs.length} events
        </span>
      </Card>

      {/* Logs Table */}
      <div className="bg-white border border-[#D9D9D9] rounded-nothing overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <FileClock className="w-12 h-12 text-neutral-300 mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">No audit logs recorded yet</h3>
            <p className="text-xs text-[#4A4A4A] max-w-sm">
              All administrative actions including KYC document verification and escrow releases will be logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#D9D9D9] text-[#4A4A4A] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Administrator</th>
                  <th className="py-3.5 px-4 font-semibold">Action Trigger</th>
                  <th className="py-3.5 px-4 font-semibold">Target Record</th>
                  <th className="py-3.5 px-4 font-semibold">Log Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] font-mono">
                {filteredLogs.map((log) => {
                  let badgeVariant: any = 'default';
                  if (log.action?.includes('VERIFIED')) badgeVariant = 'verified';
                  else if (log.action?.includes('RELEASE')) badgeVariant = 'orange';
                  else if (log.action?.includes('BLOCK')) badgeVariant = 'danger';

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap text-[11px]">
                        {new Date(log.createdAt).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">
                          {log.admin?.name || 'System Admin'}
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {log.admin?.email}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={badgeVariant}>{log.action}</Badge>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 text-[11px]">
                        {log.targetId ? (
                          <span className="bg-neutral-100 px-2 py-0.5 border border-neutral-200">
                            {log.targetId.slice(0, 10)}...
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-800 text-[11px] max-w-md">
                        <p className="leading-relaxed line-clamp-2">{log.details || '—'}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
