export interface OrderProps {
  id: number;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
}

export interface OrderItemProps {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "cancelled",
  "shipped",
  "completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(status: string): status is OrderStatus {
  return ORDER_STATUSES.includes(status as OrderStatus);
}
