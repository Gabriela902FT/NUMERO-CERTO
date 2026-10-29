/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  calculateExpectedTotal,
  evaluatePaymentSufficiency,
  checkTicketConcurrency,
  isReservationExpired,
  transitionPurchaseStatus,
} from '../src/services/purchaseEngine';

function runTests() {
  console.log('--- INICIANDO SUÍTE DE TESTES DETERMINÍSTICOS NUMEROCERTO ---');
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Test Deterministic Calculation: Quantidade × Preço Unitário
  const total1 = calculateExpectedTotal(3, 10.0);
  assert('Cálculo 3 cotas × R$ 10,00 = R$ 30,00', total1 === 30.0);

  const total2 = calculateExpectedTotal(5, 15.5);
  assert('Cálculo 5 cotas × R$ 15,50 = R$ 77,50', total2 === 77.5);

  // 2. Test Payment Sufficiency
  const suf1 = evaluatePaymentSufficiency(30.0, 30.0);
  assert('Pagamento exato R$ 30,00 é suficiente', suf1.isSufficient && suf1.status === 'SUFFICIENT');

  const suf2 = evaluatePaymentSufficiency(30.0, 20.0);
  assert('Pagamento parcial R$ 20,00 de R$ 30,00 é insuficiente', !suf2.isSufficient && suf2.status === 'INSUFFICIENT' && suf2.difference === 10.0);

  // 3. Test Ticket Concurrency & Collision Check
  const assigned = new Set([10, 20, 30]);
  const reqConflict = checkTicketConcurrency([5, 10, 15], assigned);
  assert('Detecta conflito de cotas já atribuídas (#10)', reqConflict.hasConflict && reqConflict.conflictingTickets.includes(10));

  const reqAvailable = checkTicketConcurrency([1, 2, 3], assigned);
  assert('Sem conflito para cotas livres (#1, #2, #3)', !reqAvailable.hasConflict && reqAvailable.conflictingTickets.length === 0);

  // 4. Test Reservation Expiration
  const now = 1000000;
  const expired = isReservationExpired(now - 16 * 60 * 1000, 15 * 60 * 1000, now);
  assert('Reserva após 16 minutos está expirada (>15 min)', expired === true);

  const active = isReservationExpired(now - 10 * 60 * 1000, 15 * 60 * 1000, now);
  assert('Reserva com 10 minutos continua válida (<15 min)', active === false);

  // 5. Test State Transitions
  let status = transitionPurchaseStatus('PENDING_PAYMENT', 'SUBMIT_PROOF');
  assert('Transição PENDING_PAYMENT -> PROOF_RECEIVED após envio de comprovante', status === 'PROOF_RECEIVED');

  status = transitionPurchaseStatus('PROOF_RECEIVED', 'PSP_PAYMENT_CONFIRMED');
  assert('Transição PROOF_RECEIVED -> CONFIRMED após webhook do PSP', status === 'CONFIRMED');

  const underpaid = transitionPurchaseStatus('PENDING_PAYMENT', 'PAYMENT_UNDERPAID');
  assert('Transição PENDING_PAYMENT -> PAYMENT_INSUFFICIENT', underpaid === 'PAYMENT_INSUFFICIENT');

  console.log(`\nRESULTADOS: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
