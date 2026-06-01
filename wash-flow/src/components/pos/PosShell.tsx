'use client';
import { useState, useCallback } from 'react';
import ServiceGrid from './ServiceGrid';
import CartPanel from './CartPanel';
import OrderSuccessModal from './OrderSuccessModal';
import InvoicePreviewModal from './InvoicePreviewModal';
import TodayOrdersPanel from './TodayOrdersPanel';
import BottomSheet from '@/components/ui/BottomSheet';
import { useToast } from '@/components/ui/Toast';
import {
  addToCart, updateCartQuantity, removeFromCart,
  createMockOrder, calculateCartTotals,
} from '@/lib/mock-pos';
import { formatCurrency } from '@/lib/utils';
import type {
  WashService, CartItem as CartItemType,
  PosCustomerInfo, PaymentMethod, MixedPayment, PosOrder,
} from '@/types/pos';
import { ShoppingCart } from 'lucide-react';

export default function PosShell() {
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [customerInfo, setCustomerInfo] = useState<PosCustomerInfo>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [mixedPayment, setMixedPayment] = useState<MixedPayment>({ cash: 0, card: 0, transfer: 0 });

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PosOrder | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const [showCartSheet, setShowCartSheet] = useState(false);

  const cartServiceIds = new Set(cartItems.map(i => i.serviceId));
  const cartTotals = calculateCartTotals(cartItems);

  const handleAddService = useCallback((service: WashService) => {
    setCartItems(prev => addToCart(prev, service));
  }, []);

  const handleUpdateQuantity = useCallback((serviceId: string, quantity: number) => {
    setCartItems(prev => updateCartQuantity(prev, serviceId, quantity));
  }, []);

  const handleRemoveItem = useCallback((serviceId: string) => {
    setCartItems(prev => removeFromCart(prev, serviceId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCustomerInfo({});
    setPaymentMethod(null);
    setMixedPayment({ cash: 0, card: 0, transfer: 0 });
  }, []);

  const handleCompleteOrder = useCallback(() => {
    if (cartItems.length === 0) return;
    if (!paymentMethod) return;

    const isMixedValid = paymentMethod !== 'mixed' ||
      Math.abs((mixedPayment.cash || 0) + (mixedPayment.card || 0) + (mixedPayment.transfer || 0) - cartTotals.total) < 0.01;
    if (!isMixedValid) return;

    setSubmitting(true);

    setTimeout(() => {
      const order = createMockOrder(cartItems, paymentMethod, customerInfo, mixedPayment);
      setCompletedOrder(order);
      setSubmitting(false);
      setShowSuccess(true);
      setShowCartSheet(false);
    }, 800);
  }, [cartItems, paymentMethod, mixedPayment, customerInfo, cartTotals.total]);

  const handleNewOrder = useCallback(() => {
    setShowSuccess(false);
    setShowInvoice(false);
    setCompletedOrder(null);
    setCartItems([]);
    setCustomerInfo({});
    setPaymentMethod(null);
    setMixedPayment({ cash: 0, card: 0, transfer: 0 });
  }, []);

  const handlePrint = useCallback(() => {
    toast('success', 'تم إرسال أمر الطباعة تجريبيًا');
  }, [toast]);

  const handleViewInvoice = useCallback(() => {
    setShowInvoice(true);
  }, []);

  const cartPanelProps = {
    items: cartItems,
    customerInfo,
    paymentMethod,
    mixedPayment,
    onUpdateQuantity: handleUpdateQuantity,
    onRemoveItem: handleRemoveItem,
    onClearCart: handleClearCart,
    onCustomerInfoChange: setCustomerInfo,
    onPaymentMethodChange: setPaymentMethod,
    onMixedPaymentChange: setMixedPayment,
    onCompleteOrder: handleCompleteOrder,
    submitting,
  };

  return (
    <>
      {/* ===== Mobile Layout (< 768px) ===== */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 min-h-0">
          <ServiceGrid cartServiceIds={cartServiceIds} onAddService={handleAddService} breakpoint="mobile" />
        </div>

        {cartItems.length > 0 && (
          <>
            <div className={`fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-bg-main via-bg-main/95 to-transparent pointer-events-none ${showCartSheet ? 'hidden' : ''}`}>
              <div className="pointer-events-auto">
                <button
                  onClick={() => setShowCartSheet(true)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-primary-500 text-text-inverse rounded-xl shadow-lg shadow-primary-500/30 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-text-inverse text-primary-600 text-[10px] font-bold flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    </div>
                    <span className="font-semibold text-sm">عرض السلة</span>
                  </div>
                  <span className="font-bold text-sm tabular-nums">{formatCurrency(cartTotals.total)}</span>
                </button>
              </div>
            </div>
            <div className="h-20" />
          </>
        )}

        <BottomSheet open={showCartSheet} onClose={() => setShowCartSheet(false)} height="full" title="سلة الطلب">
          <CartPanel {...cartPanelProps} />
        </BottomSheet>
      </div>

      {/* ===== Tablet Layout (768px - 1023px) ===== */}
      <div className="hidden md:flex lg:hidden h-full gap-3">
        {/* Services Area - 65% */}
        <div className="flex-[15] min-w-0 flex flex-col">
          <ServiceGrid cartServiceIds={cartServiceIds} onAddService={handleAddService} breakpoint="tablet" />
        </div>

        {/* Cart Panel - 35% */}
        <div className="w-[320px] xl:w-[360px] shrink-0 flex flex-col bg-bg-surface border border-border-default rounded-xl">
          <CartPanel {...cartPanelProps} />
        </div>
      </div>

      {/* ===== Desktop Layout (1024px+) ===== */}
      <div className="hidden lg:flex h-full gap-4 xl:gap-5">
        {/* Services Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ServiceGrid cartServiceIds={cartServiceIds} onAddService={handleAddService} breakpoint="desktop" />
        </div>

        {/* Cart Panel */}
        <div className="w-[340px] xl:w-[380px] shrink-0 flex flex-col bg-bg-surface border border-border-default rounded-xl">
          <CartPanel {...cartPanelProps} />
        </div>

        {/* Today Orders (collapsible) */}
        <div className="hidden xl:flex w-[260px] shrink-0 flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text-primary">آخر الطلبات</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TodayOrdersPanel />
          </div>
        </div>
      </div>

      {/* ===== Modals ===== */}
      <OrderSuccessModal
        open={showSuccess}
        order={completedOrder}
        onPrint={handlePrint}
        onViewInvoice={handleViewInvoice}
        onNewOrder={handleNewOrder}
      />

      <InvoicePreviewModal
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        order={completedOrder}
        onPrint={handlePrint}
      />
    </>
  );
}