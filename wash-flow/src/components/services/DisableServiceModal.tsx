'use client';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { ServiceItem } from '@/types/services';
import { AlertTriangle } from 'lucide-react';

interface DisableServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  onConfirm: () => void;
  enable?: boolean;
}

export default function DisableServiceModal({ open, onClose, service, onConfirm, enable = false }: DisableServiceModalProps) {
  if (!service) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm" title={enable ? 'تفعيل الخدمة' : 'تعطيل الخدمة'}>
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-3 rounded-xl ${enable ? 'bg-success-50' : 'bg-warning-50'}`}>
          <AlertTriangle className={`h-5 w-5 shrink-0 ${enable ? 'text-success-600' : 'text-warning-600'}`} />
          <div>
            <p className={`text-sm font-semibold ${enable ? 'text-success-700' : 'text-warning-700'}`}>
              {enable ? 'تفعيل الخدمة' : 'تعطيل الخدمة'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {enable
                ? `سيتم إظهار الخدمة "${service.nameAr}" في النظام و POS.`
                : `تعطيل الخدمة "${service.nameAr}" سيمنع ظهورها في شاشة POS.`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={onClose}>إلغاء</Button>
          <Button variant={enable ? 'success' : 'danger'} fullWidth onClick={onConfirm}>
            {enable ? 'تأكيد التفعيل' : 'تأكيد التعطيل'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
