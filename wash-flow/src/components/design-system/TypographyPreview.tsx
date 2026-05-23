'use client';

interface TypeItemProps {
  label: string;
  usage: string;
  size: string;
  weight: string;
  children: React.ReactNode;
}

function TypeItem({ label, usage, size, weight, children }: TypeItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 border-b border-border-default last:border-0">
      <div className="sm:w-40 shrink-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-[11px] text-text-secondary">{usage}</p>
        <p className="text-[10px] text-text-disabled font-mono">{size} | {weight}</p>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function TypographyPreview() {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">الخطوط و أحجام النصوص</h2>
      <p className="text-sm text-text-secondary mb-6">
        الخط المستخدم: <strong dir="ltr">Cairo</strong> - خط عربي حديث وواضح، مناسب للواجهات.
        تم استيراده عبر <code className="text-primary-600">next/font/google</code>
      </p>

      <div className="bg-bg-surface border border-border-default rounded-card overflow-hidden">
        <TypeItem label="Display" usage="العناوين الكبيرة" size="32px / 2xl" weight="Bold 700">
          <p className="text-2xl font-bold text-text-primary">مرحبًا بكم في واش فلو</p>
        </TypeItem>

        <TypeItem label="Page Title" usage="عنوان الصفحة" size="24px / xl" weight="Bold 700">
          <p className="text-xl font-bold text-text-primary">لوحة التحكم</p>
        </TypeItem>

        <TypeItem label="Section Title" usage="عنوان القسم" size="20px / lg" weight="Semibold 600">
          <p className="text-lg font-semibold text-text-primary">إحصائيات اليوم</p>
        </TypeItem>

        <TypeItem label="Card Title" usage="عنوان البطاقة" size="16px / base" weight="Semibold 600">
          <p className="text-base font-semibold text-text-primary">مبيعات اليوم</p>
        </TypeItem>

        <TypeItem label="Body Large" usage="النصوص المهمة" size="16px / base" weight="Medium 500">
          <p className="text-base font-medium text-text-primary">تم إتمام الطلب بنجاح</p>
        </TypeItem>

        <TypeItem label="Body" usage="النص الأساسي" size="14px / sm" weight="Regular 400">
          <p className="text-sm text-text-primary">هذا هو النص الأساسي المستخدم في محتوى النظام.</p>
        </TypeItem>

        <TypeItem label="Body Small" usage="النصوص الثانوية" size="13px" weight="Regular 400">
          <p className="text-[13px] text-text-secondary">آخر تحديث: منذ 5 دقائق</p>
        </TypeItem>

        <TypeItem label="Caption" usage="التفاصيل الصغيرة" size="12px / xs" weight="Regular 400">
          <p className="text-xs text-text-disabled">رقم الفاتورة: INV-001</p>
        </TypeItem>

        <TypeItem label="Button" usage="نصوص الأزرار" size="14px / sm" weight="Semibold 600">
          <p className="text-sm font-semibold text-primary-600">حفظ التغييرات</p>
        </TypeItem>

        <TypeItem label="Table Header" usage="رؤوس الجداول" size="13px" weight="Semibold 600">
          <p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">اسم الخدمة</p>
        </TypeItem>

        <TypeItem label="Table Cell" usage="محتوى الجداول" size="14px / sm" weight="Regular 400">
          <p className="text-sm text-text-primary">سيارة صغيرة</p>
        </TypeItem>

        <TypeItem label="Badge Text" usage="نصوص الحالات" size="12px / xs" weight="Medium 500">
          <p className="text-xs font-medium text-success-700">مكتمل</p>
        </TypeItem>
      </div>
    </div>
  );
}
