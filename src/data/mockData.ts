/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LotteryAction, LotteryDraft, Ticket } from '../types';

export const APP_LOGO_SRC = '/assets/aistudio/file_000000008a48820eba4e19f74fd16469_bef1bd6f.png';

export const DEMO_ACTION: LotteryAction = {
  id: 'action-solidaria-2026',
  title: 'Ação Solidária: Espaço Maker & Quadra Esportiva',
  subtitle: 'Campanha beneficente em prol da Associação Comunitária Estrela do Amanhã',
  description: 'Demonstração de distribuição transparente de cotas numeradas de 001 a 1000. O valor arrecadado é destinado à aquisição de equipamentos pedagógicos e melhorias estruturais.',
  totalNumbers: 1000,
  pricePerTicket: 15.00,
  mainPrize: 'Bicicleta Elétrica Caloi E-Vibe ou R$ 5.000,00 via PIX',
  secondaryPrize: 'Smart TV 50" 4K UHD para o 2º maior adquirente',
  drawDate: '28 de Novembro de 2026, às 19:00',
  drawMethod: 'Loteria Federal do Brasil — 1º Prêmio (utilizam-se os 3 últimos dígitos da milhar sorteada)',
  causeOrBeneficiary: 'Associação Comunitária Estrela do Amanhã (CNPJ Fictício: 00.123.456/0001-99)',
  organizerName: 'Comissão Comunitária de Apoio Social',
  status: 'active',
  reservedCount: 428,
  paidCount: 214,
};

// Generates initial 1000 tickets with deterministic demonstration distribution
export function generateInitialTickets(): Ticket[] {
  const tickets: Ticket[] = [];

  for (let i = 1; i <= 1000; i++) {
    const formattedNumber = i.toString().padStart(3, '0');
    
    // Deterministic distribution for demonstration
    // ~20% paid, ~30% reserved, ~50% available
    let status: Ticket['status'] = 'available';
    let buyerMasked: string | undefined = undefined;

    if (i % 5 === 0) {
      status = 'paid';
      const names = ['Carlos M.', 'Fernanda S.', 'Eduardo P.', 'Juliana R.', 'Marcos V.', 'Beatriz L.'];
      buyerMasked = `${names[i % names.length]} (***.${(i * 17) % 900 + 100}-**)`;
    } else if (i % 3 === 0) {
      status = 'reserved';
      const names = ['Renata B.', 'Lucas G.', 'Amanda T.', 'Gustavo A.', 'Larissa C.', 'Rafael K.'];
      buyerMasked = `${names[i % names.length]} (***.${(i * 13) % 900 + 100}-**)`;
    }

    tickets.push({
      number: i,
      formattedNumber,
      status,
      buyerMasked,
      reservedAt: status !== 'available' ? '2026-10-25 14:32' : undefined,
    });
  }

  return tickets;
}

export const INITIAL_DRAFTS: LotteryDraft[] = [
  {
    id: 'draft-festa-junina',
    title: 'Rifa Beneficente do Centro Comunitário',
    description: 'Rascunho de sorteio local para cobrir custos de reformas elétricas da sede comunitária.',
    mainPrize: 'Cesta Gourmet Premium Especial',
    secondaryPrize: 'Vale Compras R$ 500 no Supermercado Local',
    totalNumbers: 500,
    pricePerTicket: 10.00,
    drawDate: '2026-12-12',
    causeOrBeneficiary: 'Centro Social Esperança',
    rulesNotes: 'Sorteio previsto com base na extração de sábado da Loteria Federal.',
    createdAt: '2026-10-20T10:15:00Z',
    updatedAt: '2026-10-22T16:40:00Z',
  },
  {
    id: 'draft-cirurgia-pet',
    title: 'Apoio Cirúrgico: Abrigo Patinhas Amigas',
    description: 'Campanha de arrecadação para procedimentos veterinários e ração de cães resgatados.',
    mainPrize: 'Kit Eletroportáteis Cozinha Completa',
    secondaryPrize: 'Air Fryer Digital 4L',
    totalNumbers: 250,
    pricePerTicket: 20.00,
    drawDate: '2026-11-20',
    causeOrBeneficiary: 'ONG Patinhas Amigas',
    rulesNotes: 'Prestação de contas obrigatória com notas fiscais veterinárias antes da entrega do prêmio.',
    createdAt: '2026-10-24T09:00:00Z',
    updatedAt: '2026-10-26T11:20:00Z',
  }
];

export const DEMO_PAST_RESULTS = [
  {
    id: 'res-01',
    edition: 'Edição 03 — Campanha Inverno Solidário',
    date: '15 de Julho de 2026',
    winningNumber: '427',
    winnerMasked: 'Mariana C. (***.451.890-**)',
    prizeDelivered: 'Notebook Dell Inspiron 15',
    federalLotteryContest: 'Concurso Federal nº 5.892 (1º Prêmio: 84.427)',
    auditStatus: 'Prestação de Contas Homologada',
  },
  {
    id: 'res-02',
    edition: 'Edição 02 — Reforma da Biblioteca Infantil',
    date: '10 de Abril de 2026',
    winningNumber: '089',
    winnerMasked: 'Rodrigo S. (***.112.983-**)',
    prizeDelivered: 'Smartphone Samsung Galaxy S23',
    federalLotteryContest: 'Concurso Federal nº 5.864 (1º Prêmio: 32.089)',
    auditStatus: 'Prestação de Contas Homologada',
  }
];

// -------------------------------------------------------------
// Financial Mock Data & Config
// -------------------------------------------------------------

import { 
  OrganizerFinancialProfile, 
  PaymentMethodConfig, 
  FinancialTransaction, 
  FinancialReconciliationSummary 
} from '../types';

export const DEFAULT_FINANCIAL_PROFILE: OrganizerFinancialProfile = {
  holderNameOrCorporate: 'Comissão Comunitária de Apoio Social',
  holderDocument: '00.123.456/0001-99',
  accountBeneficiaryName: 'Associação Comunitária Estrela do Amanhã',
  pixKeyType: 'cpf_cnpj',
  pixKey: '00.123.456/0001-99',
  bankName: 'Banco do Brasil S.A.',
  bankCode: '001',
  accountType: 'corrente',
  agency: '1234-5',
  accountNumber: '98765-4',
  verificationStatus: 'aprovado_demonstrativo',
  receivingStatus: 'habilitado_modo_demonstracao',
  updatedAt: '2026-10-26T14:30:00Z',
  isMaskedInUI: true,
};

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'pix',
    name: 'Pix Instantâneo (PSP Central)',
    description: 'Recebimento direto via arranjo do Banco Central do Brasil. Destino na conta vinculada.',
    isEnabled: true,
    settlementTerms: 'D+0 (Liquidação em tempo real)',
    providerFeeRate: '0,99% por transação (Tarifa Externa)',
    status: 'ativo_demonstrativo',
    allowedInDemo: true,
  },
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    description: 'Processamento via adquirente homologada com tokenização PCI-DSS e antifraude.',
    isEnabled: true,
    settlementTerms: 'D+30 (Liquidação padrão) ou D+14 com taxa de antecipação',
    providerFeeRate: '2,99% + R$ 0,40 por transação',
    status: 'ativo_demonstrativo',
    allowedInDemo: true,
  },
  {
    id: 'debit_card',
    name: 'Cartão de Débito',
    description: 'Débito online com autenticação 3D-Secure bancária.',
    isEnabled: true,
    settlementTerms: 'D+1 dia útil',
    providerFeeRate: '1,79% por transação',
    status: 'ativo_demonstrativo',
    allowedInDemo: true,
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    description: 'Carteira digital com autenticação biométrica do dispositivo e cartão tokenizado.',
    isEnabled: true,
    settlementTerms: 'D+30 (Seguindo a liquidação do cartão emissor)',
    providerFeeRate: '2,99% + R$ 0,40 por transação',
    status: 'ativo_demonstrativo',
    allowedInDemo: true,
  },
];

export const INITIAL_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-1001',
    chargeId: 'ch_pix_8921a',
    ticketNumbers: [14, 15],
    buyerNameMasked: 'Juliana R. (***.451.290-**)',
    method: 'pix',
    flowType: 'entrada',
    description: 'Venda de Cotas #014, #015 via Pix Instantâneo',
    amountGross: 30.00,
    providerFee: 0.30, // 0.99% aprox
    amountNet: 29.70,
    status: 'liquidado',
    createdAt: '2026-10-27 10:14',
    settledAt: '2026-10-27 10:15',
    endToEndId: 'E00123456202610271014aBcDeFg',
  },
  {
    id: 'tx-1002',
    chargeId: 'ch_card_7712b',
    ticketNumbers: [120, 121, 122],
    buyerNameMasked: 'Carlos M. (***.882.114-**)',
    method: 'credit_card',
    flowType: 'entrada',
    description: 'Venda de Cotas #120, #121, #122 via Cartão de Crédito',
    amountGross: 45.00,
    providerFee: 1.75, // 2.99% + 0.40
    amountNet: 43.25,
    status: 'aprovado', // Aprovado, pendente de liquidação D+30
    createdAt: '2026-10-27 15:20',
  },
  {
    id: 'tx-1003',
    chargeId: 'ch_pix_6619w',
    ticketNumbers: [305, 306],
    buyerNameMasked: 'Rodrigo T. (***.523.881-**)',
    method: 'pix',
    flowType: 'entrada',
    description: 'Reserva de Cotas #305, #306 (QR Code Pix Gerado)',
    amountGross: 30.00,
    providerFee: 0.30,
    amountNet: 29.70,
    status: 'aguardando_pagamento',
    createdAt: '2026-10-27 17:05',
    endToEndId: 'E00123456202610271705qRsTuVw',
  },
  {
    id: 'tx-1004',
    chargeId: 'ch_gpay_3391c',
    ticketNumbers: [450],
    buyerNameMasked: 'Fernanda S. (***.319.442-**)',
    method: 'google_pay',
    flowType: 'entrada',
    description: 'Venda de Cota #450 via Google Pay',
    amountGross: 15.00,
    providerFee: 0.85,
    amountNet: 14.15,
    status: 'aprovado', // Pendente de liquidação
    createdAt: '2026-10-27 18:42',
  },
  {
    id: 'tx-1005',
    chargeId: 'ch_pix_5510d',
    ticketNumbers: [88, 89],
    buyerNameMasked: 'Marcos V. (***.901.773-**)',
    method: 'pix',
    flowType: 'entrada',
    description: 'Venda de Cotas #088, #089 via Pix Instantâneo',
    amountGross: 30.00,
    providerFee: 0.30,
    amountNet: 29.70,
    status: 'liquidado',
    createdAt: '2026-10-26 11:05',
    settledAt: '2026-10-26 11:06',
    endToEndId: 'E00123456202610261105xYzWvUt',
  },
  {
    id: 'tx-1006',
    chargeId: 'ch_deb_1120e',
    ticketNumbers: [602],
    buyerNameMasked: 'Beatriz L. (***.624.110-**)',
    method: 'debit_card',
    flowType: 'entrada',
    description: 'Venda de Cota #602 via Cartão de Débito',
    amountGross: 15.00,
    providerFee: 0.27,
    amountNet: 14.73,
    status: 'liquidado',
    createdAt: '2026-10-25 14:10',
    settledAt: '2026-10-26 09:00',
  },
  {
    id: 'tx-1007',
    chargeId: 'ch_pix_9901f',
    ticketNumbers: [710],
    buyerNameMasked: 'Eduardo P. (***.112.559-**)',
    method: 'pix',
    flowType: 'saida',
    description: 'Estorno de Cota #710 por desistência voluntária do participante',
    amountGross: 15.00,
    providerFee: 0.30,
    amountNet: 15.00,
    status: 'reembolsado',
    createdAt: '2026-10-24 16:30',
    refundedAt: '2026-10-24 17:10',
    endToEndId: 'E00123456202610241630ReFuNd',
  },
  {
    id: 'tx-1008',
    chargeId: 'ch_card_4421x',
    ticketNumbers: [912],
    buyerNameMasked: 'Mariana K. (***.774.201-**)',
    method: 'credit_card',
    flowType: 'saida',
    description: 'Reembolso por cancelamento de pedido #912',
    amountGross: 15.00,
    providerFee: 0.40,
    amountNet: 15.00,
    status: 'reembolsado',
    createdAt: '2026-10-23 09:15',
    refundedAt: '2026-10-23 10:00',
  },
  {
    id: 'tx-1009',
    chargeId: 'ch_pix_3388p',
    ticketNumbers: [54, 55, 56],
    buyerNameMasked: 'Lucas H. (***.990.412-**)',
    method: 'pix',
    flowType: 'entrada',
    description: 'Reserva de Cotas #054, #055, #056 (Pix Emitido)',
    amountGross: 45.00,
    providerFee: 0.45,
    amountNet: 44.55,
    status: 'aguardando_pagamento',
    createdAt: '2026-10-27 19:10',
  },
];

export function computeFinancialReconciliation(transactions: FinancialTransaction[]): FinancialReconciliationSummary {
  let approvedGrossTotal = 0;
  let pendingSettlementTotal = 0;
  let settledReceivedTotal = 0;
  let providerFeesTotal = 0;
  let refundsTotal = 0;

  for (const tx of transactions) {
    if (tx.status === 'reembolsado' || tx.flowType === 'saida') {
      refundsTotal += tx.amountGross;
      continue;
    }

    if (tx.status === 'liquidado') {
      settledReceivedTotal += tx.amountNet;
      approvedGrossTotal += tx.amountGross;
      providerFeesTotal += tx.providerFee;
    } else if (tx.status === 'aprovado') {
      pendingSettlementTotal += tx.amountNet;
      approvedGrossTotal += tx.amountGross;
      providerFeesTotal += tx.providerFee;
    }
    // 'aguardando_pagamento' or 'pendente' are awaiting payment
  }

  return {
    approvedGrossTotal,
    pendingSettlementTotal,
    settledReceivedTotal,
    providerFeesTotal,
    refundsTotal,
    totalTransactions: transactions.length,
  };
}

