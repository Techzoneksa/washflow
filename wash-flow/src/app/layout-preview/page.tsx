'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export default function LayoutPreviewPage() {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [sidebarCompact, setSidebarCompact] = useState(false);

  return (
    <AppShell title="معاينة التخطيطات" activePath="/layout-preview">
      {/* Device Switcher */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-neutral-100 rounded-lg w-fit">
        {[
          { mode: 'mobile' as const, icon: Smartphone, label: 'جوال' },
          { mode: 'tablet' as const, icon: Tablet, label: 'تابلت' },
          { mode: 'desktop' as const, icon: Monitor, label: 'ويب' },
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              previewMode === mode
                ? 'bg-bg-surface text-primary-600 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Preview Container */}
      <div className={`bg-neutral-900 rounded-2xl p-2 sm:p-4 mx-auto transition-all ${
        previewMode === 'mobile' ? 'max-w-[375px]' :
        previewMode === 'tablet' ? 'max-w-[768px]' : 'max-w-full'
      }`}>
        <div className="bg-bg-main rounded-xl overflow-hidden" style={{ minHeight: previewMode === 'mobile' ? '700px' : '600px' }}>
          {/* Mobile Preview */}
          {previewMode === 'mobile' && (
            <div className="h-full flex flex-col">
              <Topbar title="الرئيسية" onMenuClick={() => {}} />
              <div className="flex-1 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg-surface border border-border-default rounded-card p-4">
                    <p className="text-xs text-text-secondary">المبيعات</p>
                    <p className="text-lg font-bold text-text-primary">١٬٢٥٠ ر.س</p>
                  </div>
                  <div className="bg-bg-surface border border-border-default rounded-card p-4">
                    <p className="text-xs text-text-secondary">الطلبات</p>
                    <p className="text-lg font-bold text-text-primary">٣٨</p>
                  </div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-surface border border-border-default rounded-card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">طلب #{i}</p>
                      <p className="text-xs text-text-secondary">سيارة صغيرة</p>
                    </div>
                    <Badge variant={i === 1 ? 'success' : i === 2 ? 'info' : 'warning'}>
                      {i === 1 ? 'مكتمل' : i === 2 ? 'قيد التنفيذ' : 'جديد'}
                    </Badge>
                  </div>
                ))}
              </div>
              <MobileBottomNav activePath="/" />
            </div>
          )}

          {/* Tablet Preview */}
          {previewMode === 'tablet' && (
            <div className="h-full flex">
              <div className="w-16 bg-bg-sidebar flex flex-col items-center py-4 gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </div>
                {['1', '2', '3', '4', '5'].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <div className="w-4 h-4 rounded bg-white/30" />
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col">
                <Topbar title="لوحة التحكم" />
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {['مبيعات', 'طلبات', 'مصاريف', 'صافي'].map((label, idx) => (
                      <div key={label} className="bg-bg-surface border border-border-default rounded-card p-4">
                        <p className="text-xs text-text-secondary">{label}</p>
                        <p className="text-lg font-bold text-text-primary">{([1200, 38, 320, 930])[idx]} ر.س</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-bg-surface border border-border-default rounded-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">آخر الطلبات</h3>
                      <Badge variant="primary">اليوم</Badge>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                          <span className="text-sm text-text-primary">طلب #{100 + i}</span>
                          <span className="text-sm font-medium text-text-primary">{i * 25} ر.س</span>
                          <Badge variant={i % 2 === 0 ? 'success' : 'info'} size="sm">
                            {i % 2 === 0 ? 'مكتمل' : 'جديد'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Preview */}
          {previewMode === 'desktop' && (
            <div className="h-full flex">
              <Sidebar userRole="manager" activePath="/" compact={sidebarCompact} />
              <div className="flex-1 flex flex-col">
                <Topbar title="لوحة التحكم" showSearch />
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">مرحبًا بك في واش فلو</h2>
                      <p className="text-sm text-text-secondary">نظرة عامة على أداء اليوم</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">تقرير PDF</Button>
                      <Button size="sm">تحديث</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'مبيعات اليوم', value: '١٬٢٥٠ ر.س', trend: '+١٢٪' },
                      { label: 'الطلبات', value: '٣٨', trend: '+٥' },
                      { label: 'المصاريف', value: '٣٢٠ ر.س', trend: '-٢٪' },
                      { label: 'صافي الربح', value: '٩٣٠ ر.س', trend: '+١٥٪' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-bg-surface border border-border-default rounded-card p-4">
                        <p className="text-xs text-text-secondary">{stat.label}</p>
                        <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                        <p className="text-xs text-success-600 mt-1">{stat.trend} عن أمس</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-bg-surface border border-border-default rounded-card p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">آخر الطلبات</h3>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-default">
                            <th className="text-right py-2 text-xs text-text-secondary font-semibold">الطلب</th>
                            <th className="text-right py-2 text-xs text-text-secondary font-semibold">القيمة</th>
                            <th className="text-right py-2 text-xs text-text-secondary font-semibold">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="border-b border-border-default last:border-0">
                              <td className="py-2.5 text-text-primary">#ORD-{100 + i}</td>
                              <td className="py-2.5 text-text-primary font-medium">{i * 25} ر.س</td>
                              <td className="py-2.5">
                                <Badge variant={i % 2 === 0 ? 'success' : 'info'} size="sm">
                                  {i % 2 === 0 ? 'مكتمل' : 'جديد'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-bg-surface border border-border-default rounded-card p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">الخدمات الأكثر طلبًا</h3>
                      <div className="space-y-3">
                        {[
                          { name: 'سيارة صغيرة', count: 15, revenue: 375 },
                          { name: 'سيارة كبيرة', count: 10, revenue: 350 },
                          { name: 'داخلي/خارجي', count: 8, revenue: 360 },
                        ].map((svc) => (
                          <div key={svc.name} className="flex items-center justify-between">
                            <span className="text-sm text-text-primary">{svc.name}</span>
                            <span className="text-xs text-text-secondary">{svc.count} طلب</span>
                            <span className="text-sm font-medium text-text-primary">{svc.revenue} ر.س</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {previewMode === 'desktop' && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarCompact(!sidebarCompact)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {sidebarCompact ? 'توسيع الشريط الجانبي' : 'تصغير الشريط الجانبي'}
          </button>
        </div>
      )}
    </AppShell>
  );
}
