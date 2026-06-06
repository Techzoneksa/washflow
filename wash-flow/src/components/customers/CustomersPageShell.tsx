'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
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
  addCustomer,
  updateCustomer,
} from '@/lib/mock-customers';
import type { Customer, CustomerFormData } from '@/types/customers';
import type { CustomerFilter } from '@/lib/mock-customers';
import { Plus, Users } from 'lucide-react';

const PAGE_SIZE = 10;

export default function CustomersPageShell() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());
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

  const refreshCustomers = useCallback(() => {
    setCustomers([...getCustomers()]);
  }, []);

  const summary = useMemo(() => getCustomersSummary(customers), [customers]);

  const filtered = useMemo(() => {
    return filterCustomers(customers, filters);
  }, [customers, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

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

  const handleSave = useCallback((data: CustomerFormData) => {
    if (editCustomer) {
      const updated = updateCustomer(editCustomer.id, data);
      if (updated) {
        refreshCustomers();
        setFormOpen(false);
        setEditCustomer(null);
        toast('success', 'تم تحديث بيانات العميل بنجاح');
      }
    } else {
      if (!data.name?.trim() && !data.phone?.trim() && !data.carPlate?.trim()) {
        toast('error', 'أدخل رقم جوال أو اسم أو رقم لوحة على الأقل');
        return;
      }
      const created = addCustomer(data);
      if (created) {
        refreshCustomers();
        setFormOpen(false);
        toast('success', 'تم إضافة العميل بنجاح');
      }
    }
  }, [editCustomer, refreshCustomers, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditCustomer(null);
  }, []);

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

      <CustomersSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <CustomersFilters
            filters={filters}
            onFiltersChange={(f) => { setFilters(f); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title="لا يوجد عملاء"
            description="لا توجد عملاء مطابقين لمعايير البحث"
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