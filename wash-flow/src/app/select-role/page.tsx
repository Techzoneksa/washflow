'use client';
import { useRouter } from 'next/navigation';
import RoleSelector from '@/components/auth/RoleSelector';
import { getSession, mockUsers } from '@/lib/mock-auth';
import { Droplets } from 'lucide-react';
import type { UserRole } from '@/types';
import type { MockUser } from '@/types/auth';

function getPendingUser(): MockUser | null {
  const pendingRaw = typeof window !== 'undefined' ? sessionStorage.getItem('wf_pending_user') : null;
  if (pendingRaw) {
    const pending = JSON.parse(pendingRaw);
    const found = mockUsers.find((u) => u.email === pending.email);
    if (found) { sessionStorage.removeItem('wf_pending_user'); return found; }
  }
  const session = getSession();
  if (session && session.user.roles.length > 1) return session.user;
  return null;
}

export default function SelectRolePage() {
  const router = useRouter();
  const user = getPendingUser();

  const handleSelect = (role: UserRole) => {
    if (role === 'cashier') router.push('/pos');
    else router.push('/dashboard');
  };

  if (!user) { if (typeof window !== 'undefined') router.replace('/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/5 via-bg-main to-primary-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3">
            <Droplets className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">اختيار الدور</h1>
        </div>
        <RoleSelector user={user} onSelect={handleSelect} />
      </div>
    </div>
  );
}
