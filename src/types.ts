/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemeMode = 'light' | 'dark';

export type ActiveSection = 
  | 'home' 
  | 'numbers' 
  | 'drafts' 
  | 'simulator' 
  | 'prize-eval'
  | 'organizer' 
  | 'rules' 
  | 'results'
  | 'transparency'
  | 'my-tickets';

export type TicketStatus = 'available' | 'reserved' | 'paid' | 'selected';

export interface Ticket {
  number: number;
  formattedNumber: string; // "001" to "1000"
  status: TicketStatus;
  buyerMasked?: string;
  reservedAt?: string;
}

export interface LotteryAction {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  totalNumbers: number;
  pricePerTicket: number;
  mainPrize: string;
  secondaryPrize?: string;
  drawDate: string;
  drawMethod: string;
  causeOrBeneficiary: string;
  organizerName: string;
  status: 'active' | 'drawn' | 'draft';
  reservedCount: number;
  paidCount: number;
}

export interface LotteryDraft {
  id: string;
  title: string;
  description: string;
  mainPrize: string;
  secondaryPrize: string;
  totalNumbers: number;
  pricePerTicket: number;
  drawDate: string;
  causeOrBeneficiary: string;
  rulesNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerProfile {
  entityType: 'pf' | 'pj';
  nameOrCorporate: string;
  document: string; // CPF or CNPJ
  street: string;
  cityState: string;
  zipCode: string;
  phone: string;
  email: string;
  registrationStatus: 'rascunho_local' | 'preenchido';
  identityStatus: 'nao_verificada';
  legalAuthorization: 'pendente_orgao_competente';
  termsAccepted: boolean;
  termsAcceptedAt?: string;
}

export interface TermsAcceptanceRecord {
  version: string;
  acceptedAt: string;
  type: 'organizador' | 'participante' | 'ambos';
}

export interface SimulationParams {
  totalTickets: number;
  pricePerTicket: number;
  estimatedPrizeCost: number;
  illustrativeFeePercent: number; // e.g. 7.5%
}

// -------------------------------------------------------------
// Financial & Payment Receiving Types (NumeroCerto Finance)
// -------------------------------------------------------------

export type PixKeyType = 'cpf_cnpj' | 'email' | 'phone' | 'random';
export type BankAccountType = 'corrente' | 'poupanca' | 'pagamento';
export type FinancialVerificationStatus = 
  | 'pendente_dados' 
  | 'em_analise_documental' 
  | 'aprovado_demonstrativo' 
  | 'rejeitado';

export type ReceivingHabilitationStatus = 
  | 'bloqueado_aguardando_analise' 
  | 'habilitado_modo_demonstracao' 
  | 'pendente_homologacao_psp';

export type PaymentMethodType = 'pix' | 'credit_card' | 'debit_card' | 'google_pay';

export type PaymentChargeStatus = 
  | 'pendente' 
  | 'aguardando_pagamento'
  | 'aprovado' 
  | 'liquidado' 
  | 'reembolsado' 
  | 'expirado';

export interface OrganizerFinancialProfile {
  holderNameOrCorporate: string;
  holderDocument: string; // CPF or CNPJ
  accountBeneficiaryName: string; // Nome do titular da conta de recebimento
  pixKeyType: PixKeyType;
  pixKey: string;
  bankName: string;
  bankCode: string;
  accountType: BankAccountType;
  agency: string;
  accountNumber: string;
  verificationStatus: FinancialVerificationStatus;
  receivingStatus: ReceivingHabilitationStatus;
  updatedAt: string;
  isMaskedInUI: boolean;
}

export interface PaymentMethodConfig {
  id: PaymentMethodType;
  name: string;
  description: string;
  isEnabled: boolean;
  settlementTerms: string; // e.g. "D+0 (Instantâneo no Pix)", "D+30 (Cartão)", "D+1 (Débito)"
  providerFeeRate: string; // e.g. "0.99%", "2.99% + R$ 0,40"
  status: 'ativo_demonstrativo' | 'pendente_contrato';
  allowedInDemo: boolean;
}

export type TransactionDirection = 'entrada' | 'saida';

export interface FinancialTransaction {
  id: string;
  chargeId: string;
  ticketNumbers: number[];
  buyerNameMasked: string;
  method: PaymentMethodType;
  flowType?: TransactionDirection; // 'entrada' | 'saida'
  description?: string;
  amountGross: number; // Valor bruto movimentado
  providerFee: number; // Taxa externa retida pelo provedor
  amountNet: number; // Valor creditado/debitado ao organizador
  status: PaymentChargeStatus;
  createdAt: string;
  settledAt?: string; // Data da efetiva liquidação bancária
  refundedAt?: string;
  endToEndId?: string; // Pix E2E ou ID da adquirente
}

export interface FinancialReconciliationSummary {
  approvedGrossTotal: number; // Total de pagamentos confirmados
  pendingSettlementTotal: number; // Valores aprovados aguardando liquidação bancária
  settledReceivedTotal: number; // Valores efetivamente liquidados e recebidos pelo organizador
  providerFeesTotal: number; // Taxas descontadas pelo provedor externo
  refundsTotal: number; // Valores reembolsados/estornados
  totalTransactions: number;
}

// -------------------------------------------------------------
// Purchase Request & Audit Trail Types (Requisitos Etapas A - D)
// -------------------------------------------------------------

export type PurchaseRequestStatus = 
  | 'PENDING_PAYMENT'
  | 'PROOF_RECEIVED'
  | 'PAYMENT_UNCONFIRMED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_INSUFFICIENT'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'CONTESTED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  reason: string;
  operator: string; // e.g. "Sistema Determinístico", "Auditoria Operacional", "Comprador"
  hash: string; // SHA-256 integrity simulation
}

export interface PurchaseRequest {
  id: string;
  ticketNumbers: number[];
  quantity: number;
  unitPrice: number;
  totalExpected: number; // Deterministic: quantity * unitPrice
  buyerNameMasked: string;
  buyerPhoneMasked?: string;
  status: PurchaseRequestStatus;
  organizerPixKey: string;
  organizerRecipientName: string;
  pixCopiaECola: string;
  createdAt: string;
  expiresAt: string; // Temporary reservation timeout (e.g. 15 minutes)
  proofImageBase64?: string;
  proofFileName?: string;
  declaredAmount?: number;
  aiAnalysisNotes?: string;
  confirmedAt?: string;
  auditLogs: AuditLogEntry[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'reservation' | 'draw' | 'contest' | 'security';
  timestamp: string;
  read: boolean;
  orderId?: string;
  linkSection?: ActiveSection;
}

export interface NotificationSettings {
  transactionsEnabled: boolean;
  reservationsEnabled: boolean;
  drawsEnabled: boolean;
  securityAlertsEnabled: boolean;
}

export interface DisputeReport {
  protocol: string;
  orderId?: string;
  category: 'divergencia_pagamento' | 'duvida_regulamento' | 'denuncia_irregularidade' | 'outro';
  contactMasked: string;
  description: string;
  status: 'recebido' | 'em_analise' | 'concluido';
  createdAt: string;
  responseNotes?: string;
}
