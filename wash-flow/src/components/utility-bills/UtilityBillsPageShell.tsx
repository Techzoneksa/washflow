'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import UtilityBillsSummaryCards from './UtilityBillsSummaryCards';
import UtilityBillsFilters from './UtilityBillsFilters';
import UtilityBillsTable from './UtilityBillsTable';
import UtilityBillDetailsDrawer from './UtilityBillDetailsDrawer';
import UtilityBillFormDrawer from './UtilityBillFormDrawer';
import RecordUtilityPaymentModal from './RecordUtilityPaymentModal';
import { getUtilityBills, addUtilityBill, updateUtilityBill } from '@/lib/mock-utility-bills';
import type { UtilityBill } from '@/types/utility-bills';
import type { UtilityBillFormData } from './UtilityBillFormDrawer';
import { Plus, FileText } from 'lucide-react';

const PAGE_SIZE = 10;

export default function UtilityBillsPageShell() {
  const { toast } = useToast();
  const [bills, setBills] = useState<UtilityBill[]>(getUtilityBills);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dueDateRange, setDueDateRange] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editBill, setEditBill] = useState<UtilityBill | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentBill, setPaymentBill] = useState<UtilityBill | null>(null);

  const refreshBills = useCallback(() => {
    setBills([...getUtilityBills()]);
  }, []);

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (search) {
        const q = search.toLowerCase();
        const billTypeLabels: Record<string, string> = {
          electricity: 'كهرباء', water: 'ماء', internet: 'إنترنت', telecom: 'اتصالات',
          rent: 'إيجار', software: 'اشتراك برنامج', municipality: 'بلدية', government: 'رسوم حكومية', other: 'أخرى',
        };
        const match =
          b.billNumber.toLowerCase().includes(q) ||
          (billTypeLabels[b.type] || '').includes(q) ||
          b.provider.toLowerCase().includes(q) ||
          (b.providerAccountNumber || '').toLowerCase().includes(q) ||
          b.status.toLowerCase().includes(q) ||
          (b.notes || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (typeFilter !== 'all' && b.type !== typeFilter) return false;
      if (dueDateRange !== 'all') {
        const due = new Date(b.dueDate);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        if (dueDateRange === 'today') {
          if (b.dueDate !== todayStr) return false;
        } else if (dueDateRange === 'week') {
          const nextWeek = new Date(now.getTime() + 7 * 86400000);
          if (due < now || due > nextWeek) return false;
        } else if (dueDateRange === 'month') {
          if (due.getMonth() !== now.getMonth() || due.getFullYear() !== now.getFullYear()) return false;
        } else if (dueDateRange === 'overdue') {
          if (b.status !== 'overdue') return false;
        }
      }
      return true;
    });
  }, [bills, search, statusFilter, typeFilter, dueDateRange]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

  const summary = useMemo(() => {
    const now = new Date();
    const totalCount = bills.length;
    const unpaidCount = bills.filter((b) => b.status === 'unpaid').length;
    const overdueCount = bills.filter((b) => b.status === 'overdue').length;
    const nextWeek = new Date(now.getTime() + 7 * 86400000);
    const dueThisWeek = bills.filter((b) => {
      if (b.status === 'paid') return false;
      const due = new Date(b.dueDate);
      return due >= now && due <= nextWeek;
    }).length;
    const monthPaid = bills
      .filter((b) => {
        if (b.status !== 'paid' || !b.paidAt) return false;
        const paid = new Date(b.paidAt);
        return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + b.total, 0);
    return { totalCount, unpaidCount, overdueCount, dueThisWeek, monthPaid };
  }, [bills]);

  const handleView = useCallback((b: UtilityBill) => {
    setSelectedBill(b);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((b: UtilityBill) => {
    setEditBill(b);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditBill(null);
    setFormOpen(true);
  }, []);

  const handleRecordPayment = useCallback((b: UtilityBill) => {
    setPaymentBill(b);
    setPaymentModalOpen(true);
  }, []);

  const handleSavePayment = useCallback((id: string, method: string, date: string, notes: string) => {
    const updated = updateUtilityBill(id, {
      status: 'paid',
      paymentMethod: method as 'cash' | 'bank' | 'transfer' | 'card',
      paidAt: date,
      notes: notes || undefined,
    });
    if (updated) {
      refreshBills();
      setPaymentModalOpen(false);
      setPaymentBill(null);
      toast('success', 'تم تسجيل السداد بنجاح');
    }
  }, [refreshBills, toast]);

  const handleSave = useCallback((data: UtilityBillFormData) => {
    const isOverdue = data.status === 'unpaid' && new Date(data.dueDate) < new Date() && data.dueDate < new Date().toISOString().split('T')[0];
    const finalStatus = isOverdue ? 'overdue' : data.status;

    if (editBill) {
      const updated = updateUtilityBill(editBill.id, {
        type: data.type,
        provider: data.provider,
        providerAccountNumber: data.providerAccountNumber || undefined,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        amount: data.amount,
        vatAmount: data.hasVat ? data.amount * 0.15 : 0,
        total: data.amount + (data.hasVat ? data.amount * 0.15 : 0),
        status: finalStatus as UtilityBill['status'],
        paymentMethod: data.paymentMethod as UtilityBill['paymentMethod'],
        paidAt: data.paidAt,
        notes: data.notes || undefined,
      });
      if (updated) {
        refreshBills();
        setFormOpen(false);
        setEditBill(null);
        toast('success', 'تم تحديث الفاتورة بنجاح');
      }
    } else {
      const created = addUtilityBill({
        type: data.type,
        provider: data.provider,
        providerAccountNumber: data.providerAccountNumber || undefined,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        amount: data.amount,
        vatAmount: data.hasVat ? data.amount * 0.15 : 0,
        total: data.amount + (data.hasVat ? data.amount * 0.15 : 0),
        status: finalStatus as UtilityBill['status'],
        paymentMethod: data.paymentMethod as UtilityBill['paymentMethod'],
        paidAt: data.paidAt,
        attachmentUrl: undefined,
        notes: data.notes || undefined,
        createdBy: 'مالك النظام',
      });
      if (created) {
        refreshBills();
        setFormOpen(false);
        toast('success', 'تم إضافة الفاتورة بنجاح');
      }
    }
  }, [editBill, refreshBills, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditBill(null);
  }, []);

  return (
    <>
      <PageHeader
        title="فواتير الخدمات"
        description="متابعة وسداد فواتير الخدمات الدورية"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة فاتورة خدمة
          </Button>
        }
      />

      <UtilityBillsSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <UtilityBillsFilters
            search={search}
            status={statusFilter}
            type={typeFilter}
            dueDateRange={dueDateRange}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
            onTypeChange={(v) => { setTypeFilter(v); setPage(1); }}
            onDueDateRangeChange={(v) => { setDueDateRange(v); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-16 w-16" />}
            title="لا توجد فواتير خدمات"
            description="لا توجد فواتير تطابق معايير البحث"
          />
        ) : (
          <UtilityBillsTable
            bills={paginated.items}
            page={page}
            totalPages={paginated.totalPages}
            onPageChange={setPage}
            onView={handleView}
            onEdit={handleEdit}
          />
        )}
      </div>

      <UtilityBillDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        bill={selectedBill}
        onEdit={handleEdit}
        onRecordPayment={handleRecordPayment}
      />

      <UtilityBillFormDrawer
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        bill={editBill}
      />

      <RecordUtilityPaymentModal
        open={paymentModalOpen}
        onClose={() => { setPaymentModalOpen(false); setPaymentBill(null); }}
        bill={paymentBill}
        onSave={handleSavePayment}
      />
    </>
  );
}
