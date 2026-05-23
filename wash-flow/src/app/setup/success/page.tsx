'use client';
import { useRouter } from 'next/navigation';
import SetupSuccessCard from '@/components/setup/SetupSuccessCard';
import { Droplets } from 'lucide-react';

export default function SetupSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3">
            <Droplets className="h-7 w-7 text-white" />
          </div>
        </div>
        <SetupSuccessCard
          onDashboard={() => router.push('/dashboard')}
          onReview={() => router.push('/setup/company')}
        />
      </div>
    </div>
  );
}
