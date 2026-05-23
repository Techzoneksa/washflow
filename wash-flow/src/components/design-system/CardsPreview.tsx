'use client';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TrendingUp, ShoppingCart, DollarSign, Wallet, Settings, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CardsPreview() {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">البطاقات</h2>

      {/* Stat Cards */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">بطاقات الإحصائيات</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">مبيعات اليوم</span>
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(1250)}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-success-600 font-medium">+12%</span>
              <span className="text-xs text-text-secondary">من أمس</span>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">الطلبات</span>
              <div className="w-9 h-9 rounded-lg bg-info-50 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-info-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">38</p>
            <p className="text-xs text-text-secondary mt-1">٣ طلبات جديدة</p>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">المصاريف</span>
              <div className="w-9 h-9 rounded-lg bg-warning-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-warning-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(320)}</p>
            <p className="text-xs text-text-secondary mt-1">مصاريف اليوم</p>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">صافي اليوم</span>
              <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-success-600">{formatCurrency(930)}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-secondary">نقد {formatCurrency(750)}</span>
              <span className="text-xs text-text-secondary">شبكة {formatCurrency(500)}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Service Cards */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">بطاقات الخدمات</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'سيارة صغيرة', price: 25, popular: true },
            { name: 'سيارة كبيرة', price: 35 },
            { name: 'دينا', price: 60 },
            { name: 'غسيل داخلي', price: 20 },
          ].map((svc) => (
            <Card key={svc.name} hoverable className="text-center">
              {svc.popular && (
                <Badge variant="primary" size="sm" className="mb-2">الأكثر طلبًا</Badge>
              )}
              <p className="text-sm font-medium text-text-primary mb-1">{svc.name}</p>
              <p className="text-lg font-bold text-primary-600">{formatCurrency(svc.price)}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Setting Card */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">بطاقات أخرى</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-text-secondary" />
            </div>
            <div>
              <CardTitle>الإعدادات</CardTitle>
              <p className="text-xs text-text-secondary">إعدادات النظام</p>
            </div>
          </Card>

          <Card hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <CardTitle>التقارير</CardTitle>
              <p className="text-xs text-text-secondary">تقارير المبيعات</p>
            </div>
          </Card>

          <Card hoverable className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-success-500" />
            </div>
            <div>
              <CardTitle>المشتريات</CardTitle>
              <p className="text-xs text-text-secondary">طلبات الشراء</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
