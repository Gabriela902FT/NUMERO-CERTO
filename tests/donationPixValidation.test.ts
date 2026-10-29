/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OFFICIAL_DONATION_PIX_PAYLOAD,
  OFFICIAL_DONATION_KEY,
  OFFICIAL_DONATION_RECIPIENT,
  validateDonationPixPayload,
} from '../src/services/donationPixValidator';

function runDonationTests() {
  console.log('--- TESTANDO VALIDAÇÃO DO PIX DE DOAÇÃO VOLUNTÁRIA ---');
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

  // 1. Validar payload oficial
  const result = validateDonationPixPayload(OFFICIAL_DONATION_PIX_PAYLOAD);
  assert('Código Pix oficial é válido segundo formato EMV/BCB', result.isValid);
  assert('Destinatário confere com Gabriela F. Teixeira', result.recipientName === OFFICIAL_DONATION_RECIPIENT);
  assert('Chave Pix confere com a chave oficial', result.pixKey === OFFICIAL_DONATION_KEY);
  assert('Zero erros na validação do payload oficial', result.errors.length === 0);

  // 2. Testar rejeição de payload adulterado ou inválido
  const tamperedPayload = OFFICIAL_DONATION_PIX_PAYLOAD.replace('GABRIELA F TEIXEIRA', 'OUTRA PESSOA');
  const tamperedResult = validateDonationPixPayload(tamperedPayload);
  assert('Payload com destinatário adulterado é rejeitado', !tamperedResult.isValid && tamperedResult.errors.length > 0);

  const emptyResult = validateDonationPixPayload('');
  assert('Payload vazio é rejeitado', !emptyResult.isValid);

  console.log(`\nRESULTADOS DOS TESTES DE DOAÇÃO: ${passed} passaram, ${failed} falharam.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runDonationTests();
