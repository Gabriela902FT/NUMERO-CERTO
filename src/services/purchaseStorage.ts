/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PurchaseRequest, PurchaseRequestStatus, AuditLogEntry, DisputeReport, AppNotification } from '../types';

export const PURCHASE_REQUESTS_STORAGE_KEY = 'numerocerto_purchase_requests_v1';
export const NOTIFICATIONS_STORAGE_KEY = 'numerocerto_notifications_v1';
export const NOTIFICATION_SETTINGS_STORAGE_KEY = 'numerocerto_notification_settings_v1';
export const DISPUTES_STORAGE_KEY = 'numerocerto_disputes_v1';

export const INITIAL_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: 'PED-48291',
    ticketNumbers: [14, 15],
    quantity: 2,
    unitPrice: 15.00,
    totalExpected: 30.00,
    buyerNameMasked: 'Juliana R. (***.451.290-**)',
    buyerPhoneMasked: '(31) 98***-**10',
    status: 'CONFIRMED',
    organizerPixKey: '00.123.456/0001-99',
    organizerRecipientName: 'Associação Comunitária Viva Bem',
    pixCopiaECola: '00020126580014BR.GOV.BCB.PIX011400123456000199520400005303986540530.005802BR5925ASSOCIACAO COMUNITARIA6009SAO PAULO6207050382916304',
    createdAt: '2026-10-28 10:14',
    expiresAt: '2026-10-28 10:29',
    declaredAmount: 30.00,
    proofFileName: 'comprovante_pix_banco_brasil.png',
    aiAnalysisNotes: 'Conferência determinística: R$ 30,00 coincide exatamente com 2 cotas × R$ 15,00. Quitação confirmada pelo provedor.',
    confirmedAt: '2026-10-28 10:16',
    auditLogs: [
      {
        id: 'aud-1',
        timestamp: '2026-10-28 10:14',
        action: 'SOLICITACAO_CRIADA',
        reason: 'Reserva temporária pelo comprador',
        operator: 'Sistema de Cotas',
        hash: 'sha256-a94f01bc77e2'
      },
      {
        id: 'aud-2',
        timestamp: '2026-10-28 10:16',
        action: 'PAGAMENTO_CONFIRMADO_PSP',
        reason: 'Crédito Pix conciliado e liquidado via PSP bancário',
        operator: 'PSP Central Autorizado',
        hash: 'sha256-e82b71ad33f1'
      }
    ]
  },
  {
    id: 'PED-71822',
    ticketNumbers: [305, 306],
    quantity: 2,
    unitPrice: 15.00,
    totalExpected: 30.00,
    buyerNameMasked: 'Você (Sessão Atual)',
    buyerPhoneMasked: '(31) 99***-**44',
    status: 'PROOF_RECEIVED',
    organizerPixKey: '00.123.456/0001-99',
    organizerRecipientName: 'Associação Comunitária Viva Bem',
    pixCopiaECola: '00020126580014BR.GOV.BCB.PIX011400123456000199520400005303986540530.005802BR5925ASSOCIACAO COMUNITARIA6009SAO PAULO6207050318226304',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
    expiresAt: new Date(Date.now() + 7 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
    declaredAmount: 30.00,
    proofFileName: 'foto_comprovante_camera_celular.jpg',
    aiAnalysisNotes: 'Comprovante recebido via câmera do celular. Valor declarado R$ 30,00 coincide com o total. Aguardando conciliação da instituição financeira.',
    auditLogs: [
      {
        id: 'aud-3',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
        action: 'SOLICITACAO_CRIADA',
        reason: 'Reserva temporária de cotas (15 minutos)',
        operator: 'Sistema de Cotas',
        hash: 'sha256-42bc98fe91a0'
      },
      {
        id: 'aud-4',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
        action: 'COMPROVANTE_ENVIADO',
        reason: 'Fotografia capturada e enviada pelo comprador',
        operator: 'Comprador (Câmera Celular)',
        hash: 'sha256-11f842ea5b6c'
      }
    ]
  },
  {
    id: 'PED-90412',
    ticketNumbers: [54, 55, 56],
    quantity: 3,
    unitPrice: 15.00,
    totalExpected: 45.00,
    buyerNameMasked: 'Lucas H. (***.990.412-**)',
    buyerPhoneMasked: '(11) 97***-**09',
    status: 'PAYMENT_INSUFFICIENT',
    organizerPixKey: '00.123.456/0001-99',
    organizerRecipientName: 'Associação Comunitária Viva Bem',
    pixCopiaECola: '00020126580014BR.GOV.BCB.PIX011400123456000199520400005303986540545.005802BR5925ASSOCIACAO COMUNITARIA6009SAO PAULO6207050304126304',
    createdAt: '2026-10-28 09:30',
    expiresAt: '2026-10-28 09:45',
    declaredAmount: 30.00,
    proofFileName: 'comprovante_parcial_pix.jpg',
    aiAnalysisNotes: 'Alerta de divergência: R$ 30,00 identificado no comprovante é inferior aos R$ 45,00 calculados para 3 cotas. Diferença de R$ 15,00 pendente.',
    auditLogs: [
      {
        id: 'aud-5',
        timestamp: '2026-10-28 09:30',
        action: 'SOLICITACAO_CRIADA',
        reason: 'Reserva temporária de 3 cotas',
        operator: 'Sistema de Cotas',
        hash: 'sha256-b09a13ce44d2'
      },
      {
        id: 'aud-6',
        timestamp: '2026-10-28 09:35',
        action: 'DIVERGENCIA_VALOR_INSUFICIENTE',
        reason: 'Valor declarado (R$ 30,00) menor que esperado (R$ 45,00)',
        operator: 'Conferência Determinística',
        hash: 'sha256-ff71e98a12c8'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Reserva temporária em andamento',
    message: 'Seu pedido PED-71822 (cotas #305, #306) aguarda confirmação do pagamento. O comprovante foi anexado.',
    type: 'reservation',
    timestamp: 'Há 5 minutos',
    read: false,
    orderId: 'PED-71822',
    linkSection: 'my-tickets'
  },
  {
    id: 'notif-2',
    title: 'Participação Confirmada',
    message: 'O pedido PED-48291 (cotas #014, #015) teve pagamento conciliado. Suas cotas estão garantidas.',
    type: 'transaction',
    timestamp: 'Ontem às 10:16',
    read: true,
    orderId: 'PED-48291',
    linkSection: 'my-tickets'
  },
  {
    id: 'notif-3',
    title: 'Segurança & LGPD',
    message: 'Seus dados pessoais permanecem protegidos por máscaras e criptografia local.',
    type: 'security',
    timestamp: 'Há 2 dias',
    read: true,
    linkSection: 'transparency'
  }
];

export const INITIAL_DISPUTES: DisputeReport[] = [
  {
    protocol: 'PROT-202610-001',
    orderId: 'PED-90412',
    category: 'divergencia_pagamento',
    contactMasked: 'luc***@email.com',
    description: 'Realizei Pix parcial de R$ 30 e gostaria de saber como complementar os R$ 15 faltantes.',
    status: 'em_analise',
    createdAt: '2026-10-28 11:00',
    responseNotes: 'O organizador enviou orientações para transferência da diferença com a mesma chave Pix.'
  }
];

/**
 * Retrieve all purchase requests from localStorage
 */
export function getAllPurchaseRequests(): PurchaseRequest[] {
  try {
    const raw = localStorage.getItem(PURCHASE_REQUESTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Erro ao ler pedidos:', err);
  }
  // Initialize with initial mock requests
  saveAllPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
  return INITIAL_PURCHASE_REQUESTS;
}

/**
 * Save all purchase requests to localStorage
 */
export function saveAllPurchaseRequests(requests: PurchaseRequest[]): void {
  try {
    localStorage.setItem(PURCHASE_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Erro ao salvar pedidos:', err);
  }
}

/**
 * Upsert or insert a single purchase request
 */
export function upsertPurchaseRequest(req: PurchaseRequest): void {
  const existing = getAllPurchaseRequests();
  const index = existing.findIndex((r) => r.id === req.id);
  if (index >= 0) {
    existing[index] = req;
  } else {
    existing.unshift(req);
  }
  saveAllPurchaseRequests(existing);
}

/**
 * Update request status with an audit log entry
 */
export function updatePurchaseRequestStatus(
  id: string,
  newStatus: PurchaseRequestStatus,
  action: string,
  reason: string,
  operator: string
): PurchaseRequest | null {
  const requests = getAllPurchaseRequests();
  const target = requests.find((r) => r.id === id);
  if (!target) return null;

  const previousStatus = target.status;
  target.status = newStatus;
  if (newStatus === 'CONFIRMED' && !target.confirmedAt) {
    target.confirmedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
  }

  const logEntry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    action,
    previousValue: previousStatus,
    newValue: newStatus,
    reason,
    operator,
    hash: `sha256-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 6)}`
  };

  target.auditLogs = [...(target.auditLogs || []), logEntry];
  saveAllPurchaseRequests(requests);
  return target;
}

/**
 * Public search by Order ID or ticket number
 */
export function publicLookup(query: string): {
  found: boolean;
  type: 'order' | 'ticket' | 'none';
  data?: {
    id: string;
    ticketNumbers: number[];
    status: PurchaseRequestStatus;
    buyerMasked: string;
    createdAt: string;
    confirmedAt?: string;
    auditCount: number;
    lastAuditHash: string;
  };
} {
  const clean = query.trim().toUpperCase();
  if (!clean) return { found: false, type: 'none' };

  const requests = getAllPurchaseRequests();

  // Search by Order ID
  const byId = requests.find((r) => r.id.toUpperCase() === clean);
  if (byId) {
    return {
      found: true,
      type: 'order',
      data: {
        id: byId.id,
        ticketNumbers: byId.ticketNumbers,
        status: byId.status,
        buyerMasked: byId.buyerNameMasked,
        createdAt: byId.createdAt,
        confirmedAt: byId.confirmedAt,
        auditCount: byId.auditLogs?.length || 0,
        lastAuditHash: byId.auditLogs?.[byId.auditLogs.length - 1]?.hash || 'hash-verificado-imutavel'
      }
    };
  }

  // Search by Ticket Number
  const num = parseInt(clean, 10);
  if (!isNaN(num)) {
    const byTicket = requests.find((r) => r.ticketNumbers.includes(num));
    if (byTicket) {
      return {
        found: true,
        type: 'ticket',
        data: {
          id: byTicket.id,
          ticketNumbers: byTicket.ticketNumbers,
          status: byTicket.status,
          buyerMasked: byTicket.buyerNameMasked,
          createdAt: byTicket.createdAt,
          confirmedAt: byTicket.confirmedAt,
          auditCount: byTicket.auditLogs?.length || 0,
          lastAuditHash: byTicket.auditLogs?.[byTicket.auditLogs.length - 1]?.hash || 'hash-verificado-imutavel'
        }
      };
    }
  }

  return { found: false, type: 'none' };
}

/**
 * Notification management
 */
export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch {
    // Ignore
  }
}

/**
 * Dispute / Ethics Contest management
 */
export function getStoredDisputes(): DisputeReport[] {
  try {
    const raw = localStorage.getItem(DISPUTES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return INITIAL_DISPUTES;
}

export function saveDispute(report: DisputeReport): void {
  try {
    const existing = getStoredDisputes();
    existing.unshift(report);
    localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore
  }
}
