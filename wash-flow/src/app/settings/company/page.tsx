'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuthGuard } from '@/lib/route-guards';
import { getCompanySettings, upsertCompanySettings, FALLBACK_COMPANY_NAME } from '@/lib/data/company-settings';
import type { CompanySettingsData } from '@/lib/data/company-settings';
import { Save, Building2 } from 'lucide-react';

export default function CompanySettingsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager']);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanySettingsData>({
    companyNameAr: FALLBACK_COMPANY_NAME,
    companyNameEn: '',
    logoUrl: '',
    phone: '',
    email: '',
    address: '',
    crNumber: '',
  });

  useEffect(() => {
    if (!authorized) return;
    getCompanySettings().then((data) => {
      if (data) {
        setForm(data);
      }
      setLoading(false);
    });
  }, [authorized]);

  const update = (field: keyof CompanySettingsData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await upsertCompanySettings(form);
    if (result) {
      toast('success', 'تم حفظ إعدادات الشركة بنجاح');
    } else {
      toast('error', 'حدث خطأ أثناء حفظ الإعدادات');
    }
    setSaving(false);
  };

  if (checking || !authorized || loading) {
    return (
      <AppShell title="إعدادات الشركة" activePath="/settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="إعدادات الشركة" activePath="/settings">
      <div className="max-w-2xl">
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">بيانات المنشأة</CardTitle>
              <p className="text-sm text-text-secondary">البيانات التي تظهر في الفواتير وشاشة البيع</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="اسم الشركة / المغسلة *"
              value={form.companyNameAr}
              onChange={(e) => update('companyNameAr', e.target.value)}
              fullWidth
            />
            <Input
              label="الاسم بالإنجليزي"
              value={form.companyNameEn || ''}
              onChange={(e) => update('companyNameEn', e.target.value)}
              fullWidth
              dir="ltr"
            />
            <Input
              label="رقم الجوال"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              fullWidth
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={form.email || ''}
              onChange={(e) => update('email', e.target.value)}
              fullWidth
              dir="ltr"
            />
            <Textarea
              label="العنوان"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              rows={2}
            />
            <Input
              label="السجل التجاري (اختياري)"
              value={form.crNumber || ''}
              onChange={(e) => update('crNumber', e.target.value)}
              fullWidth
            />
            <Input
              label="رابط الشعار (اختياري)"
              value={form.logoUrl || ''}
              onChange={(e) => update('logoUrl', e.target.value)}
              fullWidth
              dir="ltr"
              placeholder="https://example.com/logo.png"
            />

            <div className="pt-4">
              <Button
                icon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                loading={saving}
                fullWidth
              >
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
