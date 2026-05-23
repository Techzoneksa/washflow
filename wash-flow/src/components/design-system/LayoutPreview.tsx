'use client';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

export default function LayoutPreview() {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">تخطيطات النظام</h2>
      <p className="text-sm text-text-secondary mb-6">
        النظام يدعم ثلاثة تخطيطات أساسية: جوال، تابلت، ويب. التصميم مبني على <strong>Mobile & Tablet First</strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mobile */}
        <div className="bg-bg-surface border border-border-default rounded-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border-default">
            <Smartphone className="h-5 w-5 text-primary-500" />
            <h3 className="text-base font-semibold text-text-primary">الجوال</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Header صغير مع اسم الصفحة</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Bottom Navigation ثابت</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>محتوى على شكل بطاقات</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>FAB للإجراءات السريعة</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Bottom Sheet للفلاتر والتفاصيل</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>أزرار كبيرة سهلة اللمس</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success-500" />
                <span className="text-success-700 font-medium">بدون Sidebar</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tablet */}
        <div className="bg-bg-surface border-2 border-primary-200 rounded-card overflow-hidden relative">
          <div className="absolute top-2 left-2">
            <BadgePreview>الأهم</BadgePreview>
          </div>
          <div className="flex items-center gap-2 p-4 border-b border-border-default">
            <Tablet className="h-5 w-5 text-primary-500" />
            <h3 className="text-base font-semibold text-text-primary">التابلت</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Touch Friendly بالكامل</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Sidebar مختصر أو أيقونات</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>شاشة منقسمة لـ POS (خدمات + سلة)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>أزرار كبيرة مناسبة للمس</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>محتوى واسع ومنظم</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger-500" />
                <span className="text-danger-700 font-medium">لا توجد عناصر صغيرة</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Desktop */}
        <div className="bg-bg-surface border border-border-default rounded-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border-default">
            <Monitor className="h-5 w-5 text-primary-500" />
            <h3 className="text-base font-semibold text-text-primary">الويب</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Sidebar كامل</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Header علوي مع User Menu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>بطاقات إحصائيات في الأعلى</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>جداول في المنتصف</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>فلاتر وأزرار إجراءات واضحة</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Breadcrumb اختياري</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Preview */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-text-primary mb-4">نظام التنقل حسب الدور</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { role: 'مالك', items: ['كل الصفحات'], color: 'bg-warning-100 text-warning-700' },
            { role: 'مدير', items: ['لوحة التحكم', 'POS', 'الطلبات', 'الخدمات', 'المصاريف', 'الموردين', 'المشتريات', 'العمالة', 'التقارير', 'الإعدادات'], color: 'bg-primary-100 text-primary-700' },
            { role: 'محاسب', items: ['لوحة التحكم', 'المشتريات', 'المصاريف', 'الموردين', 'الرواتب والسلف', 'شجرة الحسابات', 'الصندوق والبنك', 'التقارير'], color: 'bg-info-100 text-info-700' },
            { role: 'كاشير', items: ['الرئيسية', 'POS', 'الطلبات', 'الفواتير', 'تسجيل خروج'], color: 'bg-success-100 text-success-700' },
          ].map(({ role, items, color }) => (
            <div key={role} className="bg-bg-surface border border-border-default rounded-card p-4">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${color}`}>
                {role}
              </span>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item} className="text-sm text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Preview */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-text-primary mb-4">نظام المسافات</h3>
        <div className="bg-bg-surface border border-border-default rounded-card p-6">
          <div className="space-y-3">
            {[
              { name: '4px', class: 'w-1' },
              { name: '8px', class: 'w-2' },
              { name: '12px', class: 'w-3' },
              { name: '16px', class: 'w-4' },
              { name: '20px', class: 'w-5' },
              { name: '24px', class: 'w-6' },
              { name: '32px', class: 'w-8' },
              { name: '40px', class: 'w-10' },
              { name: '48px', class: 'w-12' },
              { name: '64px', class: 'w-16' },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-12">{s.name}</span>
                <div className={`h-3 ${s.class} bg-primary-400 rounded`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgePreview({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-500 text-white">
      {children}
    </span>
  );
}
