'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import Card, { CardTitle } from '@/components/ui/Card';
import { useAuthGuard } from '@/lib/route-guards';
import { getCurrentRole } from '@/lib/supabase/auth';
import type { UserRole } from '@/types';
import { Building2, Users, Monitor, ChevronLeft } from 'lucide-react';

interface SettingCard {
  title: string;
  description: string;
  icon: typeof Building2;
  href: string;
  color: string;
  bg: string;
  roles: UserRole[];
}

const allCards: SettingCard[] = [
  {
    title: 'إعدادات الشركة',
    description: 'بيانات المنشأة التي تظهر في الفواتير ونقطة البيع',
    icon: Building2,
    href: '/settings/company',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
    roles: ['owner', 'manager'],
  },
  {
    title: 'المستخدمين والصلاحيات',
    description: 'إدارة المستخدمين وأدوارهم في النظام',
    icon: Users,
    href: '/settings/users',
    color: 'text-info-500',
    bg: 'bg-info-50',
    roles: ['owner'],
  },
  {
    title: 'أجهزة نقاط البيع',
    description: 'إدارة أجهزة POS وحسابات الكاشير',
    icon: Monitor,
    href: '/settings/pos-devices',
    color: 'text-neutral-500',
    bg: 'bg-neutral-50',
    roles: ['owner'],
  },
];

export default function SettingsPage() {
  const { authorized, checking } = useAuthGuard(['owner', 'manager']);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    getCurrentRole().then(setRole);
  }, []);

  if (checking || !authorized) return null;

  const visibleCards = role ? allCards.filter((c) => c.roles.includes(role)) : [];

  return (
    <AppShell title="الإعدادات" activePath="/settings">
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        {visibleCards.map((card) => {
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
