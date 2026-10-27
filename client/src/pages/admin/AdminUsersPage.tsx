import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Users2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'WORKER' | 'ADMIN'>('ALL');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isTogglingBlock, setIsTogglingBlock] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('dd_token');
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      toast.error('Network error loading users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, roleFilter]);

  const handleToggleBlock = async (user: any) => {
    const newStatus = !user.isBlocked;
    const actionLabel = newStatus ? 'suspend' : 'reinstate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} account for ${user.name}?`)) {
      return;
    }

    setIsTogglingBlock(user.id);
    try {
      const token = localStorage.getItem('dd_token');
      const res = await fetch(`/api/admin/users/${user.id}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `User account ${newStatus ? 'suspended' : 'activated'}.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBlocked: newStatus } : u))
        );
      } else {
        toast.error(data.message || 'Failed to update user status.');
      }
    } catch (err: any) {
      toast.error('Network error while updating user.');
    } finally {
      setIsTogglingBlock(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          PLATFORM USER MANAGEMENT
        </h1>
        <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
          Oversee verified artisans, clients, administrator privileges, and account security
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-[#D9D9D9] shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D9D9D9] rounded-nothing w-full md:w-auto overflow-x-auto">
            {(['ALL', 'CUSTOMER', 'WORKER', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-mono font-semibold transition-all rounded-nothing ${
                  roleFilter === r
                    ? 'bg-[#0A0A0A] text-white shadow-xs'
                    : 'text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-neutral-100'
                }`}
              >
                {r === 'ALL' ? 'All Accounts' : r === 'CUSTOMER' ? 'Clients' : r === 'WORKER' ? 'Artisans' : 'Admins'}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by name, email, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="w-3.5 h-3.5 text-neutral-400" />}
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <div className="bg-white border border-[#D9D9D9] rounded-nothing overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users2 className="w-12 h-12 text-neutral-300 mb-3" />
            <h3 className="text-base font-bold text-[#0A0A0A] mb-1">No users found</h3>
            <p className="text-xs text-[#4A4A4A] max-w-sm">
              {search
                ? `No accounts matched your search for "${search}". Try clearing search filters.`
                : 'No registered accounts in this category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#D9D9D9] text-[#4A4A4A] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User / Artisan</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                  <th className="py-3.5 px-4 font-semibold">Portal Role</th>
                  <th className="py-3.5 px-4 font-semibold">City</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {users.map((u) => {
                  const isBlocked = Boolean(u.isBlocked);
                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#D9D9D9] shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#0A0A0A]">{u.name}</p>
                            <span className="text-[10px] font-mono text-neutral-400">
                              Joined {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        <div className="space-y-0.5">
                          <p className="text-neutral-900">{u.email}</p>
                          <p className="text-[11px] text-neutral-500">{u.phone || 'No phone'}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            u.role === 'ADMIN'
                              ? 'default'
                              : u.role === 'WORKER'
                              ? 'orange'
                              : 'verified'
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {u.city || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-200">
                            <Ban className="w-3 h-3 text-red-600" /> SUSPENDED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 border border-[#D9D9D9] hover:border-black text-[#4A4A4A] hover:text-black rounded-nothing-sm transition-colors"
                            title="View Account Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleToggleBlock(u)}
                              disabled={isTogglingBlock === u.id}
                              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-nothing-sm transition-colors border ${
                                isBlocked
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {isTogglingBlock === u.id
                                ? 'Saving...'
                                : isBlocked
                                ? 'Unblock'
                                : 'Block'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`ACCOUNT DOSSIER: ${selectedUser.name}`}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#E5E5E5]">
              <img
                src={selectedUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-full object-cover border border-[#D9D9D9]"
              />
              <div>
                <h3 className="text-base font-bold text-[#0A0A0A]">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedUser.role === 'ADMIN' ? 'default' : selectedUser.role === 'WORKER' ? 'orange' : 'verified'}>
                    {selectedUser.role}
                  </Badge>
                  <span className="text-xs font-mono text-neutral-500">
                    ID: {selectedUser.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-neutral-50 p-3 border border-neutral-200 space-y-1">
                <span className="text-neutral-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#FF5A1F]" /> Email Address
                </span>
                <p className="font-bold text-neutral-900 truncate">{selectedUser.email}</p>
              </div>

              <div className="bg-neutral-50 p-3 border border-neutral-200 space-y-1">
                <span className="text-neutral-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#FF5A1F]" /> Phone
                </span>
                <p className="font-bold text-neutral-900">{selectedUser.phone || 'Not Provided'}</p>
              </div>

              <div className="bg-neutral-50 p-3 border border-neutral-200 space-y-1">
                <span className="text-neutral-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF5A1F]" /> Operating City
                </span>
                <p className="font-bold text-neutral-900">{selectedUser.city || 'Bengaluru'}</p>
              </div>

              <div className="bg-neutral-50 p-3 border border-neutral-200 space-y-1">
                <span className="text-neutral-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#FF5A1F]" /> Registered On
                </span>
                <p className="font-bold text-neutral-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedUser.workerProfile && (
              <div className="bg-amber-50/50 p-4 border border-amber-200 text-xs font-mono space-y-2">
                <h4 className="font-bold text-[#0A0A0A] flex items-center gap-1.5 uppercase tracking-wide">
                  <Briefcase className="w-3.5 h-3.5 text-[#FF5A1F]" /> Artisan Credentials
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <span className="text-neutral-400 text-[10px]">Verification:</span>
                    <p className="font-bold text-neutral-800">{selectedUser.workerProfile.verificationState}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px]">Badge:</span>
                    <p className="font-bold text-neutral-800">{selectedUser.workerProfile.badgeLevel}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px]">Experience:</span>
                    <p className="font-bold text-neutral-800">{selectedUser.workerProfile.yearsExperience} yrs</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px]">Jobs Done:</span>
                    <p className="font-bold text-neutral-800">{selectedUser.workerProfile.jobsCompleted}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
