'use client';
import Button from '@/components/ui/Button';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function ButtonsPreview() {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">الأزرار</h2>

      <div className="space-y-8">
        {/* Variants */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">أنواع الأزرار</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">الأحجام</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        {/* With Icons */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">مع أيقونات</h3>
          <div className="flex flex-wrap gap-3">
            <Button icon={<Plus className="h-4 w-4" />}>إضافة جديد</Button>
            <Button variant="outline" icon={<Save className="h-4 w-4" />}>حفظ</Button>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>حذف</Button>
            <Button variant="ghost" icon={<Plus className="h-4 w-4" />} iconPosition="left">
              إضافة
            </Button>
          </div>
        </div>

        {/* States */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">الحالات</h3>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button fullWidth>Full Width</Button>
          </div>
        </div>

        {/* Icon only */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">أزرار أيقونة</h3>
          <div className="flex flex-wrap gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-button bg-primary-500 text-white hover:bg-primary-600 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-button bg-bg-surface border border-border-default text-text-secondary hover:bg-bg-hover transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-button bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Floating Action Button */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">زر الإجراء العائم (FAB)</h3>
          <div className="flex gap-3">
            <button className="w-14 h-14 rounded-full bg-primary-500 text-white shadow-fab hover:bg-primary-600 transition-all flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
