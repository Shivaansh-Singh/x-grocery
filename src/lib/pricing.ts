/**
 * Single Source of Truth for RushD Pricing & Fee Calculations
 */

export const FREE_DELIVERY_THRESHOLD = 200;
export const STANDARD_DELIVERY_FEE = 20;
export const PLATFORM_PACKAGING_FEE = 2;

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  platformPackagingFee: number;
  totalAmount: number;
  freeDeliveryThreshold: number;
  amountForFreeDelivery: number;
  isFreeDelivery: boolean;
}

/**
 * Calculates authoritative order pricing based on merchandise subtotal and item count.
 *
 * Rules:
 * - Subtotal < ₹200 -> Delivery Fee = ₹20
 * - Subtotal >= ₹200 -> Delivery Fee = ₹0 (FREE)
 * - Platform & Packaging Fee = ₹2 (Applied to all non-empty orders)
 * - Total = Subtotal + Delivery Fee + Platform & Packaging Fee
 */
export function calculateOrderPricing(subtotal: number, itemCount = 1): OrderPricing {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);

  if (itemCount <= 0 || safeSubtotal <= 0) {
    return {
      subtotal: 0,
      deliveryFee: 0,
      platformPackagingFee: 0,
      totalAmount: 0,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      amountForFreeDelivery: FREE_DELIVERY_THRESHOLD,
      isFreeDelivery: false,
    };
  }

  const isFreeDelivery = safeSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE;
  const platformPackagingFee = PLATFORM_PACKAGING_FEE;
  const totalAmount = safeSubtotal + deliveryFee + platformPackagingFee;
  const amountForFreeDelivery = isFreeDelivery ? 0 : FREE_DELIVERY_THRESHOLD - safeSubtotal;

  return {
    subtotal: safeSubtotal,
    deliveryFee,
    platformPackagingFee,
    totalAmount,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountForFreeDelivery,
    isFreeDelivery,
  };
}
