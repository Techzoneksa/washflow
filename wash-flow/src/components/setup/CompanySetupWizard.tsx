'use client';
import { useState } from 'react';
import CompanyInfoStep from './CompanyInfoStep';
import TaxInfoStep from './TaxInfoStep';
import InvoiceSettingsStep from './InvoiceSettingsStep';
import ReviewSetupStep from './ReviewSetupStep';
import { defaultCompanySetup, saveCompanySetup } from '@/lib/mock-company-settings';
import type { CompanySetup, SetupStep, CompanyInfo, TaxInfo, InvoiceSettings } from '@/types/company';
import { Check } from 'lucide-react';

const steps: { id: SetupStep; label: string }[] = [
  { id: 'company', label: 'بيانات الشركة' },
  { id: 'tax', label: 'البيانات الضريبية' },
  { id: 'invoice', label: 'إعدادات الفاتورة' },
  { id: 'review', label: 'مراجعة' },
];

interface CompanySetupWizardProps {
  onComplete: () => void;
}

export default function CompanySetupWizard({ onComplete }: CompanySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [setup, setSetup] = useState<CompanySetup>(defaultCompanySetup);
  const [saving, setSaving] = useState(false);

  const stepId = steps[currentStep].id;

  const goNext = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const goBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const updateCompany = (data: CompanyInfo) => setSetup({ ...setup, company: data });
  const updateTax = (data: TaxInfo) => setSetup({ ...setup, tax: data });
  const updateInvoice = (data: InvoiceSettings) => setSetup({ ...setup, invoice: data });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    saveCompanySetup({ ...setup, completed: true });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === currentStep ? 'bg-primary-500 text-white' :
              i < currentStep ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-text-secondary'
            }`}>
              {i < currentStep ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i < currentStep ? 'bg-success-400' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-bg-surface border border-border-default rounded-card p-4 sm:p-6">
        {stepId === 'company' && <CompanyInfoStep data={setup.company} onUpdate={updateCompany} onNext={goNext} />}
        {stepId === 'tax' && <TaxInfoStep data={setup.tax} onUpdate={updateTax} onNext={goNext} onBack={goBack} />}
        {stepId === 'invoice' && (
          <InvoiceSettingsStep
            data={setup.invoice}
            companyName={setup.company.nameAr}
            logo={setup.company.logo}
            showTaxNumber={setup.tax.registered}
            taxNumber={setup.tax.taxNumber}
            taxRate={setup.tax.taxRate}
            priceIncludesTax={setup.tax.priceIncludesTax}
            onUpdate={updateInvoice}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {stepId === 'review' && (
          <ReviewSetupStep
            company={setup.company}
            tax={setup.tax}
            invoice={setup.invoice}
            onBack={goBack}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
