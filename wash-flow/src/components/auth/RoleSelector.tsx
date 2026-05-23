'use client';
import { useState } from 'react';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getRoleLabel, createSession } from '@/lib/mock-auth';
import type { UserRole } from '@/types';
import type { MockUser } from '@/types/auth';
import { Crown, UserCog, Calculator, ShoppingCart, LogIn } from 'lucide-react';

const roleIcons: Record<UserRole, React.ReactNode> = {
  owner: <Crown className="h-8 w-8" />,
  manager: <UserCog className="h-8 w-8" />,
  accountant: <Calculator className="h-8 w-8" />,
  cashier: <ShoppingCart className="h-8 w-8" />,
};

const roleDescriptions: Record<UserRole, { desc: string; permissions: string[] }> = {
  owner: {
    desc: 'وصول كامل لجميع أقسام النظام والإعدادات',
    permissions: ['لوحة التحكم', 'نقطة البيع', 'الطلبات', 'الخدمات', 'المصاريف', 'الموردين', 'المشتريات', 'العمالة', 'الرواتب', 'التقارير', 'الإعدادات', 'زاتكا'],
  },
  manager: {
    desc: 'إدارة التشغيل، الطلبات، الخدمات، المصاريف، العمالة والتقارير',
    permissions: ['لوحة التحكم', 'نقطة البيع', 'الطلبات', 'الخدمات', 'المصاريف', 'الموردين', 'المشتريات', 'العمالة', 'التقارير', 'الإعدادات'],
  },
  accountant: {
    desc: 'إدارة المشتريات، المصاريف، الموردين، الرواتب، الحسابات والتقارير',
    permissions: ['لوحة التحكم', 'المشتريات', 'المصاريف', 'الموردين', 'الرواتب', 'شجرة الحسابات', 'الصندوق', 'التقارير'],
  },
  cashier: {
    desc: 'الدخول إلى شاشة نقاط البيع وطلبات اليوم فقط',
    permissions: ['نقطة البيع', 'الطلبات', 'الفواتير', 'تسجيل خروج'],
  },
};

interface RoleSelectorProps {
  user: MockUser;
  onSelect: (role: UserRole) => void;
}

export default function RoleSelector({ user, onSelect }: RoleSelectorProps) {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (role: UserRole) => {
    setSelected(role);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    createSession(user, role);
    onSelect(role);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          مرحباً <span className="font-semibold text-text-primary">{user.name}</span>
        </p>
        <p className="text-xs text-text-secondary mt-1">اختر الدور الذي تريد الدخول به</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {user.roles.map((role) => {
          const info = roleDescriptions[role];
          const isSelected = selected === role;
          return (
            <Card
              key={role}
              variant={isSelected ? 'outlined' : 'default'}
              hoverable
              padding="lg"
              onClick={() => handleSelect(role)}
              className={`border-2 transition-all ${
                isSelected ? 'border-primary-500 bg-primary-50/50' : 'hover:border-primary-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl ${
                  isSelected ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-text-secondary'
                }`}>
                  {roleIcons[role]}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle>{getRoleLabel(role)}</CardTitle>
                  <p className="text-xs text-text-secondary mt-1">{info.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {info.permissions.map((p) => (
                      <Badge key={p} variant="neutral" size="sm">{p}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="mt-3">
                  <Button fullWidth size="sm" loading={loading}>
                    <LogIn className="h-4 w-4" />
                    دخول
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
