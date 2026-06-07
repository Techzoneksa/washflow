'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Drawer from '@/components/ui/Drawer';
import { useAuthGuard } from '@/lib/route-guards';
import { useToast } from '@/components/ui/Toast';
import { getProfiles, updateProfileRole, updateProfileStatus } from '@/lib/data/profiles';
import { sendPasswordReset, createAdminUser, getAdminEmails } from '@/lib/data/admin-users';
import { getPosDevices } from '@/lib/data/pos-devices';
import {
  getCashierAccounts,
  createCashierAccount,
  updateCashierAccount,
  changeCashierPin,
  unlockCashierAccount,
} from '@/lib/data/cashier-accounts';
import type { ProfileData } from '@/lib/data/profiles';
import type { PosDevice, CashierAccount } from '@/types/pos-devices';
import type { UserRole } from '@/types';
import { formatDate, formatTime } from '@/lib/utils';
import {
  Search, Users, Shield, ChevronLeft, Plus,
  Monitor, KeyRound, Lock, Smartphone, Mail, UserCog,
} from 'lucide-react';

type UserType = 'admin' | 'cashier';

interface UnifiedUser {
  id: string;
  fullName: string;
  userType: UserType;
  role: string;
  email?: string;
  posDeviceId?: string;
  posDeviceName?: string;
  posCode?: string;
  username?: string;
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  lockedUntil?: string;
  createdAt: string;
  source: 'profile' | 'cashier';
  profile?: ProfileData;
  cashier?: CashierAccount;
}

function getUserTypeLabel(t: UserType): string {
  return t === 'admin' ? 'إدارة' : 'كاشير';
}

function getUserTypeBadge(t: UserType): 'info' | 'neutral' {
  return t === 'admin' ? 'info' : 'neutral';
}

const statusFilterOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'نشط', value: 'active' },
  { label: 'غير نشط', value: 'inactive' },
];

const userTypeFilterOptions = [
  { label: 'الكل', value: 'all' },
  { label: 'إدارة', value: 'admin' },
  { label: 'كاشير', value: 'cashier' },
];

const adminRoleOptions = [
  { label: 'مالك', value: 'owner' },
  { label: 'مدير', value: 'manager' },
  { label: 'محاسب', value: 'accountant' },
];

const cashierStatusOptions = [
  { label: 'نشط', value: 'active' },
  { label: 'غير نشط', value: 'inactive' },
];

export default function UsersSettingsPage() {
  const { authorized } = useAuthGuard(['owner']);
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [cashiers, setCashiers] = useState<CashierAccount[]>([]);
  const [devices, setDevices] = useState<PosDevice[]>([]);
  const [adminEmails, setAdminEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<UserType | null>(null);

  const loadData = useCallback(async () => {
    if (!authorized) return;
    setLoading(true);
    const [profileList, cashierList, deviceList, emails] = await Promise.all([
      getProfiles(),
      getCashierAccounts(),
      getPosDevices(),
      getAdminEmails(),
    ]);
    setProfiles(profileList);
    setCashiers(cashierList);
    setDevices(deviceList);
    setAdminEmails(emails);
    setLoading(false);
  }, [authorized]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!authorized) return;
      setLoading(true);
      const [profileList, cashierList, deviceList, emails] = await Promise.all([
        getProfiles(),
        getCashierAccounts(),
        getPosDevices(),
        getAdminEmails(),
      ]);
      if (cancelled) return;
      setProfiles(profileList);
      setCashiers(cashierList);
      setDevices(deviceList);
      setAdminEmails(emails);
      setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
  }, [authorized]);

  const deviceMap = useMemo(() => {
    const map: Record<string, PosDevice> = {};
    for (const d of devices) map[d.id] = d;
    return map;
  }, [devices]);

  const unifiedUsers = useMemo((): UnifiedUser[] => {
    const result: UnifiedUser[] = [];

    for (const p of profiles) {
      if (p.role === 'cashier') continue;
      result.push({
        id: p.id,
        fullName: p.fullName,
        userType: 'admin',
        role: p.role,
        email: adminEmails[p.id],
        status: p.status,
        lastLoginAt: undefined,
        createdAt: p.createdAt,
        source: 'profile',
        profile: p,
      });
    }

    for (const c of cashiers) {
      const device = c.posDeviceId ? deviceMap[c.posDeviceId] : undefined;
      result.push({
        id: c.id,
        fullName: c.fullName,
        userType: 'cashier',
        role: 'cashier',
        posDeviceId: c.posDeviceId,
        posDeviceName: device?.deviceName,
        posCode: device?.posCode,
        username: c.username,
        status: c.status,
        lastLoginAt: c.lastLoginAt,
        lockedUntil: c.lockedUntil,
        createdAt: c.createdAt,
        source: 'cashier',
        cashier: c,
      });
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [profiles, cashiers, deviceMap, adminEmails]);

  const filtered = useMemo(() => {
    return unifiedUsers.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = u.fullName.toLowerCase().includes(q);
        const roleMatch = u.role.toLowerCase().includes(q);
        const usernameMatch = (u.username || '').toLowerCase().includes(q);
        const deviceMatch = (u.posDeviceName || '').toLowerCase().includes(q);
        const typeMatch = getUserTypeLabel(u.userType).includes(q);
        if (!nameMatch && !roleMatch && !usernameMatch && !deviceMatch && !typeMatch) return false;
      }
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (typeFilter !== 'all' && u.userType !== typeFilter) return false;
      return true;
    });
  }, [unifiedUsers, search, statusFilter, typeFilter]);

  const handleAddUser = useCallback((type: UserType) => {
    setAddType(type);
  }, []);

  const handleView = useCallback((u: UnifiedUser) => {
    setSelectedUser(u);
    setDetailsOpen(true);
  }, []);

  if (!authorized) return null;

  return (
    <AppShell title="المستخدمين والصلاحيات" activePath="/settings">
      <div className="max-w-5xl">
        <Card padding="lg">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-info-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">المستخدمين والصلاحيات</h2>
                <p className="text-sm text-text-secondary">إدارة مستخدمي النظام وأدوارهم</p>
              </div>
            </div>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddModalOpen(true)}>
              إضافة مستخدم
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="بحث بالاسم أو الدور أو الجهاز..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                fullWidth
              />
            </div>
            <div className="w-36">
              <Select
                options={userTypeFilterOptions}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Select
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-16 w-16 text-text-disabled mb-4" />
              <p className="text-sm font-medium text-text-secondary">لا يوجد مستخدمون</p>
              <p className="text-xs text-text-disabled mt-1">أضف مستخدمًا جديدًا للبدء</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((u) => (
                <UserRow key={`${u.source}-${u.id}`} user={u} onClick={() => handleView(u)} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <AddUserModal
        open={addModalOpen}
        onClose={() => { setAddModalOpen(false); setAddType(null); }}
        addType={addType}
        onSelectType={handleAddUser}
        devices={devices}
        profiles={profiles}
        onCreated={() => { setAddModalOpen(false); setAddType(null); loadData(); }}
        toast={toast}
      />

      <UserDetailsDrawer
        open={detailsOpen}
        onClose={() => { setSelectedUser(null); setDetailsOpen(false); }}
        user={selectedUser}
        devices={devices}
        onUpdated={() => { loadData(); }}
        toast={toast}
        key={selectedUser ? `${selectedUser.source}-${selectedUser.id}-${detailsOpen}` : 'closed'}
      />
    </AppShell>
  );
}

function UserRow({ user, onClick }: { user: UnifiedUser; onClick: () => void }) {
  const isLocked = user.userType === 'cashier' && !!user.lockedUntil && new Date(user.lockedUntil) > new Date();
  const lockTime = user.lockedUntil && new Date(user.lockedUntil) > new Date()
    ? formatTime(user.lockedUntil) : null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-default bg-bg-surface hover:bg-neutral-50 transition-colors text-right"
    >
      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
        {user.userType === 'admin' ? (
          <UserCog className="h-5 w-5 text-primary-500" />
        ) : (
          <Monitor className="h-5 w-5 text-primary-500" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-primary truncate">{user.fullName}</p>
          {isLocked && <Lock className="h-3.5 w-3.5 text-danger-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={getUserTypeBadge(user.userType)} size="sm">
            {getUserTypeLabel(user.userType)}
          </Badge>
          {user.userType === 'admin' ? (
            <span className="text-xs text-text-secondary">{getRoleLabel(user.role as UserRole)}</span>
          ) : (
            <span className="text-xs text-text-secondary">{user.username}</span>
          )}
        </div>
      </div>

      {user.posDeviceName && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-text-secondary">
          <Smartphone className="h-3 w-3" />
          <span>{user.posDeviceName}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge variant={user.status === 'active' ? 'success' : 'danger'} dot size="sm">
          {user.status === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
        {lockTime && (
          <Badge variant="warning" size="sm">
            مقفل حتى {lockTime}
          </Badge>
        )}
      </div>

      <ChevronLeft className="h-4 w-4 text-text-disabled shrink-0" />
    </button>
  );
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    owner: 'مالك', manager: 'مدير', accountant: 'محاسب', cashier: 'كاشير',
  };
  return labels[role] || role;
}

function AddUserModal({
  open, onClose, addType, onSelectType, devices, profiles, onCreated, toast,
}: {
  open: boolean; onClose: () => void; addType: UserType | null;
  onSelectType: (t: UserType) => void;
  devices: PosDevice[]; profiles: ProfileData[];
  onCreated: () => void; toast: ReturnType<typeof useToast>['toast'];
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('accountant');
  const [status, setStatus] = useState('active');
  const [password, setPassword] = useState('');

  const [cashierName, setCashierName] = useState('');
  const [username, setUsername] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [cashierStatus, setCashierStatus] = useState('active');

  const resetForms = () => {
    setName(''); setEmail(''); setRole('accountant'); setStatus('active'); setPassword('');
    setCashierName(''); setUsername(''); setDeviceId(''); setPin(''); setConfirmPin(''); setCashierStatus('active');
    setError('');
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleCreateAdmin = async () => {
    setError('');
    if (!name.trim()) { setError('الاسم مطلوب'); return; }
    if (!email.trim()) { setError('البريد الإلكتروني مطلوب'); return; }
    if (!password) { setError('كلمة المرور مطلوبة'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

    if (profiles.some((p) => p.role === 'owner' && role === 'owner')) {
      setError('يوجد مالك بالفعل');
      return;
    }

    setSaving(true);
    const result = await createAdminUser({
      fullName: name.trim(),
      email: email.trim(),
      password,
      role: role as 'owner' | 'manager' | 'accountant',
      status: status as 'active' | 'inactive',
    });
    setSaving(false);

    if (result.success) {
      toast('success', `تم إنشاء المستخدم ${name.trim()} بنجاح`);
      resetForms();
      onCreated();
    } else {
      setError(result.error || 'فشل إنشاء المستخدم');
    }
  };

  const handleCreateCashier = async () => {
    setError('');
    if (!cashierName.trim()) { setError('الاسم مطلوب'); return; }
    if (!username.trim()) { setError('اسم المستخدم مطلوب'); return; }
    if (!deviceId) { setError('جهاز POS مطلوب'); return; }
    if (!pin) { setError('PIN مطلوب'); return; }
    if (pin.length < 4) { setError('PIN يجب أن يكون 4 أرقام على الأقل'); return; }
    if (pin !== confirmPin) { setError('PIN غير متطابق'); return; }

    setSaving(true);
    const result = await createCashierAccount(deviceId, username.trim(), cashierName.trim(), pin);
    setSaving(false);

    if (result.success) {
      toast('success', `تم إنشاء الكاشير ${cashierName.trim()} بنجاح`);
      resetForms();
      onCreated();
    } else {
      setError(result.error || 'فشل إنشاء الكاشير');
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} title="إضافة مستخدم جديد" size="md">
      {!addType ? (
        <div className="space-y-4 py-4">
          <p className="text-sm text-text-secondary">اختر نوع المستخدم:</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onSelectType('admin')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border-default hover:border-primary-500 hover:bg-primary-50/50 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-info-50 flex items-center justify-center">
                <UserCog className="h-7 w-7 text-info-500" />
              </div>
              <span className="font-semibold text-text-primary">مستخدم إدارة</span>
              <span className="text-xs text-text-secondary text-center">مالك - مدير - محاسب<br />دخول بالبريد الإلكتروني</span>
            </button>
            <button
              onClick={() => onSelectType('cashier')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border-default hover:border-primary-500 hover:bg-primary-50/50 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center">
                <Monitor className="h-7 w-7 text-neutral-500" />
              </div>
              <span className="font-semibold text-text-primary">كاشير</span>
              <span className="text-xs text-text-secondary text-center">دخول بـ POS<br />اسم مستخدم + PIN</span>
            </button>
          </div>
        </div>
      ) : addType === 'admin' ? (
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input label="الاسم الكامل *" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <Input label="البريد الإلكتروني *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <Input label="كلمة المرور *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          <Select
            label="الدور *"
            options={adminRoleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
          />
          <Select
            label="الحالة"
            options={cashierStatusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
          />

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} fullWidth>إلغاء</Button>
            <Button onClick={handleCreateAdmin} loading={saving} fullWidth>إنشاء المستخدم</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input label="الاسم الكامل *" value={cashierName} onChange={(e) => setCashierName(e.target.value)} fullWidth />
          <Input label="اسم المستخدم *" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
          <Select
            label="جهاز POS *"
            options={[
              { label: 'اختر جهاز...', value: '' },
              ...devices
                .filter((d) => d.status === 'active')
                .map((d) => ({ label: `${d.deviceName} (${d.posCode})`, value: d.id })),
            ]}
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            fullWidth
          />
          <Input label="PIN *" type="password" value={pin} onChange={(e) => setPin(e.target.value)} fullWidth inputMode="numeric" />
          <Input label="تأكيد PIN *" type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} fullWidth inputMode="numeric" />
          <Select
            label="الحالة"
            options={cashierStatusOptions}
            value={cashierStatus}
            onChange={(e) => setCashierStatus(e.target.value)}
            fullWidth
          />

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} fullWidth>إلغاء</Button>
            <Button onClick={handleCreateCashier} loading={saving} fullWidth>إنشاء الكاشير</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function UserDetailsDrawer({
  open, onClose, user, devices, onUpdated, toast,
}: {
  open: boolean; onClose: () => void; user: UnifiedUser | null;
  devices: PosDevice[]; onUpdated: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.userType === 'admin';
  const [editRole, setEditRole] = useState(isAdmin ? (user?.role || '') : '');
  const [editStatus, setEditStatus] = useState(isAdmin ? (user?.status || '') : '');

  const [editCashierName, setEditCashierName] = useState(!isAdmin ? (user?.fullName || '') : '');
  const [editUsername, setEditUsername] = useState(!isAdmin ? (user?.username || '') : '');
  const [editDeviceId, setEditDeviceId] = useState(!isAdmin ? (user?.posDeviceId || '') : '');
  const [editCashierStatus, setEditCashierStatus] = useState(!isAdmin ? (user?.status || '') : '');

  const [changePinModal, setChangePinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    if (user.userType === 'admin' && user.profile) {
      let updated: ProfileData | null = user.profile;
      if (editRole && editRole !== user.role) {
        updated = await updateProfileRole(user.id, editRole as UserRole);
      }
      if (updated && editStatus && editStatus !== user.status) {
        updated = await updateProfileStatus(user.id, editStatus as 'active' | 'inactive');
      }
      if (updated) {
        toast('success', 'تم تحديث المستخدم بنجاح');
        onUpdated();
      } else {
        toast('error', 'فشل تحديث المستخدم');
      }
    } else if (user.userType === 'cashier') {
      const result = await updateCashierAccount(
        user.id, editDeviceId, editUsername, editCashierName, editCashierStatus
      );
      if (result.success) {
        toast('success', 'تم تحديث الكاشير بنجاح');
        onUpdated();
      } else {
        toast('error', result.error || 'فشل تحديث الكاشير');
      }
    }

    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!user || user.userType !== 'admin') return;
    if (!user.email && !user.profile?.id) {
      toast('error', 'لا يوجد بريد إلكتروني لهذا المستخدم');
      return;
    }
    const emailToUse = user.email || `${user.id}@placeholder`;
    if (!emailToUse.includes('@')) {
      toast('error', 'لا يمكن إرسال إعادة تعيين: البريد الإلكتروني غير متوفر');
      return;
    }
    setSubmitting(true);
    const result = await sendPasswordReset(emailToUse);
    setSubmitting(false);
    if (result.success) {
      toast('success', 'تم إرسال رابط إعادة تعيين كلمة المرور');
    } else {
      toast('error', result.error || 'فشل إرسال الإيميل');
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setEditStatus(newStatus);

    if (user.userType === 'admin' && user.profile) {
      const updated = await updateProfileStatus(user.id, newStatus);
      if (updated) {
        toast('success', newStatus === 'active' ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم');
        onUpdated();
      } else {
        toast('error', 'فشل تغيير الحالة');
        setEditStatus(user.status);
      }
    } else if (user.userType === 'cashier') {
      const result = await updateCashierAccount(user.id, editDeviceId || user.posDeviceId!, editUsername || user.username!, editCashierName || user.fullName, newStatus);
      if (result.success) {
        toast('success', newStatus === 'active' ? 'تم تفعيل الكاشير' : 'تم تعطيل الكاشير');
        onUpdated();
      } else {
        toast('error', 'فشل تغيير الحالة');
        setEditCashierStatus(user.status);
      }
    }
  };

  const handleUnlock = async () => {
    if (!user || user.userType !== 'cashier') return;
    setSubmitting(true);
    const result = await unlockCashierAccount(user.id);
    setSubmitting(false);
    if (result.success) {
      toast('success', 'تم فك القفل');
      onUpdated();
    } else {
      toast('error', result.error || 'فشل فك القفل');
    }
  };

  const handleChangePin = async () => {
    if (!user || user.userType !== 'cashier') return;
    if (!newPin || newPin.length < 4) { toast('error', 'PIN يجب أن يكون 4 أرقام على الأقل'); return; }
    if (newPin !== confirmNewPin) { toast('error', 'PIN غير متطابق'); return; }

    setSavingPin(true);
    const result = await changeCashierPin(user.id, newPin);
    setSavingPin(false);

    if (result.success) {
      toast('success', 'تم تغيير PIN بنجاح');
      setChangePinModal(false);
      setNewPin('');
      setConfirmNewPin('');
    } else {
      toast('error', result.error || 'فشل تغيير PIN');
    }
  };

  if (!user) return null;

  const isLocked = user.userType === 'cashier' && !!user.lockedUntil && new Date(user.lockedUntil) > new Date();

  return (
    <>
      <Drawer open={open} onClose={onClose} title={user.fullName}>
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
              {user.userType === 'admin' ? (
                <UserCog className="h-6 w-6 text-primary-500" />
              ) : (
                <Monitor className="h-6 w-6 text-primary-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{user.fullName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={getUserTypeBadge(user.userType)} size="sm">
                  {getUserTypeLabel(user.userType)}
                </Badge>
                {isLocked && <Badge variant="warning" size="sm">مقفل</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <Shield className="h-4 w-4" />
              <span>نوع المستخدم: <strong className="text-text-primary">{getUserTypeLabel(user.userType)}</strong></span>
            </div>

            {user.userType === 'admin' ? (
              <>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="h-4 w-4" />
                  <span>الدخول: <strong className="text-text-primary">بريد إلكتروني</strong></span>
                </div>

                {user.email && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Mail className="h-4 w-4" />
                    <span>البريد: <strong className="text-text-primary">{user.email}</strong></span>
                  </div>
                )}

                <Select
                  label="الدور"
                  options={adminRoleOptions}
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  fullWidth
                />

                <Select
                  label="الحالة"
                  options={[
                    { label: 'نشط', value: 'active' },
                    { label: 'غير نشط', value: 'inactive' },
                  ]}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  fullWidth
                />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Monitor className="h-4 w-4" />
                  <span>الدخول: <strong className="text-text-primary">POS + اسم مستخدم + PIN</strong></span>
                </div>

                <Input label="الاسم الكامل" value={editCashierName} onChange={(e) => setEditCashierName(e.target.value)} fullWidth />
                <Input label="اسم المستخدم" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} fullWidth />
                <Select
                  label="جهاز POS"
                  options={[
                    { label: 'اختر جهاز...', value: '' },
                    ...devices.map((d) => ({ label: `${d.deviceName} (${d.posCode})`, value: d.id })),
                  ]}
                  value={editDeviceId}
                  onChange={(e) => setEditDeviceId(e.target.value)}
                  fullWidth
                />
                <Select
                  label="الحالة"
                  options={[
                    { label: 'نشط', value: 'active' },
                    { label: 'غير نشط', value: 'inactive' },
                  ]}
                  value={editCashierStatus}
                  onChange={(e) => setEditCashierStatus(e.target.value)}
                  fullWidth
                />
              </>
            )}
          </div>

          <div className="text-xs text-text-disabled space-y-1 bg-neutral-50 rounded-xl p-3">
            <p>تاريخ الإنشاء: {formatDate(user.createdAt)}</p>
            {user.lastLoginAt && <p>آخر دخول: {formatDate(user.lastLoginAt)} - {formatTime(user.lastLoginAt)}</p>}
            {user.posDeviceName && <p>الجهاز: {user.posDeviceName} ({user.posCode})</p>}
          </div>

          <div className="space-y-3">
            {user.userType === 'cashier' && (
              <>
                <Button
                  variant="outline"
                  icon={<KeyRound className="h-4 w-4" />}
                  onClick={() => setChangePinModal(true)}
                  fullWidth
                >
                  تغيير PIN
                </Button>
                {isLocked && (
                  <Button
                    variant="outline"
                    icon={<Lock className="h-4 w-4" />}
                    onClick={handleUnlock}
                    loading={submitting}
                    fullWidth
                  >
                    فك القفل
                  </Button>
                )}
              </>
            )}

            {user.userType === 'admin' && (
              <Button
                variant="outline"
                icon={<Mail className="h-4 w-4" />}
                onClick={handleResetPassword}
                loading={submitting}
                fullWidth
              >
                إرسال إعادة تعيين كلمة المرور
              </Button>
            )}

            <Button
              variant={user.status === 'active' ? 'danger' : 'success'}
              onClick={handleToggleStatus}
              loading={saving}
              fullWidth
            >
              {user.status === 'active' ? 'تعطيل المستخدم' : 'تفعيل المستخدم'}
            </Button>

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
      </Drawer>

      <Modal
        open={changePinModal}
        onClose={() => { setChangePinModal(false); setNewPin(''); setConfirmNewPin(''); }}
        title="تغيير PIN"
        size="sm"
      >
        <div className="space-y-4 py-2">
          <Input
            label="PIN الجديد *"
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            fullWidth
            inputMode="numeric"
          />
          <Input
            label="تأكيد PIN الجديد *"
            type="password"
            value={confirmNewPin}
            onChange={(e) => setConfirmNewPin(e.target.value)}
            fullWidth
            inputMode="numeric"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setChangePinModal(false); setNewPin(''); setConfirmNewPin(''); }} fullWidth>
              إلغاء
            </Button>
            <Button onClick={handleChangePin} loading={savingPin} fullWidth>
              حفظ PIN
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
