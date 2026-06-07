'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { getServices, createService, updateService, toggleServiceActive } from '@/lib/data/services';
import type { ServiceItem } from '@/types/services';
import type { ServiceFormData } from './ServiceFormDrawer';
import { Plus, Wrench } from 'lucide-react';

const PAGE_SIZE = 10;

export default function ServicesPageShell() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [posVisibility, setPosVisibility] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceItem | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ServiceItem | null>(null);
  const [toggleEnable, setToggleEnable] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const data = await getServices();
    setServices(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    getServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
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
      return true;
    });
  }, [services, search, status, posVisibility, category]);

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

  const handleConfirmToggle = useCallback(async () => {
    if (!toggleTarget) return;
    const result = await toggleServiceActive(toggleTarget.id, toggleEnable);
    if (result) {
      await loadServices();
      toast('success', toggleEnable ? 'تم تفعيل الخدمة بنجاح' : 'تم تعطيل الخدمة بنجاح');
    } else {
      toast('error', 'حدث خطأ أثناء تحديث الخدمة');
    }
    setDisableModalOpen(false);
    setToggleTarget(null);
  }, [toggleTarget, toggleEnable, loadServices, toast]);

  const handleSaveService = useCallback(async (data: ServiceFormData) => {
    if (editService) {
      const updated = await updateService(editService.id, data as unknown as Record<string, unknown>);
      if (updated) {
        await loadServices();
        setFormOpen(false);
        setEditService(null);
        toast('success', 'تم تحديث الخدمة بنجاح');
      } else {
        toast('error', 'حدث خطأ أثناء تحديث الخدمة');
      }
    } else {
      const created = await createService(data as unknown as Record<string, unknown>);
      if (created) {
        await loadServices();
        setFormOpen(false);
        toast('success', 'تم إضافة الخدمة بنجاح');
      } else {
        toast('error', 'حدث خطأ أثناء إضافة الخدمة');
      }
    }
  }, [editService, loadServices, toast]);

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <>
          <ServicesSummaryCards data={summary} />

          {services.length === 0 ? (
            <EmptyState
              icon={<Wrench className="h-16 w-16" />}
              title="لا توجد خدمات بعد"
              description="أضف خدمتك الأولى لبدء استخدام نقطة البيع"
              action={
                <Button icon={<Plus className="h-4 w-4" />} onClick={handleAdd}>
                  إضافة خدمة
                </Button>
              }
            />
          ) : (
            <div className="bg-bg-surface border border-border-default rounded-card">
              <div className="p-4 pb-0">
                <ServicesFilters
                  search={search}
                  status={status}
                  posVisibility={posVisibility}
                  category={category}
                  onSearchChange={(v) => { setSearch(v); setPage(1); }}
                  onStatusChange={(v) => { setStatus(v); setPage(1); }}
                  onPosVisibilityChange={(v) => { setPosVisibility(v); setPage(1); }}
                  onCategoryChange={(v) => { setCategory(v); setPage(1); }}
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
          )}
        </>
      )}

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
