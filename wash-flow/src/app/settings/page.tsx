'use client';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { Building2, Users, ChevronLeft } from 'lucide-react';

const settingCards = [
  {
    title: 'إعدادات الشركة',
    description: 'بيانات المنشأة التي تظهر في الفواتير ونقطة البيع',
    icon: Building2,
    href: '/settings/company',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    title: 'المستخدمين والصلاحيات',
    description: 'إدارة المستخدمين وأدوارهم في النظام',
    icon: Users,
    href: '/settings/users',
    color: 'text-info-500',
    bg: 'bg-info-50',
  },
];

export default function SettingsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager']);

  if (checking || !authorized) return null;

  return (
    <AppShell title="الإعدادات" activePath="/settings">
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        {settingCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card padding="lg" className="hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold text-text-primary">{card.title}</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">{card.description}</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-text-disabled group-hover:text-text-secondary transition-colors shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
