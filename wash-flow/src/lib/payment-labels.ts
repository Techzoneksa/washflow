export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'كاش',
    network: 'شبكة',
    mixed: 'تخصيص',
  };
  return labels[method] || method;
}
