'use client';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Search, User, DollarSign } from 'lucide-react';

export default function InputsPreview() {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">الحقول والنماذج</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-2">أنواع الحقول</h3>

          <Input label="نص عادي" placeholder="أدخل النص..." />
          <Input label="رقم" type="number" placeholder="٠" />
          <Input label="كلمة المرور" type="password" placeholder="••••••••" />
          <Input label="بحث" icon={<Search className="h-4 w-4" />} placeholder="بحث..." />
          <Input label="مبلغ" icon={<DollarSign className="h-4 w-4" />} placeholder="٠.٠٠" />
          <Input label="اسم المستخدم" icon={<User className="h-4 w-4" />} placeholder="أدخل اسم المستخدم" />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-2">حالات الحقول</h3>

          <Input label="حقل عادي" defaultValue="نص افتراضي" />
          <Input label="خطأ في الإدخال" error="هذا الحقل مطلوب" />
          <Input label="تم بنجاح" inputStatus="success" defaultValue="قيمة صحيحة" />
          <Input label="معطل" disabled defaultValue="لا يمكن التعديل" />
          <Input label="مع نص مساعد" helperText="هذا نص مساعد للحقل" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Select
          label="قائمة منسدلة"
          options={[
            { label: 'الكل', value: 'all' },
            { label: 'نشط', value: 'active' },
            { label: 'غير نشط', value: 'inactive' },
          ]}
        />
        <Select
          label="مع خطأ"
          error="الرجاء الاختيار"
          options={[
            { label: 'خيار ١', value: '1' },
            { label: 'خيار ٢', value: '2' },
          ]}
        />
      </div>

      <div className="mt-6">
        <Textarea label="نص طويل" placeholder="أدخل النص..." rows={4} />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-text-secondary mb-4">مكونات النماذج</h3>

        <div className="bg-bg-surface border border-border-default rounded-card p-6 space-y-4">
          {/* Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 rounded border-border-default text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-text-primary">خيار التحديد</span>
          </label>

          {/* Radio */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="radio-demo" className="w-5 h-5 border-border-default text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-text-primary">خيار وحيد ١</span>
          </label>

          {/* Toggle Switch */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-10 h-6 bg-neutral-300 rounded-full peer-checked:bg-primary-500 transition-colors" />
              <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-[-16px] transition-transform" />
            </div>
            <span className="text-sm text-text-primary">تفعيل الإشعارات</span>
          </label>
        </div>
      </div>
    </div>
  );
}
