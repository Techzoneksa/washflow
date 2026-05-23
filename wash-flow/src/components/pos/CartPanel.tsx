'use client';
import { ShoppingCart, Trash2, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import CartItem from './CartItem';
import CustomerInfoForm from './CustomerInfoForm';
import OrderSummary from './OrderSummary';
import PaymentMethodSelector from './PaymentMethodSelector';
import MixedPaymentForm from './MixedPaymentForm';
import type { CartItem as CartItemType, PaymentMethod, PosCustomerInfo, MixedPayment } from '@/types/pos';
import { calculateCartTotals } from '@/lib/mock-pos';
import { formatCurrency } from '@/lib/utils';

interface CartPanelProps {
  items: CartItemType[];
  customerInfo: PosCustomerInfo;
  paymentMethod: PaymentMethod | null;
  mixedPayment: MixedPayment;
  onUpdateQuantity: (serviceId: string, quantity: number) => void;
  onRemoveItem: (serviceId: string) => void;
  onClearCart: () => void;
  onCustomerInfoChange: (info: PosCustomerInfo) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onMixedPaymentChange: (payment: MixedPayment) => void;
  onCompleteOrder: () => void;
  submitting: boolean;
}

export default function CartPanel({
  items, customerInfo, paymentMethod, mixedPayment,
  onUpdateQuantity, onRemoveItem, onClearCart,
  onCustomerInfoChange, onPaymentMethodChange, onMixedPaymentChange,
  onCompleteOrder, submitting,
}: CartPanelProps) {
  const tax = calculateCartTotals(items);
  const isEmpty = items.length === 0;
  const canSubmit = !isEmpty && !!paymentMethod && (!submitting);
  const isMixedValid = paymentMethod !== 'mixed' ||
    Math.abs((mixedPayment.cash || 0) + (mixedPayment.card || 0) + (mixedPayment.transfer || 0) - tax.total) < 0.01;

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between px-1 pb-2 border-b border-border-default">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary-500" />
          <span className="text-sm font-semibold text-text-primary">السلة</span>
          <span className="text-xs text-text-secondary bg-neutral-100 px-2 py-0.5 rounded-full tabular-nums">
            {items.length}
          </span>
        </div>
        {!isEmpty && (
          <button
            onClick={onClearCart}
            className="flex items-center gap-1 text-xs text-danger-500 hover:text-danger-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            تفريغ
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 py-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-10 w-10 text-text-disabled mb-2" />
            <p className="text-sm text-text-secondary">السلة فارغة</p>
            <p className="text-xs text-text-disabled mt-1">اختر خدمة للبدء</p>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <CartItem
                key={item.serviceId}
                item={item}
                onIncrease={() => onUpdateQuantity(item.serviceId, item.quantity + 1)}
                onDecrease={() => onUpdateQuantity(item.serviceId, item.quantity - 1)}
                onRemove={() => onRemoveItem(item.serviceId)}
              />
            ))}
          </>
        )}
      </div>

      {!isEmpty && (
        <div className="shrink-0 space-y-3 pt-2 border-t border-border-default">
          <CustomerInfoForm value={customerInfo} onChange={onCustomerInfoChange} />
          <PaymentMethodSelector value={paymentMethod} onChange={onPaymentMethodChange} />
          {paymentMethod === 'mixed' && (
            <MixedPaymentForm total={tax.total} value={mixedPayment} onChange={onMixedPaymentChange} />
          )}
          <OrderSummary tax={tax} />

          {!isMixedValid && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-danger-50 text-danger-700 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              المبالغ لا تساوي الإجمالي
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            disabled={!canSubmit || !isMixedValid}
            onClick={onCompleteOrder}
          >
                            إتمام الطلب — {formatCurrency(tax.total)}
          </Button>
        </div>
      )}
    </div>
  );
}
