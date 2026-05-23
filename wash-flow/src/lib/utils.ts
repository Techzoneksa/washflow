export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date));
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'مكتمل',
    'in-progress': 'قيد التنفيذ',
    cancelled: 'ملغي',
    refunded: 'مسترد',
    new: 'جديد',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    partial: 'مدفوع جزئيًا',
    overdue: 'متأخر',
    active: 'نشط',
    inactive: 'غير نشط',
  };
  return labels[status] || status;
}
