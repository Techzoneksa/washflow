'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/mock-auth';
import { LogOut, Sun, Moon, XCircle, Bell } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function POSHeader() {
  const router = useRouter();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [dark, setDark] = useState(false);
  const [showCloseDrawer, setShowCloseDrawer] = useState(false);

  const session = typeof window !== 'undefined' ? getSession() : null;
  const userName = session?.user?.name || 'مستخدم';

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const handleCloseDrawer = () => {
    setShowCloseDrawer(true);
  };

  const toggleDark = () => {
    setDark((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <header className="h-14 shrink-0 bg-[#1A1A2E] text-white flex items-center px-4 gap-3 z-40">
        <h1 className="text-base font-bold whitespace-nowrap">نقطة البيع</h1>

        <div className="hidden md:flex items-center gap-2 mr-3">
          <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold">
            WF
          </div>
          <span className="text-sm text-white/80">واش فلو</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-xs text-white/70">
          <span className="hidden md:inline">
            أهلاً <strong className="text-white">{userName}</strong>
          </span>
          <span className="hidden sm:inline tabular-nums">{date}</span>
          <span className="tabular-nums font-medium text-white" suppressHydrationWarning>
            {time}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={dark ? 'وضع النهار' : 'وضع الليل'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative" title="التنبيهات">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger-500 rounded-full" />
          </button>

          <button
            onClick={handleCloseDrawer}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-amber-300"
            title="إغلاق الصندوق"
          >
            <XCircle className="h-4 w-4" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-red-300"
            title="تسجيل خروج"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <Modal open={showCloseDrawer} onClose={() => setShowCloseDrawer(false)} size="sm">
        <div className="text-center py-4">
          <h3 className="text-base font-bold text-text-primary mb-2">إغلاق الصندوق</h3>
          <p className="text-sm text-text-secondary mb-6">
            سيتم تنفيذ إغلاق الصندوق في مرحلة الورديات
          </p>
          <Button fullWidth variant="outline" onClick={() => setShowCloseDrawer(false)}>
            حسناً
          </Button>
        </div>
      </Modal>
    </>
  );
}
