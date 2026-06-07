'use client';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Money } from '@/lib/format';
import { Plus, Search, Filter, Download } from 'lucide-react';

const sampleServices = [
  { id: 's1', name: 'سيارة صغيرة', price: 25, category: 'غسيل', active: true },
  { id: 's2', name: 'سيارة كبيرة', price: 35, category: 'غسيل', active: true },
];

export default function RTLPreviewPage() {

  return (
    <AppShell title="التحقق من RTL" activePath="/rtl-preview">
      {/* RTL Status */}
      <Card variant="elevated" className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">RTL يعمل بشكل صحيح</h3>
            <p className="text-sm text-text-secondary">
              الاتجاه من اليمين لليسار، جميع النصوص والعناصر متوافقة مع اللغة العربية
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Arabic Text & Financial Data */}
        <Card>
          <CardHeader>
            <CardTitle>نصوص عربية وأرقام مالية</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-bg-main rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">مبيعات اليوم</p>
              <p className="text-2xl font-bold text-text-primary"><Money value={1250} /></p>
              <p className="text-xs text-success-600">زيادة 12% عن أمس</p>
            </div>
            <div className="bg-bg-main rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-text-primary">38 طلب</p>
              <p className="text-xs text-info-600">5 طلبات جديدة</p>
            </div>
            <div className="bg-bg-main rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">صافي الأرباح</p>
              <p className="text-2xl font-bold text-success-600"><Money value={930} /></p>
              <p className="text-xs text-text-secondary">نقداً: <Money value={750} iconClassName="h-3 w-3" /> | شبكة: <Money value={500} iconClassName="h-3 w-3" /></p>
            </div>
          </div>
        </Card>

        {/* RTL Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>عناصر نموذج - من اليمين لليسار</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="اسم العميل" placeholder="أدخل اسم العميل" icon={<Search className="h-4 w-4" />} />
            <Input label="رقم الجوال" placeholder="0500000000" type="tel" />
            <Select
              label="اختر الخدمة"
              options={sampleServices.map((s) => ({ label: s.name, value: s.id }))}
            />
            <Input label="المبلغ" placeholder="0.00" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button icon={<Plus className="h-4 w-4" />}>إضافة طلب</Button>
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>تصدير</Button>
            <Button variant="ghost" icon={<Filter className="h-4 w-4" />}>تصفية</Button>
          </div>
        </Card>

        {/* RTL Badges & Status */}
        <Card>
          <CardHeader>
            <CardTitle>حالات النظام - عربي</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">مكتمل ✓</Badge>
            <Badge variant="info">قيد التنفيذ</Badge>
            <Badge variant="danger">ملغي ✗</Badge>
            <Badge variant="warning">مسترد</Badge>
            <Badge variant="primary">جديد</Badge>
            <Badge variant="success">مدفوع</Badge>
            <Badge variant="danger">غير مدفوع</Badge>
            <Badge variant="warning">مدفوع جزئيًا</Badge>
            <Badge variant="warning">متأخر</Badge>
            <Badge variant="success">نشط</Badge>
            <Badge variant="neutral">غير نشط</Badge>
          </div>
        </Card>

        {/* RTL Table */}
        <Card>
          <CardHeader>
            <CardTitle>جدول بالعربية</CardTitle>
          </CardHeader>
          <p className="text-sm text-text-secondary p-4">جدول اختباري لعرض الاتجاه RTL</p>
        </Card>

        {/* RTL Direction Test */}
        <Card>
          <CardHeader>
            <CardTitle>اختبار الاتجاه RTL</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-3">
              <span className="text-sm font-medium text-text-primary">هذا النص يبدأ من اليمين</span>
              <Badge variant="primary">✓ RTL</Badge>
            </div>
            <div className="flex items-center gap-4 bg-neutral-50 rounded-lg p-3">
              <Button size="sm">زر في البداية</Button>
              <span className="text-sm text-text-secondary">نص في المنتصف</span>
              <Button size="sm" variant="outline">زر في النهاية</Button>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-sm text-text-primary text-center">
                النص في المنتصف - في حال كان النص طويلاً يجب ألا ينكسر التصميم أو يحدث تداخل Should not break
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
