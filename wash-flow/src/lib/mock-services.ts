import type { ServiceItem, ServiceCategory } from '@/types/services';
import type { WashService } from '@/types/pos';

export const serviceCategories: ServiceCategory[] = [
  'غسيل سيارات', 'خدمات داخلية', 'خدمات خارجية', 'باقات', 'إضافات', 'مركبات كبيرة', 'أخرى',
];

export const categoryLabels: { value: string; label: string }[] = [
  { value: 'all', label: 'الكل' },
  ...serviceCategories.map((c) => ({ value: c, label: c })),
];

function makeService(overrides: Partial<ServiceItem> = {}): ServiceItem {
  const now = new Date('2026-05-24T10:00:00').toISOString();
  return {
    id: '',
    nameAr: '',
    nameEn: undefined,
    category: 'أخرى',
    price: 0,
    durationMinutes: 15,
    description: undefined,
    icon: 'car',
    isActive: true,
    showInPOS: true,
    isTaxable: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function buildDefaultServices(): ServiceItem[] {
  let sort = 1;
  const now = new Date('2026-05-24T10:00:00').toISOString();
  return [
    makeService({ id: 'small-car', nameAr: 'سيارة صغيرة', price: 25, category: 'غسيل سيارات', durationMinutes: 15, icon: 'car', sortOrder: sort++, createdAt: now, updatedAt: now }),
    makeService({ id: 'large-car', nameAr: 'سيارة كبيرة', price: 35, category: 'غسيل سيارات', durationMinutes: 20, icon: 'truck', sortOrder: sort++, createdAt: now, updatedAt: now }),
    makeService({ id: 'dina', nameAr: 'دينا', price: 60, category: 'مركبات كبيرة', durationMinutes: 30, icon: 'truck', sortOrder: sort++, createdAt: now, updatedAt: now }),
    makeService({ id: 'interior', nameAr: 'غسيل داخلي', price: 20, category: 'خدمات داخلية', durationMinutes: 15, icon: 'sparkles', sortOrder: sort++, createdAt: now, updatedAt: now }),
    makeService({ id: 'exterior', nameAr: 'غسيل خارجي', price: 25, category: 'خدمات خارجية', durationMinutes: 15, icon: 'droplets', sortOrder: sort++, createdAt: now, updatedAt: now }),
    makeService({ id: 'full-wash', nameAr: 'داخلي/خارجي', price: 45, category: 'باقات', durationMinutes: 25, icon: 'badge-check', sortOrder: sort++, createdAt: now, updatedAt: now }),
    makeService({ id: 'tires-polish', nameAr: 'تلميع إطارات', price: 10, category: 'إضافات', durationMinutes: 5, icon: 'circle', sortOrder: sort++, createdAt: now, updatedAt: now }),
    makeService({ id: 'other', nameAr: 'أخرى', price: 0, category: 'أخرى', durationMinutes: undefined, icon: 'plus', sortOrder: sort++, createdAt: now, updatedAt: now, isTaxable: false }),
  ];
}

let servicesState: ServiceItem[] = buildDefaultServices();

let nextId = 100;

export function getServices(): ServiceItem[] {
  return servicesState;
}

export function getServiceById(id: string): ServiceItem | undefined {
  return servicesState.find((s) => s.id === id);
}

export function getPOSServices(): ServiceItem[] {
  return servicesState.filter((s) => s.isActive && s.showInPOS);
}

export function addService(data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>): ServiceItem {
  const now = new Date().toISOString();
  const service: ServiceItem = {
    ...data,
    id: `svc-${nextId++}`,
    createdAt: now,
    updatedAt: now,
  };
  servicesState = [...servicesState, service];
  return service;
}

export function updateService(id: string, updates: Partial<Omit<ServiceItem, 'id' | 'createdAt'>>): ServiceItem | undefined {
  const idx = servicesState.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  const updated = { ...servicesState[idx], ...updates, updatedAt: new Date().toISOString() };
  const newState = [...servicesState];
  newState[idx] = updated;
  servicesState = newState;
  return updated;
}

export function toggleServiceActive(id: string, active: boolean): ServiceItem | undefined {
  return updateService(id, {
    isActive: active,
    showInPOS: active ? true : false,
  });
}

export function toggleServicePOS(id: string, show: boolean): ServiceItem | undefined {
  return updateService(id, { showInPOS: show });
}

export function getServiceUsageCount(): number {
  return 0;
}

export function mapServiceToPOS(service: ServiceItem): WashService {
  return {
    id: service.id,
    nameAr: service.nameAr,
    price: service.price,
    category: service.category,
    duration: service.durationMinutes ? `${service.durationMinutes} دقيقة` : 'حسب الخدمة',
    icon: service.icon || 'car',
    isActive: service.isActive,
  };
}

export function getPOSWashServices(): WashService[] {
  return getPOSServices().map(mapServiceToPOS);
}

export function isDuplicateName(nameAr: string, excludeId?: string): boolean {
  return servicesState.some((s) => s.nameAr === nameAr && s.id !== excludeId);
}
