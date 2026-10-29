/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PurchaseRequestStatus } from '../types';

/**
 * Deterministic calculation for total expected amount:
 * Valor esperado = quantidade de números × preço unitário
 */
export function calculateExpectedTotal(quantity: number, unitPrice: number): number {
  if (quantity < 0 || unitPrice < 0) {
    throw new Error('Quantidade e preço unitário não podem ser negativos');
  }
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Validates whether the declared or received amount is sufficient:
 */
export function evaluatePaymentSufficiency(expected: number, received: number): {
  isSufficient: boolean;
  difference: number;
  status: 'SUFFICIENT' | 'INSUFFICIENT' | 'SURPLUS';
} {
  const diff = Math.round((received - expected) * 100) / 100;
  if (Math.abs(diff) < 0.01) {
    return { isSufficient: true, difference: 0, status: 'SUFFICIENT' };
  } else if (diff < 0) {
    return { isSufficient: false, difference: Math.abs(diff), status: 'INSUFFICIENT' };
  } else {
    return { isSufficient: true, difference: diff, status: 'SURPLUS' };
  }
}

/**
 * Concurrency & Collision Check:
 * Ensures no requested ticket is already occupied or reserved by another transaction.
 */
export function checkTicketConcurrency(
  requestedTickets: number[],
  alreadyAssignedTickets: Set<number>
): { hasConflict: boolean; conflictingTickets: number[] } {
  const conflicting: number[] = [];
  for (const ticket of requestedTickets) {
    if (alreadyAssignedTickets.has(ticket)) {
      conflicting.push(ticket);
    }
  }
  return {
    hasConflict: conflicting.length > 0,
    conflictingTickets: conflicting,
  };
}

/**
 * Reservation Expiration:
 * Temporary reservations expire if proof or payment is not completed within timeout (e.g. 15 minutes).
 */
export function isReservationExpired(createdAtMs: number, timeoutMs: number = 15 * 60 * 1000, nowMs: number = Date.now()): boolean {
  return nowMs - createdAtMs > timeoutMs;
}

/**
 * Strict State Machine for Purchase Requests:
 */
export function transitionPurchaseStatus(
  current: PurchaseRequestStatus,
  event: 
    | 'SUBMIT_PROOF'
    | 'PSP_PAYMENT_CONFIRMED'
    | 'PAYMENT_UNDERPAID'
    | 'EXPIRE_TIMEOUT'
    | 'CANCEL'
    | 'ADMIN_EXCEPTION_CONFIRM'
): PurchaseRequestStatus {
  switch (current) {
    case 'PENDING_PAYMENT':
      if (event === 'SUBMIT_PROOF') return 'PROOF_RECEIVED';
      if (event === 'PSP_PAYMENT_CONFIRMED') return 'PAYMENT_CONFIRMED';
      if (event === 'PAYMENT_UNDERPAID') return 'PAYMENT_INSUFFICIENT';
      if (event === 'EXPIRE_TIMEOUT') return 'EXPIRED';
      if (event === 'CANCEL') return 'CANCELLED';
      break;

    case 'PROOF_RECEIVED':
      if (event === 'PSP_PAYMENT_CONFIRMED') return 'CONFIRMED';
      if (event === 'PAYMENT_UNDERPAID') return 'PAYMENT_INSUFFICIENT';
      if (event === 'ADMIN_EXCEPTION_CONFIRM') return 'CONFIRMED';
      if (event === 'CANCEL') return 'CANCELLED';
      break;

    case 'PAYMENT_CONFIRMED':
      if (event === 'PSP_PAYMENT_CONFIRMED') return 'CONFIRMED';
      if (event === 'ADMIN_EXCEPTION_CONFIRM') return 'CONFIRMED';
      break;

    case 'PAYMENT_INSUFFICIENT':
      if (event === 'PSP_PAYMENT_CONFIRMED') return 'CONFIRMED';
      if (event === 'SUBMIT_PROOF') return 'PROOF_RECEIVED';
      if (event === 'CANCEL') return 'CANCELLED';
      break;

    case 'UNDER_REVIEW':
      if (event === 'ADMIN_EXCEPTION_CONFIRM') return 'CONFIRMED';
      if (event === 'CANCEL') return 'CANCELLED';
      break;

    case 'CONFIRMED':
      // Final immutable state - cannot transition backwards without refund process
      return 'CONFIRMED';

    case 'EXPIRED':
    case 'CANCELLED':
      return current;
  }
  return current;
}
