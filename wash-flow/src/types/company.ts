export interface CompanyInfo {
  nameAr: string;
  nameEn?: string;
  logo?: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  commercialRecord?: string;
}

export interface TaxInfo {
  registered: boolean;
  taxNumber?: string;
  taxRate: number;
  priceIncludesTax: boolean;
}

export interface InvoiceSettings {
  invoiceTitle: string;
  footerText: string;
  showLogo: boolean;
  showTaxNumber: boolean;
  showQr: boolean;
  paperSize: 'thermal-80mm' | 'a4';
  defaultCopies: number;
  autoNumbering: boolean;
  invoicePrefix: string;
  orderPrefix: string;
}

export interface CompanySetup {
  company: CompanyInfo;
  tax: TaxInfo;
  invoice: InvoiceSettings;
  completed: boolean;
}

export type SetupStep = 'company' | 'tax' | 'invoice' | 'review';
