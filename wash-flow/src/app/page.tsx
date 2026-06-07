'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      if (isSupabaseConfigured()) {
        const user = await getCurrentUser();
        if (user) {
          router.replace('/dashboard');
          return;
        }
      }
      router.replace('/login');
    };
    check();
  }, [router]);

  return null;
}
