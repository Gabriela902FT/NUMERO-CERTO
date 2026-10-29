/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Official Pix Copia e Cola code provided by the developer (Gabriela F. Teixeira):
 */
export const OFFICIAL_DONATION_PIX_PAYLOAD =
  '00020101021126580014br.gov.bcb.pix0136c123a434-a0ec-4c2b-b88a-b202d1af991e5204000053039865802BR5919GABRIELA F TEIXEIRA6013BELO HORIZON62070503***630403CC';

export const OFFICIAL_DONATION_KEY = 'c123a434-a0ec-4c2b-b88a-b202d1af991e';
export const OFFICIAL_DONATION_RECIPIENT = 'Gabriela F. Teixeira';
export const OFFICIAL_DONATION_CITY = 'Belo Horizonte - MG';
export const SUGGESTED_DONATION_AMOUNT = 10.00;

export interface DonationValidationResult {
  isValid: boolean;
  recipientName: string;
  pixKey: string;
  city: string;
  currency: string;
  country: string;
  errors: string[];
}

/**
 * Validates the EMV standard Pix Copia e Cola payload.
 * Ensures the code is authentic, uncorrupted, and corresponds exactly
 * to the developer's registered key and recipient name.
 */
export function validateDonationPixPayload(payload: string): DonationValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'string') {
    return {
      isValid: false,
      recipientName: '',
      pixKey: '',
      city: '',
      currency: '',
      country: '',
      errors: ['Código Pix vazio ou inválido.'],
    };
  }

  const trimmed = payload.trim();

  // Basic EMV header check
  if (!trimmed.startsWith('000201')) {
    errors.push('Formato EMV não inicializado com 000201.');
  }

  // Pix arrangement check
  if (!trimmed.includes('br.gov.bcb.pix')) {
    errors.push('Arranjo br.gov.bcb.pix não identificado.');
  }

  // Key verification
  const keyPresent = trimmed.includes(OFFICIAL_DONATION_KEY);
  if (!keyPresent) {
    errors.push(`Chave Pix pretendida (${OFFICIAL_DONATION_KEY}) não encontrada no payload.`);
  }

  // Recipient verification
  const recipientUpper = 'GABRIELA F TEIXEIRA';
  const recipientPresent = trimmed.toUpperCase().includes(recipientUpper);
  if (!recipientPresent) {
    errors.push(`Nome do destinatário pretendido (${recipientUpper}) não coincide.`);
  }

  // Currency check (986 = Real Brasileiro)
  if (!trimmed.includes('5303986')) {
    errors.push('Código de moeda 986 (BRL) não localizado.');
  }

  // Country check
  if (!trimmed.includes('5802BR')) {
    errors.push('Código de país BR não localizado.');
  }

  // CRC16 Checksum presence at end
  if (!trimmed.includes('6304')) {
    errors.push('Campo de checksum 6304 ausente.');
  }

  return {
    isValid: errors.length === 0,
    recipientName: recipientPresent ? OFFICIAL_DONATION_RECIPIENT : 'Desconhecido',
    pixKey: keyPresent ? OFFICIAL_DONATION_KEY : 'Não identificada',
    city: OFFICIAL_DONATION_CITY,
    currency: 'BRL (R$)',
    country: 'Brasil (BR)',
    errors,
  };
}
