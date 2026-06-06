'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import { useToast } from '@/components/ui/Toast';
import CustomersSummaryCards from './CustomersSummaryCards';
import CustomersFilters from './CustomersFilters';
import CustomersTable from './CustomersTable';
import CustomerCard from './CustomerCard';
import CustomerDetailsDrawer from './CustomerDetailsDrawer';
import CustomerFormDrawer from './CustomerFormDrawer';
import {
  getCustomers,
  getCustomersSummary,
  filterCustomers,
  createCustomer,
  updateCustomer,
  isPhoneExists,
} from '@/lib/data/customers';
import type { Customer, CustomerFormData } from '@/types/customers';
import type { CustomerFilter } from '@/lib/data/customers';
import { Plus, Users } from 'lucide-react';

const PAGE_SIZE = 10;

export default function CustomersPageShell() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CustomerFilter>({
    search: '',
    status: 'all',
    hasOrders: 'all',
  });
  const [page, setPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      toast('error', 'فشل في تحميل العملاء');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadFilteredCustomers = useCallback(async (f: CustomerFilter) => {
    setLoading(true);
    try {
      const data = await filterCustomers(f);
      setCustomers(data);
    } catch {
      toast('error', 'فشل في البحث');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (filters.search || filters.status !== 'all' || filters.hasOrders !== 'all') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadFilteredCustomers(filters);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCustomers();
    }
  }, [filters, loadCustomers, loadFilteredCustomers]);

  const [summaryData, setSummaryData] = useState<Awaited<ReturnType<typeof getCustomersSummary>> | null>(null);

  useEffect(() => {
    getCustomersSummary().then(setSummaryData);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [customers.length]);

  const filtered = customers;

  const paginated = {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    totalPages: Math.ceil(filtered.length / PAGE_SIZE) || 1,
  };

  const handleView = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((customer: Customer) => {
    setEditCustomer(customer);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditCustomer(null);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(async (data: CustomerFormData) => {
    try {
      if (editCustomer) {
        const updated = await updateCustomer(editCustomer.id, data);
        if (updated) {
          await loadCustomers();
          await getCustomersSummary().then(setSummaryData);
          setFormOpen(false);
          setEditCustomer(null);
          toast('success', 'تم تحديث بيانات العميل بنجاح');
        } else {
          toast('error', 'فشل في تحديث العميل');
        }
      } else {
        if (!data.name?.trim() && !data.phone?.trim() && !data.carPlate?.trim()) {
          toast('error', 'أدخل رقم جوال أو اسم أو رقم لوحة على الأقل');
          return;
        }
        if (data.phone?.trim()) {
          const exists = await isPhoneExists(data.phone);
          if (exists) {
            toast('error', 'رقم الجوال مستخدم مسبقاً');
            return;
          }
        }
        const created = await createCustomer(data);
        if (created) {
          await loadCustomers();
          await getCustomersSummary().then(setSummaryData);
          setFormOpen(false);
          toast('success', 'تم إضافة العميل بنجاح');
        } else {
          toast('error', 'فشل في إضافة العميل');
        }
      }
    } catch {
      toast('error', 'حدث خطأ أثناء الحفظ');
    }
  }, [editCustomer, loadCustomers, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditCustomer(null);
  }, []);

  const handleFiltersChange = useCallback((f: CustomerFilter) => {
    setFilters(f);
    setPage(1);
    if (f.search || f.status !== 'all' || f.hasOrders !== 'all') {
      loadFilteredCustomers(f);
    } else {
      loadCustomers();
    }
  }, [loadCustomers, loadFilteredCustomers]);

  const summaryValue = summaryData || {
    totalCustomers: 0,
    todayCustomers: 0,
    activeCustomers: 0,
    totalOrdersLinked: 0,
    topCustomer: null,
  };

  return (
    <>
      <PageHeader
        title="العملاء"
        description="إدارة عملاء المغسلة وربطهم بالطلبات"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة عميل
          </Button>
        }
      />

      <CustomersSummaryCards data={summaryValue} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <CustomersFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title="لا يوجد عملاء"
            description={filters.search || filters.status !== 'all' || filters.hasOrders !== 'all'
              ? 'لا توجد عملاء مطابقين لمعايير البحث'
              : 'ابدأ بإضافة أول عميل لربطه بالطلبات'}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <CustomersTable
                customers={paginated.items}
                page={page}
                totalPages={paginated.totalPages}
                onPageChange={setPage}
                onView={handleView}
                onEdit={handleEdit}
              />
            </div>
            <div className="md:hidden p-4 space-y-3">
              {paginated.items.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
              {paginated.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    السابق
                  </Button>
                  <span className="px-3 py-1 text-sm text-text-secondary">
                    {page} / {paginated.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === paginated.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <CustomerDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        customer={selectedCustomer}
        onEdit={(customer) => { setDetailsOpen(false); handleEdit(customer); }}
      />

      <CustomerFormDrawer
        key={editCustomer ? `edit-${editCustomer.id}` : 'add-new'}
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        customer={editCustomer}
      />
    </>
  );
}