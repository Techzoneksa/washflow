'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Drawer from '@/components/ui/Drawer';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useAuthGuard } from '@/lib/route-guards';
import { useToast } from '@/components/ui/Toast';
import { getPosDevices, createPosDevice, updatePosDevice } from '@/lib/data/pos-devices';
import { getCashierAccountsByDevice, createCashierAccount, updateCashierAccount, changeCashierPin, unlockCashierAccount } from '@/lib/data/cashier-accounts';
import { getEmployees } from '@/lib/data/employees';
import type { PosDevice } from '@/types/pos-devices';
import type { CashierAccount } from '@/types/pos-devices';
import type { Employee } from '@/types/employees';
import { Monitor, UserRound, Plus, Search, Edit3, Lock, ChevronLeft, Key, Smartphone } from 'lucide-react';

interface DeviceForm {
  posCode: string;
  deviceName: string;
  notes: string;
}

interface CashierForm {
  posDeviceId: string;
  username: string;
  fullName: string;
  pin: string;
  confirmPin: string;
  employeeId: string;
  status: string;
}

const emptyDeviceForm: DeviceForm = { posCode: '', deviceName: '', notes: '' };
const emptyCashierForm: CashierForm = { posDeviceId: '', username: '', fullName: '', pin: '', confirmPin: '', employeeId: '', status: 'active' };

export default function POSDevicesSettingsPage() {
  const { authorized, checking } = useAuthGuard(['owner']);
  const { toast } = useToast();

  const [devices, setDevices] = useState<PosDevice[]>([]);
  const [cashiersByDevice, setCashiersByDevice] = useState<Record<string, CashierAccount[]>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'devices' | 'cashiers'>('devices');

  const [deviceDrawerOpen, setDeviceDrawerOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<PosDevice | null>(null);
  const [deviceForm, setDeviceForm] = useState<DeviceForm>(emptyDeviceForm);
  const [savingDevice, setSavingDevice] = useState(false);

  const [cashierDrawerOpen, setCashierDrawerOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState<CashierAccount | null>(null);
  const [cashierForm, setCashierForm] = useState<CashierForm>(emptyCashierForm);
  const [savingCashier, setSavingCashier] = useState(false);

  const [changePinModal, setChangePinModal] = useState<{ accountId: string; fullName: string } | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  const [selectedDeviceForCashiers, setSelectedDeviceForCashiers] = useState<string>('all');

  const loadData = useCallback(async () => {
    if (!authorized) return;
    const [deviceList, empList] = await Promise.all([
      getPosDevices(),
      getEmployees(),
    ]);
    setDevices(deviceList);
    setEmployees(empList);

    const cashierMap: Record<string, CashierAccount[]> = {};
    for (const d of deviceList) {
      const accounts = await getCashierAccountsByDevice(d.id);
      cashierMap[d.id] = accounts;
    }
    setCashiersByDevice(cashierMap);
    setLoading(false);
  }, [authorized]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const filteredDevices = useMemo(() => {
    if (!search) return devices;
    const q = search.toLowerCase();
    return devices.filter((d) => d.posCode.toLowerCase().includes(q) || d.deviceName.toLowerCase().includes(q));
  }, [devices, search]);

  const allCashiers = useMemo(() => {
    const result: (CashierAccount & { devicePosCode?: string; deviceName?: string })[] = [];
    for (const d of devices) {
      const accounts = cashiersByDevice[d.id] || [];
      for (const a of accounts) {
        result.push({ ...a, devicePosCode: d.posCode, deviceName: d.deviceName });
      }
    }
    if (selectedDeviceForCashiers !== 'all') {
      return result.filter((c) => c.posDeviceId === selectedDeviceForCashiers);
    }
    return result;
  }, [devices, cashiersByDevice, selectedDeviceForCashiers]);

  const filteredCashiers = useMemo(() => {
    if (!search) return allCashiers;
    const q = search.toLowerCase();
    return allCashiers.filter((c) => c.username.toLowerCase().includes(q) || c.fullName.toLowerCase().includes(q) || (c.devicePosCode || '').toLowerCase().includes(q));
  }, [allCashiers, search]);

  // Device drawer handlers
  const openAddDevice = () => {
    setEditingDevice(null);
    setDeviceForm(emptyDeviceForm);
    setDeviceDrawerOpen(true);
  };

  const openEditDevice = (d: PosDevice) => {
    setEditingDevice(d);
    setDeviceForm({ posCode: d.posCode, deviceName: d.deviceName, notes: d.notes || '' });
    setDeviceDrawerOpen(true);
  };

  const handleSaveDevice = async () => {
    if (!deviceForm.posCode.trim()) { toast('error', 'رقم الجهاز مطلوب'); return; }
    if (!deviceForm.deviceName.trim()) { toast('error', 'اسم الجهاز مطلوب'); return; }
    setSavingDevice(true);

    if (editingDevice) {
      const result = await updatePosDevice(
        editingDevice.id,
        deviceForm.posCode.trim(),
        deviceForm.deviceName.trim(),
        editingDevice.status,
        deviceForm.notes.trim() || undefined
      );
      if (result.success) {
        toast('success', 'تم تحديث الجهاز بنجاح');
        setDeviceDrawerOpen(false);
        loadData();
      } else {
        toast('error', result.error || 'فشل تحديث الجهاز');
      }
    } else {
      const result = await createPosDevice(
        deviceForm.posCode.trim(),
        deviceForm.deviceName.trim(),
        deviceForm.notes.trim() || undefined
      );
      if (result.success) {
        toast('success', 'تم إضافة الجهاز بنجاح');
        setDeviceDrawerOpen(false);
        loadData();
      } else {
        toast('error', result.error || 'فشل إضافة الجهاز');
      }
    }
    setSavingDevice(false);
  };

  // Cashier drawer handlers
  const openAddCashier = (deviceId?: string) => {
    setEditingCashier(null);
    setCashierForm({ ...emptyCashierForm, posDeviceId: deviceId || (devices.length > 0 ? devices[0].id : '') });
    setCashierDrawerOpen(true);
  };

  const openEditCashier = (c: CashierAccount) => {
    setEditingCashier(c);
    setCashierForm({
      posDeviceId: c.posDeviceId,
      username: c.username,
      fullName: c.fullName,
      pin: '',
      confirmPin: '',
      employeeId: c.employeeId || '',
      status: c.status,
    });
    setCashierDrawerOpen(true);
  };

  const handleSaveCashier = async () => {
    if (!cashierForm.posDeviceId) { toast('error', 'جهاز POS مطلوب'); return; }
    if (!cashierForm.username.trim()) { toast('error', 'اسم المستخدم مطلوب'); return; }
    if (!cashierForm.fullName.trim()) { toast('error', 'الاسم الكامل مطلوب'); return; }

    if (!editingCashier) {
      if (!cashierForm.pin) { toast('error', 'PIN مطلوب'); return; }
      if (cashierForm.pin.length < 4 || cashierForm.pin.length > 8) { toast('error', 'PIN يجب أن يكون 4 إلى 8 أرقام'); return; }
      if (!/^\d+$/.test(cashierForm.pin)) { toast('error', 'PIN يجب أن يكون أرقامًا فقط'); return; }
      if (cashierForm.pin !== cashierForm.confirmPin) { toast('error', 'PIN غير متطابق'); return; }
    }

    setSavingCashier(true);

    if (editingCashier) {
      const result = await updateCashierAccount(
        editingCashier.id,
        cashierForm.posDeviceId,
        cashierForm.username.trim(),
        cashierForm.fullName.trim(),
        cashierForm.status,
        cashierForm.employeeId || undefined
      );
      if (result.success) {
        toast('success', 'تم تحديث الكاشير بنجاح');
        setCashierDrawerOpen(false);
        loadData();
      } else {
        toast('error', result.error || 'فشل تحديث الكاشير');
      }
    } else {
      const result = await createCashierAccount(
        cashierForm.posDeviceId,
        cashierForm.username.trim(),
        cashierForm.fullName.trim(),
        cashierForm.pin,
        cashierForm.employeeId || undefined
      );
      if (result.success) {
        toast('success', 'تم إضافة الكاشير بنجاح');
        setCashierDrawerOpen(false);
        loadData();
      } else {
        toast('error', result.error || 'فشل إضافة الكاشير');
      }
    }
    setSavingCashier(false);
  };

  const handleChangePin = async () => {
    if (!changePinModal) return;
    if (!newPin) { toast('error', 'PIN الجديد مطلوب'); return; }
    if (newPin.length < 4 || newPin.length > 8) { toast('error', 'PIN يجب أن يكون 4 إلى 8 أرقام'); return; }
    if (!/^\d+$/.test(newPin)) { toast('error', 'PIN يجب أن يكون أرقامًا فقط'); return; }
    if (newPin !== confirmPin) { toast('error', 'PIN غير متطابق'); return; }

    setSavingPin(true);
    const result = await changeCashierPin(changePinModal.accountId, newPin);
    if (result.success) {
      toast('success', 'تم تغيير PIN بنجاح');
      setChangePinModal(null);
      setNewPin('');
      setConfirmPin('');
    } else {
      toast('error', result.error || 'فشل تغيير PIN');
    }
    setSavingPin(false);
  };

  const handleUnlock = async (accountId: string) => {
    const result = await unlockCashierAccount(accountId);
    if (result.success) {
      toast('success', 'تم فك القفل بنجاح');
      loadData();
    } else {
      toast('error', result.error || 'فشل فك القفل');
    }
  };

  const getDeviceOptions = () => [
    ...devices.map((d) => ({ label: `${d.posCode} - ${d.deviceName}`, value: d.id })),
  ];

  if (checking || !authorized) return null;

  return (
    <AppShell title="أجهزة POS والكاشير" activePath="/settings">
      <div className="max-w-5xl">
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-warning-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">أجهزة نقاط البيع والكاشير</h2>
              <p className="text-sm text-text-secondary">إدارة أجهزة POS وحسابات الكاشير</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-neutral-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('devices')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'devices' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Monitor className="h-4 w-4" />
              أجهزة POS
            </button>
            <button
              onClick={() => setActiveTab('cashiers')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'cashiers' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <UserRound className="h-4 w-4" />
              حسابات الكاشير
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : activeTab === 'devices' ? (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="بحث برقم أو اسم الجهاز..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                    fullWidth
                  />
                </div>
                <Button onClick={openAddDevice} icon={<Plus className="h-4 w-4" />}>
                  إضافة جهاز POS
                </Button>
              </div>

              {filteredDevices.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Monitor className="h-16 w-16 text-text-disabled mb-4" />
                  <p className="text-sm font-medium text-text-secondary">لا توجد أجهزة POS بعد</p>
                  <p className="text-xs text-text-disabled mt-1">أضف جهاز POS لبدء إعداد حسابات الكاشير</p>
                  <Button onClick={openAddDevice} className="mt-4" variant="outline" icon={<Plus className="h-4 w-4" />}>
                    إضافة جهاز POS
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDevices.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => openEditDevice(d)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-default bg-bg-surface hover:bg-neutral-50 transition-colors text-right"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                        <Monitor className="h-5 w-5 text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-sm font-semibold text-text-primary truncate">{d.deviceName}</p>
                        <p className="text-xs text-text-secondary">رمز: {d.posCode}</p>
                      </div>
                      <Badge variant={d.status === 'active' ? 'success' : 'danger'} dot size="sm">
                        {d.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <ChevronLeft className="h-4 w-4 text-text-disabled shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="بحث باسم المستخدم أو الجهاز..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                    fullWidth
                  />
                </div>
                <div className="w-44">
                  <Select
                    options={[
                      { label: 'جميع الأجهزة', value: 'all' },
                      ...devices.map((d) => ({ label: `${d.posCode} - ${d.deviceName}`, value: d.id })),
                    ]}
                    value={selectedDeviceForCashiers}
                    onChange={(e) => setSelectedDeviceForCashiers(e.target.value)}
                  />
                </div>
                <Button onClick={() => openAddCashier()} icon={<Plus className="h-4 w-4" />} disabled={devices.length === 0}>
                  إضافة كاشير
                </Button>
              </div>

              {filteredCashiers.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <UserRound className="h-16 w-16 text-text-disabled mb-4" />
                  {devices.length === 0 ? (
                    <>
                      <p className="text-sm font-medium text-text-secondary">لا توجد أجهزة POS بعد</p>
                      <p className="text-xs text-text-disabled mt-1">أضف جهاز POS أولاً</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-text-secondary">لا توجد حسابات كاشير بعد</p>
                      <p className="text-xs text-text-disabled mt-1">أضف حساب كاشير لجهاز POS</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCashiers.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border-default bg-bg-surface"
                    >
                      <div className="w-10 h-10 rounded-full bg-info-50 flex items-center justify-center shrink-0">
                        <UserRound className="h-5 w-5 text-info-500" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-sm font-semibold text-text-primary truncate">{c.fullName}</p>
                        <p className="text-xs text-text-secondary">
                          {c.username} @ {c.devicePosCode || c.posDeviceId.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.failedAttempts >= 5 && c.lockedUntil && new Date(c.lockedUntil) > new Date() && (
                          <button
                            onClick={() => handleUnlock(c.id)}
                            className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500 transition-colors"
                            title="فك القفل"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setChangePinModal({ accountId: c.id, fullName: c.fullName })}
                          className="p-1.5 rounded-lg hover:bg-warning-50 text-warning-500 transition-colors"
                          title="تغيير PIN"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditCashier(c)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors"
                          title="تعديل"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <Badge variant={c.status === 'active' ? 'success' : 'danger'} dot size="sm">
                          {c.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                        {c.lockedUntil && new Date(c.lockedUntil) > new Date() && (
                          <Badge variant="danger" size="sm">مقفل</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Device Drawer */}
      <Drawer
        open={deviceDrawerOpen}
        onClose={() => setDeviceDrawerOpen(false)}
        title={editingDevice ? 'تعديل جهاز POS' : 'إضافة جهاز POS'}
      >
        <div className="space-y-4">
          <Input
            label="رقم جهاز POS"
            placeholder="مثال: F465"
            value={deviceForm.posCode}
            onChange={(e) => setDeviceForm({ ...deviceForm, posCode: e.target.value })}
            fullWidth
          />
          <Input
            label="اسم الجهاز"
            placeholder="مثال: جهاز الكاشير الرئيسي"
            value={deviceForm.deviceName}
            onChange={(e) => setDeviceForm({ ...deviceForm, deviceName: e.target.value })}
            fullWidth
          />
          {editingDevice && (
            <Select
              label="الحالة"
              options={[
                { label: 'نشط', value: 'active' },
                { label: 'غير نشط', value: 'inactive' },
              ]}
              value={editingDevice.status}
              onChange={(e) => setEditingDevice({ ...editingDevice, status: e.target.value as 'active' | 'inactive' })}
              fullWidth
            />
          )}
          <Input
            label="ملاحظات (اختياري)"
            placeholder="..."
            value={deviceForm.notes}
            onChange={(e) => setDeviceForm({ ...deviceForm, notes: e.target.value })}
            fullWidth
          />
          <Button onClick={handleSaveDevice} fullWidth loading={savingDevice}>
            {editingDevice ? 'حفظ التغييرات' : 'إضافة الجهاز'}
          </Button>
        </div>
      </Drawer>

      {/* Cashier Drawer */}
      <Drawer
        open={cashierDrawerOpen}
        onClose={() => setCashierDrawerOpen(false)}
        title={editingCashier ? 'تعديل كاشير' : 'إضافة كاشير'}
      >
        <div className="space-y-4">
          <Select
            label="جهاز POS"
            options={getDeviceOptions()}
            value={cashierForm.posDeviceId}
            onChange={(e) => setCashierForm({ ...cashierForm, posDeviceId: e.target.value })}
            fullWidth
          />
          <Input
            label="الاسم الكامل"
            placeholder="مثال: أحمد الحربي"
            value={cashierForm.fullName}
            onChange={(e) => setCashierForm({ ...cashierForm, fullName: e.target.value })}
            fullWidth
          />
          <Input
            label="اسم المستخدم"
            placeholder="مثال: ahmed"
            value={cashierForm.username}
            onChange={(e) => setCashierForm({ ...cashierForm, username: e.target.value })}
            fullWidth
          />
          {!editingCashier && (
            <>
              <Input
                label="PIN"
                type="password"
                placeholder="4-8 أرقام"
                value={cashierForm.pin}
                onChange={(e) => setCashierForm({ ...cashierForm, pin: e.target.value })}
                fullWidth
                inputMode="numeric"
              />
              <Input
                label="تأكيد PIN"
                type="password"
                placeholder="أعد إدخال PIN"
                value={cashierForm.confirmPin}
                onChange={(e) => setCashierForm({ ...cashierForm, confirmPin: e.target.value })}
                fullWidth
                inputMode="numeric"
              />
            </>
          )}
          <Select
            label="الحالة"
            options={[
              { label: 'نشط', value: 'active' },
              { label: 'غير نشط', value: 'inactive' },
            ]}
            value={cashierForm.status}
            onChange={(e) => setCashierForm({ ...cashierForm, status: e.target.value })}
            fullWidth
          />
          {employees.length > 0 && (
            <Select
              label="العامل المرتبط (اختياري)"
              options={[
                { label: 'بدون', value: '' },
                ...employees.map((e) => ({ label: e.fullName, value: e.id })),
              ]}
              value={cashierForm.employeeId}
              onChange={(e) => setCashierForm({ ...cashierForm, employeeId: e.target.value })}
              fullWidth
            />
          )}
          <Button onClick={handleSaveCashier} fullWidth loading={savingCashier}>
            {editingCashier ? 'حفظ التغييرات' : 'إضافة الكاشير'}
          </Button>
        </div>
      </Drawer>

      {/* Change PIN Modal */}
      <Modal open={!!changePinModal} onClose={() => { setChangePinModal(null); setNewPin(''); setConfirmPin(''); }} size="sm">
        {changePinModal && (
          <div className="space-y-4 py-2">
            <h3 className="text-base font-bold text-text-primary">تغيير PIN</h3>
            <p className="text-sm text-text-secondary">تغيير PIN لحساب: {changePinModal.fullName}</p>

            <Input
              label="PIN الجديد"
              type="password"
              placeholder="4-8 أرقام"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              fullWidth
              inputMode="numeric"
            />
            <Input
              label="تأكيد PIN"
              type="password"
              placeholder="أعد إدخال PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              fullWidth
              inputMode="numeric"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setChangePinModal(null); setNewPin(''); setConfirmPin(''); }} fullWidth>
                إلغاء
              </Button>
              <Button onClick={handleChangePin} loading={savingPin} fullWidth>
                تغيير PIN
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
