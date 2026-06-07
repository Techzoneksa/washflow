'use client';
import { useState, useMemo, useEffect } from 'react';
import { serviceCategories } from '@/lib/mock-pos';
import { getPOSWashServices } from '@/lib/data/services';
import type { WashService } from '@/types/pos';
import ServiceCard from './ServiceCard';
import { Search, X } from 'lucide-react';

interface ServiceGridProps {
  cartServiceIds: Set<string>;
  onAddService: (service: WashService) => void;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

const columnClasses = {
  mobile: 'grid-cols-2',
  tablet: 'grid-cols-3 xl:grid-cols-4',
  desktop: 'grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
};

export default function ServiceGrid({ cartServiceIds, onAddService, breakpoint = 'desktop' }: ServiceGridProps) {
  const [services, setServices] = useState<WashService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getPOSWashServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  const filteredServices = useMemo(() => {
    let result = services;
    if (activeCategory !== 'الكل') {
      result = result.filter(s => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s => s.nameAr.includes(q) || s.category.includes(q));
    }
    return result;
  }, [services, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">🧼</span>
        <p className="text-sm font-medium text-text-secondary">لا توجد خدمات متاحة في نقطة البيع</p>
        <p className="text-xs text-text-disabled mt-1">قم بإضافة خدمات من صفحة الإدارة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 space-y-2 mb-2">
        <div className="relative">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-text-disabled hover:text-text-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <input
            type="text"
            placeholder="بحث عن خدمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-9 py-2 text-sm rounded-lg border border-border-default bg-bg-surface text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary-500 text-text-inverse border-primary-500'
                  : 'bg-bg-surface text-text-secondary border-border-default hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-2">🔍</span>
            <p className="text-sm text-text-secondary">لا توجد خدمات مطابقة</p>
          </div>
        ) : (
          <div className={`grid ${columnClasses[breakpoint]} gap-2`}>
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onAdd={() => onAddService(service)}
                added={cartServiceIds.has(service.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
