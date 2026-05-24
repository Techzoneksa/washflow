'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import SuppliersSummaryCards from './SuppliersSummaryCards';
import SuppliersFilters from './SuppliersFilters';
import SuppliersTable from './SuppliersTable';
import SupplierDetailsDrawer from './SupplierDetailsDrawer';
import SupplierFormDrawer from './SupplierFormDrawer';
import { getSuppliers, addSupplier, updateSupplier, isDuplicateSupplierName } from '@/lib/mock-suppliers';
import type { Supplier } from '@/types/suppliers';
import type { SupplierFormData } from './SupplierFormDrawer';
import { Plus, Truck } from 'lucide-react';

const PAGE_SIZE = 10;

export default function SuppliersPageShell() {
  const router = useRouter();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>(getSuppliers);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [balance, setBalance] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const refreshSuppliers = useCallback(() => {
    setSuppliers([...getSuppliers()]);
  }, []);

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          (s.representativeName || '').toLowerCase().includes(q) ||
          (s.vatNumber || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (status === 'active' && s.status !== 'active') return false;
      if (status === 'inactive' && s.status !== 'inactive') return false;
      if (balance === 'hasBalance' && s.balance <= 0) return false;
      if (balance === 'noBalance' && s.balance > 0) return false;
      return true;
    });
  }, [suppliers, search, status, balance]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

  const summary = useMemo(() => {
    const active = suppliers.filter((s) => s.status === 'active').length;
    const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
    const totalBalance = suppliers.reduce((sum, s) => sum + s.balance, 0);
    const topSupplier = suppliers.reduce((best, s) => (s.totalPurchases > (best?.totalPurchases || 0) ? s : best), suppliers[0]);
    return {
      total: suppliers.length,
      active,
      totalPurchases,
      totalBalance,
      topSupplier: topSupplier?.name || '',
    };
  }, [suppliers]);

  const handleView = useCallback((s: Supplier) => {
    setSelectedSupplier(s);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((s: Supplier) => {
    setEditSupplier(s);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditSupplier(null);
    setFormOpen(true);
  }, []);

  const handleAddPurchase = useCallback((s: Supplier) => {
    router.push(`/purchases?supplierId=${s.id}`);
  }, [router]);

  const handleSaveSupplier = useCallback((data: SupplierFormData) => {
    if (editSupplier) {
      if (isDuplicateSupplierName(data.name, editSupplier.id)) {
        toast('error', 'اسم المورد موجود مسبقًا');
        return;
      }
      const updated = updateSupplier(editSupplier.id, {
        ...data,
        balance: editSupplier.balance,
        totalPurchases: editSupplier.totalPurchases,
        totalPaid: editSupplier.totalPaid,
        invoicesCount: editSupplier.invoicesCount,
      });
      if (updated) {
        refreshSuppliers();
        setFormOpen(false);
        setEditSupplier(null);
        toast('success', 'تم تحديث المورد بنجاح');
      }
    } else {
      if (isDuplicateSupplierName(data.name)) {
        toast('error', 'اسم المورد موجود مسبقًا');
        return;
      }
      const created = addSupplier({
        ...data,
        balance: 0,
        totalPurchases: 0,
        totalPaid: 0,
        invoicesCount: 0,
      });
      if (created) {
        refreshSuppliers();
        setFormOpen(false);
        toast('success', 'تم إضافة المورد بنجاح');
      }
    }
  }, [editSupplier, refreshSuppliers, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditSupplier(null);
  }, []);

  return (
    <>
      <PageHeader
        title="الموردين"
        description="إدارة بيانات الموردين ومتابعة أرصدتهم ومشترياتهم"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة مورد
          </Button>
        }
      />

      <SuppliersSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <SuppliersFilters
            search={search}
            status={status}
            balance={balance}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            onStatusChange={(v) => { setStatus(v); setPage(1); }}
            onBalanceChange={(v) => { setBalance(v); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Truck className="h-16 w-16" />}
            title="لا توجد موردين"
            description="لا يوجد موردين تطابق معايير البحث"
          />
        ) : (
          <SuppliersTable
            suppliers={paginated.items}
            page={page}
            totalPages={paginated.totalPages}
            onPageChange={setPage}
            onView={handleView}
            onEdit={handleEdit}
          />
        )}
      </div>

      <SupplierDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        supplier={selectedSupplier}
        onEdit={handleEdit}
        onAddPurchase={handleAddPurchase}
      />

      <SupplierFormDrawer
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveSupplier}
        supplier={editSupplier}
      />
    </>
  );
}
