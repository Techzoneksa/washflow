'use client';
import { cn } from '@/lib/utils';

interface ColorSwatchProps {
  label: string;
  colorClass: string;
  hex?: string;
  usage?: string;
}

function ColorSwatch({ label, colorClass, hex, usage }: ColorSwatchProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className={cn('h-16 rounded-lg border border-border-default', colorClass)} />
      <p className="text-xs font-medium text-text-primary">{label}</p>
      {hex && <p className="text-[10px] text-text-secondary font-mono">{hex}</p>}
      {usage && <p className="text-[10px] text-text-secondary">{usage}</p>}
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: { label: string; class: string; hex: string; usage?: string }[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-text-primary mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
        {colors.map((c) => (
          <ColorSwatch key={c.label} label={c.label} colorClass={c.class} hex={c.hex} usage={c.usage} />
        ))}
      </div>
    </div>
  );
}

export default function ColorPalette() {
  const primaryColors = [
    { label: '50', class: 'bg-primary-50', hex: '#eff8ff' },
    { label: '100', class: 'bg-primary-100', hex: '#dbeffe' },
    { label: '200', class: 'bg-primary-200', hex: '#bfe3fe' },
    { label: '300', class: 'bg-primary-300', hex: '#93d2fd' },
    { label: '400', class: 'bg-primary-400', hex: '#5fb8fa' },
    { label: '500', class: 'bg-primary-500', hex: '#3b9df5' },
    { label: '600', class: 'bg-primary-600', hex: '#2580e8' },
    { label: '700', class: 'bg-primary-700', hex: '#1d69d5' },
    { label: '800', class: 'bg-primary-800', hex: '#1d55ad' },
    { label: '900', class: 'bg-primary-900', hex: '#1d498b' },
  ];

  const neutralColors = [
    { label: '50', class: 'bg-neutral-50', hex: '#f8f9fa' },
    { label: '100', class: 'bg-neutral-100', hex: '#f0f1f3' },
    { label: '200', class: 'bg-neutral-200', hex: '#e2e4e8' },
    { label: '300', class: 'bg-neutral-300', hex: '#c9cdd4' },
    { label: '400', class: 'bg-neutral-400', hex: '#a4a9b4' },
    { label: '500', class: 'bg-neutral-500', hex: '#848a98' },
    { label: '600', class: 'bg-neutral-600', hex: '#6b7180' },
    { label: '700', class: 'bg-neutral-700', hex: '#585d6a' },
    { label: '800', class: 'bg-neutral-800', hex: '#4a4e58' },
    { label: '900', class: 'bg-neutral-900', hex: '#3f424b' },
  ];

  const semanticColors = [
    { label: 'Success', class: 'bg-success-500', hex: '#22c55e', usage: 'نجاح العملية' },
    { label: 'Warning', class: 'bg-warning-500', hex: '#f97316', usage: 'تنبيه' },
    { label: 'Danger', class: 'bg-danger-500', hex: '#ef4444', usage: 'خطأ / حذف' },
    { label: 'Info', class: 'bg-info-500', hex: '#3b82f6', usage: 'معلومات' },
  ];

  const surfaceColors = [
    { label: 'Background', class: 'bg-bg-main border border-border-default', hex: '#f8f9fa', usage: 'خلفية الصفحة' },
    { label: 'Surface', class: 'bg-bg-surface border border-border-default', hex: '#ffffff', usage: 'سطح البطاقات' },
    { label: 'Sidebar', class: 'bg-bg-sidebar', hex: '#1a1d29', usage: 'الشريط الجانبي' },
    { label: 'Border', class: 'bg-border-default', hex: '#e2e4e8', usage: 'الحدود' },
    { label: 'Overlay', class: 'bg-overlay', hex: 'rgba(0,0,0,0.5)', usage: 'خلفية النوافذ' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">نظام الألوان</h2>

      <ColorGroup title="Primary - أزرق مائي" colors={primaryColors} />
      <ColorGroup title="Neutral - رمادي محايد" colors={neutralColors} />
      <ColorGroup title="ألوان دلالية" colors={semanticColors} />

      <div className="mb-8">
        <h3 className="text-base font-semibold text-text-primary mb-4">أسطح النظام</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {surfaceColors.map((c) => (
            <ColorSwatch key={c.label} label={c.label} colorClass={c.class} hex={c.hex} usage={c.usage} />
          ))}
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-800">
        <strong>ملاحظة:</strong> الألوان معرفة في <code>globals.css</code> داخل <code>@theme</code> وتستخدم عبر Tailwind classes مثل <code>bg-primary-500</code>.
      </div>
    </div>
  );
}
