export type ServiceCategory = 'غسيل سيارات' | 'خدمات داخلية' | 'خدمات خارجية' | 'باقات' | 'إضافات' | 'مركبات كبيرة' | 'أخرى';

export interface ServiceItem {
  id: string;
  nameAr: string;
  nameEn?: string;
  category: ServiceCategory;
  price: number;
  durationMinutes?: number;
  description?: string;
  icon?: string;
  isActive: boolean;
  showInPOS: boolean;
  isTaxable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
