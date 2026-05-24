'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import ServicesSummaryCards from './ServicesSummaryCards';
import ServicesFilters from './ServicesFilters';
import ServicesTable from './ServicesTable';
import ServiceDetailsDrawer from './ServiceDetailsDrawer';
import ServiceFormDrawer from './ServiceFormDrawer';
import DisableServiceModal from './DisableServiceModal';
import { getServices, addService, updateService, toggleServiceActive } from '@/lib/mock-services';
import type { ServiceItem } from '@/types/services';
import type { ServiceFormData } from './ServiceFormDrawer';
import { Plus, Wrench } from 'lucide-react';

const PAGE_SIZE = 10;

export default function ServicesPageShell() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>(getServices);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [posVisibility, setPosVisibility] = useState('all');
  const [category, setCategory] = useState('all');
  const [taxable, setTaxable] = useState('all');
  const [page, setPage] = useState(1);

  // Drawer / Modal state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceItem | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ServiceItem | null>(null);
  const [toggleEnable, setToggleEnable] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);

  const refreshServices = useCallback(() => {
    setServices([...getServices()]);
  }, []);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const match = s.nameAr.toLowerCase().includes(q) ||
          (s.nameEn || '').toLowerCase().includes(q) ||
          s.category.includes(q) ||
          s.price.toString().includes(q);
        if (!match) return false;
      }
      if (status === 'active' && !s.isActive) return false;
      if (status === 'inactive' && s.isActive) return false;
      if (posVisibility === 'visible' && !s.showInPOS) return false;
      if (posVisibility === 'hidden' && s.showInPOS) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (taxable === 'taxable' && !s.isTaxable) return false;
      if (taxable === 'non-taxable' && s.isTaxable) return false;
      return true;
    });
  }, [services, search, status, posVisibility, category, taxable]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    };
  }, [filtered, page]);

  const summary = useMemo(() => ({
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    hiddenFromPOS: services.filter((s) => !s.showInPOS).length,
    avgPrice: services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length * 100) / 100
      : 0,
  }), [services]);

  const handleView = useCallback((s: ServiceItem) => {
    setSelectedService(s);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((s: ServiceItem) => {
    setEditService(s);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditService(null);
    setFormOpen(true);
  }, []);

  const handleToggle = useCallback((s: ServiceItem) => {
    setToggleTarget(s);
    setToggleEnable(!s.isActive);
    setDisableModalOpen(true);
  }, []);

  const handleConfirmToggle = useCallback(() => {
    if (!toggleTarget) return;
    toggleServiceActive(toggleTarget.id, toggleEnable);
    refreshServices();
    setDisableModalOpen(false);
    setToggleTarget(null);
    toast('success', toggleEnable ? 'تم تفعيل الخدمة بنجاح' : 'تم تعطيل الخدمة بنجاح');
  }, [toggleTarget, toggleEnable, refreshServices, toast]);

  const handleSaveService = useCallback((data: ServiceFormData) => {
    if (editService) {
      const updated = updateService(editService.id, data);
      if (updated) {
        refreshServices();
        setFormOpen(false);
        setEditService(null);
        toast('success', 'تم تحديث الخدمة بنجاح');
      }
    } else {
      const created = addService(data);
      if (created) {
        refreshServices();
        setFormOpen(false);
        toast('success', 'تم إضافة الخدمة بنجاح');
      }
    }
  }, [editService, refreshServices, toast]);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditService(null);
  }, []);

  return (
    <>
      <PageHeader
        title="الخدمات والأسعار"
        description="إدارة خدمات الغسيل التي تظهر في شاشة نقاط البيع"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
            إضافة خدمة
          </Button>
        }
      />

      <ServicesSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <ServicesFilters
            search={search}
            status={status}
            posVisibility={posVisibility}
            category={category}
            taxable={taxable}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            onStatusChange={(v) => { setStatus(v); setPage(1); }}
            onPosVisibilityChange={(v) => { setPosVisibility(v); setPage(1); }}
            onCategoryChange={(v) => { setCategory(v); setPage(1); }}
            onTaxableChange={(v) => { setTaxable(v); setPage(1); }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Wrench className="h-16 w-16" />}
            title="لا توجد خدمات"
            description="لا توجد خدمات تطابق معايير البحث"
          />
        ) : (
          <ServicesTable
            services={paginated.items}
            page={page}
            totalPages={paginated.totalPages}
            onPageChange={setPage}
            onView={handleView}
            onEdit={handleEdit}
            onToggle={handleToggle}
          />
        )}
      </div>

      <ServiceDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        service={selectedService}
      />

      <ServiceFormDrawer
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveService}
        service={editService}
      />

      <DisableServiceModal
        open={disableModalOpen}
        onClose={() => { setDisableModalOpen(false); setToggleTarget(null); }}
        service={toggleTarget}
        onConfirm={handleConfirmToggle}
        enable={toggleEnable}
      />
    </>
  );
}
