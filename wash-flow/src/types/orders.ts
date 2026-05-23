import type { PosOrder } from './pos';

export interface OrderCancelData {
  reason: string;
  cancelledBy: string;
  cancelledAt: string;
}

export interface OrderRefundData {
  reason: string;
  refundAmount: number;
  refundedBy: string;
  refundedAt: string;
}

export interface OrderHistoryItem extends PosOrder {
  cancelledData?: OrderCancelData;
  refundedData?: OrderRefundData;
}
