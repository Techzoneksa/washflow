'use client';
import AppShell from '@/components/layout/AppShell';
import ColorPalette from '@/components/design-system/ColorPalette';
import TypographyPreview from '@/components/design-system/TypographyPreview';
import ButtonsPreview from '@/components/design-system/ButtonsPreview';
import InputsPreview from '@/components/design-system/InputsPreview';
import CardsPreview from '@/components/design-system/CardsPreview';
import TablesPreview from '@/components/design-system/TablesPreview';
import StatusPreview from '@/components/design-system/StatusPreview';
import LayoutPreview from '@/components/design-system/LayoutPreview';
import Tabs from '@/components/ui/Tabs';
import { useState } from 'react';

const tabs = [
  { id: 'colors', label: 'الألوان' },
  { id: 'typography', label: 'الخطوط' },
  { id: 'buttons', label: 'الأزرار' },
  { id: 'inputs', label: 'الحقول' },
  { id: 'cards', label: 'البطاقات' },
  { id: 'tables', label: 'الجداول' },
  { id: 'status', label: 'الحالات' },
  { id: 'layout', label: 'التخطيط' },
];

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState('colors');

  return (
    <AppShell title="نظام التصميم" activePath="/design-system">
      <div className="mb-6 overflow-x-auto">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
      </div>

      <div className="bg-bg-surface border border-border-default rounded-card p-4 sm:p-6">
        {activeTab === 'colors' && <ColorPalette />}
        {activeTab === 'typography' && <TypographyPreview />}
        {activeTab === 'buttons' && <ButtonsPreview />}
        {activeTab === 'inputs' && <InputsPreview />}
        {activeTab === 'cards' && <CardsPreview />}
        {activeTab === 'tables' && <TablesPreview />}
        {activeTab === 'status' && <StatusPreview />}
        {activeTab === 'layout' && <LayoutPreview />}
      </div>
    </AppShell>
  );
}
