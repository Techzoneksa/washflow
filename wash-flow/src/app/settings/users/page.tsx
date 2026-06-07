'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Drawer from '@/components/ui/Drawer';
import { useAuthGuard } from '@/lib/route-guards';
import { useToast } from '@/components/ui/Toast';
import { getProfiles, updateProfileRole, updateProfileStatus } from '@/lib/data/profiles';
import type { ProfileData } from '@/lib/data/profiles';
import type { UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, Users, UserRound, Shield, ChevronLeft } from 'lucide-react';

const roleOptions = [
  { label: 'مالك', value: 'owner' },
  { label: 'مدير', value: 'manager' },
  { label: 'محاسب', value: 'accountant' },
  { label: 'كاشير', value: 'cashier' },
];

const statusOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'نشط', value: 'active' },
  { label: 'غير نشط', value: 'inactive' },
];

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = { owner: 'مالك', manager: 'مدير', accountant: 'محاسب', cashier: 'كاشير' };
  return labels[role];
}

function getRoleBadgeVariant(role: UserRole): 'danger' | 'info' | 'warning' | 'neutral' {
  switch (role) {
    case 'owner': return 'danger';
    case 'manager': return 'info';
    case 'accountant': return 'warning';
    case 'cashier': return 'neutral';
  }
}

export default function UsersSettingsPage() {
  const { authorized, checking } = useAuthGuard(['owner']);
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editRole, setEditRole] = useState<UserRole | ''>('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authorized) return;
    getProfiles().then((data) => {
      setProfiles(data);
      setLoading(false);
    });
  }, [authorized]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.fullName.toLowerCase().includes(q) && !getRoleLabel(p.role).includes(q)) return false;
      }
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [profiles, search, statusFilter]);

  const handleView = useCallback((p: ProfileData) => {
    setSelectedProfile(p);
    setEditRole(p.role);
    setEditStatus(p.status);
    setDetailsOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedProfile) return;
    if (!editRole || !editStatus) return;
    setSaving(true);

    let updated: ProfileData | null = selectedProfile;
    if (editRole !== selectedProfile.role) {
      updated = await updateProfileRole(selectedProfile.id, editRole as UserRole);
    }
    if (updated && editStatus !== selectedProfile.status) {
      updated = await updateProfileStatus(selectedProfile.id, editStatus as 'active' | 'inactive');
    }

    if (updated) {
      setProfiles((prev) => prev.map((p) => (p.id === updated!.id ? updated! : p)));
      setSelectedProfile(updated);
      toast('success', 'تم تحديث بيانات المستخدم بنجاح');
    } else {
      toast('error', 'حدث خطأ أثناء تحديث المستخدم');
    }

    setSaving(false);
  }, [selectedProfile, editRole, editStatus, toast]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedProfile(null);
    setEditRole('');
    setEditStatus('');
  }, []);

  if (checking || !authorized) return null;

  return (
    <AppShell title="المستخدمين والصلاحيات" activePath="/settings">
      <div className="max-w-4xl">
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-info-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-info-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">المستخدمين والصلاحيات</h2>
              <p className="text-sm text-text-secondary">إدارة مستخدمي النظام وأدوارهم</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <UserRound className="h-16 w-16 text-text-disabled mb-4" />
              <p className="text-sm font-medium text-text-secondary">لا يوجد مستخدمون بعد</p>
              <p className="text-xs text-text-disabled mt-1">إنشاء المستخدمين يتم عبر شاشة تسجيل الدخول</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="بحث باسم المستخدم أو الدور..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                    fullWidth
                  />
                </div>
                <div className="w-36">
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filtered.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleView(profile)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-default bg-bg-surface hover:bg-neutral-50 transition-colors text-right"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                      <UserRound className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-semibold text-text-primary truncate">{profile.fullName}</p>
                      <p className="text-xs text-text-secondary">{getRoleLabel(profile.role)}</p>
                    </div>
                    <Badge variant={profile.status === 'active' ? 'success' : 'danger'} dot size="sm">
                      {profile.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                    <Badge variant={getRoleBadgeVariant(profile.role)} size="sm">
                      {getRoleLabel(profile.role)}
                    </Badge>
                    <ChevronLeft className="h-4 w-4 text-text-disabled shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Drawer open={detailsOpen} onClose={handleCloseDetails} title={selectedProfile?.fullName || 'المستخدم'}>
        {selectedProfile && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                <UserRound className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">{selectedProfile.fullName}</p>
                <Badge variant={selectedProfile.status === 'active' ? 'success' : 'danger'} dot size="sm">
                  {selectedProfile.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Shield className="h-4 w-4" />
                <span>الدور الحالي: <strong className="text-text-primary">{getRoleLabel(selectedProfile.role)}</strong></span>
              </div>

              <Select
                label="تعديل الدور"
                options={roleOptions}
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                fullWidth
              />

              <Select
                label="الحالة"
                options={[
                  { label: 'نشط', value: 'active' },
                  { label: 'غير نشط', value: 'inactive' },
                ]}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
                fullWidth
              />

              <div className="text-xs text-text-disabled space-y-1 bg-neutral-50 rounded-xl p-3">
                <p>تاريخ الإنشاء: {formatDate(selectedProfile.createdAt)}</p>
                <p>آخر تحديث: {formatDate(selectedProfile.updatedAt)}</p>
              </div>

              <Button
                icon={<Shield className="h-4 w-4" />}
                onClick={handleSave}
                loading={saving}
                fullWidth
              >
                حفظ التغييرات
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </AppShell>
  );
}
