'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ButtonsPreview from '@/components/design-system/ButtonsPreview';
import InputsPreview from '@/components/design-system/InputsPreview';
import CardsPreview from '@/components/design-system/CardsPreview';
import TablesPreview from '@/components/design-system/TablesPreview';
import StatusPreview from '@/components/design-system/StatusPreview';
import Modal from '@/components/ui/Modal';
import Drawer from '@/components/ui/Drawer';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import Tabs from '@/components/ui/Tabs';

const compTabs = [
  { id: 'buttons', label: 'الأزرار' },
  { id: 'inputs', label: 'الحقول' },
  { id: 'cards', label: 'البطاقات' },
  { id: 'tables', label: 'الجداول' },
  { id: 'badges', label: 'الحالات' },
  { id: 'modals', label: 'النوافذ' },
  { id: 'notifications', label: 'التنبيهات' },
  { id: 'states', label: 'الحالات العامة' },
];

function ModalsPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">النوافذ والسحوبات</h2>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setModalOpen(true)}>فتح نافذة</Button>
        <Button variant="outline" onClick={() => setDrawerOpen(true)}>فتح Drawer</Button>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>فتح Bottom Sheet</Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="تأكيد العملية">
        <p className="text-sm text-text-secondary mb-4">هل أنت متأكد من تنفيذ هذه العملية؟</p>
        <div className="flex gap-2">
          <Button fullWidth onClick={() => setModalOpen(false)}>تأكيد</Button>
          <Button variant="outline" fullWidth onClick={() => setModalOpen(false)}>إلغاء</Button>
        </div>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="قائمة الخيارات">
        <p className="text-sm text-text-secondary">محتوى القائمة الجانبية</p>
      </Drawer>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="خيارات إضافية">
        <p className="text-sm text-text-secondary">محتوى الـ Bottom Sheet المخصص للجوال</p>
      </BottomSheet>
    </div>
  );
}

function NotificationsPreview() {
  const { toast } = useToast();

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">التنبيهات</h2>
      <div className="flex flex-wrap gap-3">
        <Button variant="success" onClick={() => toast('success', 'تم الحفظ بنجاح', 'تم حفظ التغييرات')}>نجاح</Button>
        <Button variant="danger" onClick={() => toast('error', 'حدث خطأ', 'يرجى المحاولة مرة أخرى')}>خطأ</Button>
        <Button variant="outline" onClick={() => toast('warning', 'تنبيه', 'هذا الإجراء غير قابل للتراجع')}>تنبيه</Button>
        <Button onClick={() => toast('info', 'معلومات', 'تم تحميل البيانات بنجاح')}>معلومات</Button>
      </div>
    </div>
  );
}

function StatesPreview() {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">الحالات العامة</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">لا توجد بيانات</p>
            <p className="text-xs text-text-secondary mt-1">لم يتم العثور على نتائج</p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-warning-50 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">لا توجد صلاحية</p>
            <p className="text-xs text-text-secondary mt-1">ليس لديك صلاحية للوصول</p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
            <p className="text-sm font-semibold text-text-primary">حدث خطأ</p>
            <p className="text-xs text-text-secondary mt-1">يرجى المحاولة مرة أخرى</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ComponentsPreviewPage() {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <AppShell title="معاينة المكونات" activePath="/components-preview">
      <div className="mb-6 overflow-x-auto">
        <Tabs tabs={compTabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
      </div>

      <div className="bg-bg-surface border border-border-default rounded-card p-4 sm:p-6">
        {activeTab === 'buttons' && <ButtonsPreview />}
        {activeTab === 'inputs' && <InputsPreview />}
        {activeTab === 'cards' && <CardsPreview />}
        {activeTab === 'tables' && <TablesPreview />}
        {activeTab === 'badges' && <StatusPreview />}
        {activeTab === 'modals' && <ModalsPreview />}
        {activeTab === 'notifications' && <NotificationsPreview />}
        {activeTab === 'states' && <StatesPreview />}
      </div>
    </AppShell>
  );
}
