import type { CompanySetup } from '@/types/company';

export const defaultCompanySetup: CompanySetup = {
  company: { nameAr: '', phone: '', city: '', address: '' },
  tax: { registered: false, taxRate: 15, priceIncludesTax: true },
  invoice: {
    invoiceTitle: 'فاتورة ضريبية',
    footerText: 'شكرًا لثقتكم بخدماتنا',
    showLogo: true,
    showTaxNumber: true,
    showQr: true,
    paperSize: 'thermal-80mm',
    defaultCopies: 1,
    autoNumbering: true,
    invoicePrefix: 'WF-',
    orderPrefix: 'ORD-',
  },
  completed: false,
};

export function saveCompanySetup(data: CompanySetup): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wf_company_setup', JSON.stringify(data));
  }
}

export function getCompanySetup(): CompanySetup | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('wf_company_setup');
  if (!raw) return null;
  try { return JSON.parse(raw) as CompanySetup; } catch { return null; }
}

export function isSetupComplete(): boolean {
  const setup = getCompanySetup();
  return setup?.completed === true;
}
