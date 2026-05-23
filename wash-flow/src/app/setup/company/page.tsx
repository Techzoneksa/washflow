'use client';
import { useRouter } from 'next/navigation';
import CompanySetupWizard from '@/components/setup/CompanySetupWizard';
import { Droplets } from 'lucide-react';

export default function CompanySetupPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/setup/success');
  };

  return (
    <div className="min-h-screen bg-bg-main py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3">
            <Droplets className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">إعداد الشركة</h1>
          <p className="text-sm text-text-secondary mt-1">قم بإعداد بيانات شركتك للبدء في استخدام النظام</p>
        </div>
        <CompanySetupWizard onComplete={handleComplete} />
      </div>
    </div>
  );
}
