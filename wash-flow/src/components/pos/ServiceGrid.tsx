'use client';
import { useState, useMemo } from 'react';
import { serviceCategories } from '@/lib/mock-pos';
import { getPOSWashServices } from '@/lib/mock-services';
import type { WashService } from '@/types/pos';
import ServiceCard from './ServiceCard';
import { Search } from 'lucide-react';

interface ServiceGridProps {
  cartServiceIds: Set<string>;
  onAddService: (service: WashService) => void;
  compact?: boolean;
}

export default function ServiceGrid({ cartServiceIds, onAddService, compact }: ServiceGridProps) {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    let result = getPOSWashServices();
    if (activeCategory !== 'الكل') {
      result = result.filter(s => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s => s.nameAr.includes(q) || s.category.includes(q));
    }
    return result;
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
          <input
            type="text"
            placeholder="بحث عن خدمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-border-default bg-bg-surface text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
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
          <div className={cn(
            'grid gap-2 sm:gap-3',
            compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
          )}>
            {filteredServices.map((service) => (
              <div key={service.id} className="relative">
                <ServiceCard
                  service={service}
                  onAdd={() => onAddService(service)}
                  added={cartServiceIds.has(service.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
