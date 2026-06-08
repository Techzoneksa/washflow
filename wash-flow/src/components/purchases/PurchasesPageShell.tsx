'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import PurchasesSummaryCards from './PurchasesSummaryCards';
import PurchasesFilters from './PurchasesFilters';
import PurchasesTable from './PurchasesTable';
import PurchaseDetailsDrawer from './PurchaseDetailsDrawer';
import RecordPaymentModal from './RecordPaymentModal';
import { getPurchases, updatePurchase } from '@/lib/data/purchases';
import type { PurchaseInvoice } from '@/types/purchases';
import { Plus, Package } from 'lucide-react';

const PAGE_SIZE = 10;

export default function PurchasesPageShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSupplierId = searchParams.get('supplierId') || undefined;

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState(preselectedSupplierId || 'all');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);

  const { toast } = useToast();

  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseInvoice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const refreshPurchases = useCallback(async () => {
    setLoading(true);
    const data = await getPurchases();
    setPurchases(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    getPurchases().then((data) => { setPurchases(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          p.purchaseNumber.toLowerCase().includes(q) ||
          (p.supplierInvoiceNumber || '').toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          p.items.some((item) => item.name.toLowerCase().includes(q)) ||
          (p.paymentMethod || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (paymentStatus !== 'all' && p.paymentStatus !== paymentStatus) return false;
      if (paymentMethod !== 'all' && p.paymentMethod !== paymentMethod) return false;
      if (supplierFilter !== 'all' && p.supplierId !== supplierFilter) return false;

      if (dateRange !== 'all') {
        const purchaseDate = new Date(p.date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - purchaseDate.getTime()) / 86400000);
        if (dateRange === 'today' && diffDays > 0) return false;
        if (dateRange === 'week' && diffDays > 7) return false;
        if (dateRange === 'month' && (now.getMonth() !== purchaseDate.getMonth() || now.getFullYear() !== purchaseDate.getFullYear())) return false;
      }

      return true;
    });
  }, [purchases, search, paymentStatus, paymentMethod, supplierFilter, dateRange]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

  const summary = useMemo(() => {
    const now = new Date();
    const monthPurchases = purchases.filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthTotal = monthPurchases.reduce((sum, p) => sum + p.total, 0);
    const paidCount = purchases.filter((p) => p.paymentStatus === 'paid').length;
    const unpaidCount = purchases.filter((p) => p.paymentStatus === 'unpaid').length;
    const totalRemaining = purchases.reduce((sum, p) => sum + p.remainingAmount, 0);
    return {
      monthTotal,
      invoicesCount: purchases.length,
      paidCount,
      unpaidCount,
      totalRemaining,
    };
  }, [purchases]);

  const handleView = useCallback((p: PurchaseInvoice) => {
    setSelectedPurchase(p);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((p: PurchaseInvoice) => {
    router.push(`/purchases/${p.id}/edit`);
  }, [router]);

  const handleAdd = useCallback(() => {
    router.push('/purchases/new');
  }, [router]);

  const handleRecordPayment = useCallback((p: PurchaseInvoice) => {
    setSelectedPurchase(p);
    setPaymentModalOpen(true);
  }, []);

  const handleConfirmPayment = useCallback(async (id: string, amount: number, method: string, date: string, notes: string) => {
    const result = await updatePurchase(id, {
      paidAmount: amount,
      remainingAmount: 0,
      paymentStatus: 'paid',
      paymentMethod: method as 'cash' | 'bank' | 'transfer' | 'credit',
      notes: notes || undefined,
    });

    if (result.purchase) {
      await refreshPurchases();
      setPaymentModalOpen(false);
      setSelectedPurchase(null);
      toast('success', 'تم تسجيل السداد بنجاح');
    } else {
      toast('error', result.error || 'فشل تسجيل السداد');
    }
  }, [refreshPurchases, toast]);

  const handleClosePaymentModal = useCallback(() => {
    setPaymentModalOpen(false);
    setSelectedPurchase(null);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedPurchase(null);
  }, []);

  if (loading && purchases.length === 0) {
    return (
      <>
        <PageHeader
          title="المشتريات"
          description="تسجيل ومتابعة فواتير مشتريات الموردين"
          actions={
            <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
              إضافة فاتورة شراء
            </Button>
          }
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="المشتريات"
        description="تسجيل ومتابعة فواتير مشتريات الموردين"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة فاتورة شراء
          </Button>
        }
      />

      <PurchasesSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <PurchasesFilters
            search={search}
            paymentStatus={paymentStatus}
            paymentMethod={paymentMethod}
            supplierId={supplierFilter}
            dateRange={dateRange}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            onPaymentStatusChange={(v) => { setPaymentStatus(v); setPage(1); }}
            onPaymentMethodChange={(v) => { setPaymentMethod(v); setPage(1); }}
            onSupplierChange={(v) => { setSupplierFilter(v); setPage(1); }}
            onDateRangeChange={(v) => { setDateRange(v); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-16 w-16" />}
            title="لا توجد مشتريات"
            description="لا توجد فواتير مشتريات تطابق معايير البحث"
          />
        ) : (
          <PurchasesTable
            purchases={paginated.items}
            page={page}
            totalPages={paginated.totalPages}
            onPageChange={setPage}
            onView={handleView}
            onEdit={handleEdit}
          />
        )}
      </div>

      <PurchaseDetailsDrawer
        open={detailsOpen}
        onClose={handleCloseDetails}
        purchase={selectedPurchase}
        onRecordPayment={handleRecordPayment}
      />

      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={handleClosePaymentModal}
        purchase={selectedPurchase}
        onSave={handleConfirmPayment}
      />
    </>
  );
}
