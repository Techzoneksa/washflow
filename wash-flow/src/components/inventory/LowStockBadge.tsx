'use client';
import Badge from '@/components/ui/Badge';
import type { InventoryItem } from '@/types/inventory';

interface LowStockBadgeProps {
  current: number;
  minimum: number;
  status: InventoryItem['status'];
}

export default function LowStockBadge({ current, minimum, status }: LowStockBadgeProps) {
  if (status === 'inactive') {
    return <Badge variant="neutral">غير نشط</Badge>;
  }
  if (current === 0) {
    return <Badge variant="danger">نفد</Badge>;
  }
  if (current <= minimum) {
    return <Badge variant="warning">منخفض</Badge>;
  }
  return <Badge variant="success">متوفر</Badge>;
}
