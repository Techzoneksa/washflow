'use client';
import Badge from '@/components/ui/Badge';
import type { EmployeeStatus } from '@/types/employees';

interface EmployeeBadgeProps {
  status: EmployeeStatus;
}

export default function EmployeeBadge({ status }: EmployeeBadgeProps) {
  if (status === 'active') {
    return <Badge variant="success">نشط</Badge>;
  }
  return <Badge variant="neutral">متوقف</Badge>;
}
