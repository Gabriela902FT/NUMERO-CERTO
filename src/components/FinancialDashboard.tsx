/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  OrganizerFinancialProfile, 
  PixKeyType, 
  BankAccountType, 
  FinancialVerificationStatus, 
  ReceivingHabilitationStatus,
  FinancialTransaction,
  PurchaseRequest,
  PurchaseRequestStatus
} from '../types';
import { 
  DEFAULT_FINANCIAL_PROFILE, 
  INITIAL_FINANCIAL_TRANSACTIONS, 
  computeFinancialReconciliation 
} from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { OrganizerPurchaseRequests } from './OrganizerPurchaseRequests';
import { 
  Wallet, 
  Building, 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff, 
  Info, 
  ArrowUpRight, 
  ArrowDownLeft,
  RefreshCw,
  Sparkles,
  BadgeAlert,
  FileText,
  FileCheck,
  Check,
  XCircle,
  UploadCloud,
  Layers,
  ArrowRight,
  Search,
  Filter,
  Download,
  RotateCcw,
  PlusCircle,
  CreditCard,
  DollarSign,
  X,
  History
} from 'lucide-react';

const FINANCIAL_DASHBOARD_STORAGE_KEY = 'numerocerto_financial_dashboard_v1';
const TRANSACTIONS_STORAGE_KEY = 'numerocerto_transactions_v1';

// Helper to determine receiving status based on verification status
export const getReceivingStatusForVerification = (verStatus: FinancialVerificationStatus): ReceivingHabilitationStatus => {
  switch (verStatus) {
    case 'aprovado_demonstrativo':
      return 'habilitado_modo_demonstracao';
    case 'em_analise_documental':
      return 'pendente_homologacao_psp';
    case 'pendente_dados':
    case 'rejeitado':
    default:
      return 'bloqueado_aguardando_analise';
  }
};

export const FinancialDashboard: React.FC = () => {
  const { toast } = useToast();

  // Financial profile state with localStorage persistence
  const [profile, setProfile] = useState<OrganizerFinancialProfile>(() => {
    try {
      const saved = localStorage.getItem(FINANCIAL_DASHBOARD_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_FINANCIAL_PROFILE;
  });

  // Simulated document checklist state
  const [simulatedDocuments, setSimulatedDocuments] = useState({
    identityDoc: profile.verificationStatus === 'aprovado_demonstrativo',
    proofOfAddress: profile.verificationStatus === 'aprovado_demonstrativo',
    bankingProof: profile.verificationStatus === 'aprovado_demonstrativo',
  });

  // Demonstrative transactions
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_FINANCIAL_TRANSACTIONS;
  });

  const [activeSubTab, setActiveSubTab] = useState<'recebimento_pix' | 'solicitacoes' | 'historico' | 'status' | 'conciliacao'>('recebimento_pix');

  // Purchase requests state with localStorage persistence
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    try {
      const saved = localStorage.getItem('numerocerto_purchase_requests_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [
      {
        id: 'PED-48291',
        ticketNumbers: [14, 15],
        quantity: 2,
        unitPrice: 15.00,
        totalExpected: 30.00,
        buyerNameMasked: 'Juliana R. (***.451.290-**)',
        buyerPhoneMasked: '(31) 98***-**10',
        status: 'PAYMENT_CONFIRMED' as PurchaseRequestStatus,
        organizerPixKey: profile.pixKey || '00.123.456/0001-99',
        organizerRecipientName: profile.accountBeneficiaryName || 'Associação Comunitária',
        pixCopiaECola: '00020126580014BR.GOV.BCB.PIX...',
        createdAt: '2026-10-28 10:14',
        expiresAt: '2026-10-28 10:29',
        declaredAmount: 30.00,
        proofFileName: 'comprovante_pix_banco_brasil.png',
        aiAnalysisNotes: 'Conferência determinística: R$ 30,00 coincide com o esperado (2 cotas × R$ 15,00).',
        confirmedAt: '2026-10-28 10:16',
        auditLogs: [
          {
            id: 'aud-1',
            timestamp: '2026-10-28 10:14',
            action: 'SOLICITACAO_CRIADA',
            reason: 'Reserva temporária pelo comprador',
            operator: 'Sistema de Grade',
            hash: 'sha256-a94f01bc'
          },
          {
            id: 'aud-2',
            timestamp: '2026-10-28 10:16',
            action: 'CONFIRMACAO_BANCARIA',
            reason: 'Crédito Pix conciliado via PSP',
            operator: 'PSP Central Autorizado',
            hash: 'sha256-e82b71ad'
          }
        ]
      },
      {
        id: 'PED-71822',
        ticketNumbers: [305, 306],
        quantity: 2,
        unitPrice: 15.00,
        totalExpected: 30.00,
        buyerNameMasked: 'Rodrigo T. (***.523.881-**)',
        buyerPhoneMasked: '(31) 99***-**44',
        status: 'PROOF_RECEIVED' as PurchaseRequestStatus,
        organizerPixKey: profile.pixKey || '00.123.456/0001-99',
        organizerRecipientName: profile.accountBeneficiaryName || 'Associação Comunitária',
        pixCopiaECola: '00020126580014BR.GOV.BCB.PIX...',
        createdAt: '2026-10-28 17:05',
        expiresAt: '2026-10-28 17:20',
        declaredAmount: 30.00,
        proofFileName: 'recibo_pix_nubank.jpg',
        aiAnalysisNotes: 'Comprovante recebido. Aguardando confirmação do pagamento bancário para homologação definitiva.',
        auditLogs: [
          {
            id: 'aud-3',
            timestamp: '2026-10-28 17:05',
            action: 'SOLICITACAO_CRIADA',
            reason: 'Reserva temporária',
            operator: 'Sistema de Grade',
            hash: 'sha256-42bc98fe'
          },
          {
            id: 'aud-4',
            timestamp: '2026-10-28 17:08',
            action: 'COMPROVANTE_ENVIADO',
            reason: 'Foto enviada pelo comprador via câmera do celular',
            operator: 'Comprador (via WebRTC)',
            hash: 'sha256-11f842ea'
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
        status: 'PAYMENT_INSUFFICIENT' as PurchaseRequestStatus,
        organizerPixKey: profile.pixKey || '00.123.456/0001-99',
        organizerRecipientName: profile.accountBeneficiaryName || 'Associação Comunitária',
        pixCopiaECola: '00020126580014BR.GOV.BCB.PIX...',
        createdAt: '2026-10-28 19:10',
        expiresAt: '2026-10-28 19:25',
        declaredAmount: 30.00,
        proofFileName: 'pix_parcial_itau.png',
        aiAnalysisNotes: 'Divergência: Esperado R$ 45,00 (3 cotas × R$ 15,00), mas comprovante indica R$ 30,00. Faltam R$ 15,00.',
        auditLogs: [
          {
            id: 'aud-5',
            timestamp: '2026-10-28 19:10',
            action: 'SOLICITACAO_CRIADA',
            reason: 'Reserva temporária',
            operator: 'Sistema de Grade',
            hash: 'sha256-55bc32ad'
          },
          {
            id: 'aud-6',
            timestamp: '2026-10-28 19:13',
            action: 'PAGAMENTO_INSUFICIENTE',
            reason: 'Valor declarado inferior ao total determinístico',
            operator: 'Motor Determinístico',
            hash: 'sha256-77ae41dd'
          }
        ]
      }
    ];
  });

  // Save purchase requests locally
  useEffect(() => {
    try {
      localStorage.setItem('numerocerto_purchase_requests_v1', JSON.stringify(purchaseRequests));
    } catch {
      // Ignore
    }
  }, [purchaseRequests]);

  // Filters and inspection state for transaction history table
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'liquidado' | 'aguardando_pagamento' | 'reembolsado' | 'aprovado'>('todos');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [selectedTxForModal, setSelectedTxForModal] = useState<FinancialTransaction | null>(null);

  // Save changes locally
  useEffect(() => {
    try {
      localStorage.setItem(FINANCIAL_DASHBOARD_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Ignore
    }
  }, [transactions]);

  // Simulation handlers for demonstrative transactions
  const handleSimulatePixInflow = () => {
    const randomTicket = Math.floor(Math.random() * 900) + 100;
    const secondTicket = randomTicket + 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randSuffix = Math.random().toString(36).substring(2, 7);

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      chargeId: `ch_pix_${randSuffix}`,
      ticketNumbers: [randomTicket, secondTicket],
      buyerNameMasked: `Participante Demo (***.${Math.floor(Math.random()*899+100)}.${Math.floor(Math.random()*899+100)}-**)`,
      method: 'pix',
      flowType: 'entrada',
      description: `Venda simulada de Cotas #${randomTicket}, #${secondTicket} via Pix`,
      amountGross: 30.00,
      providerFee: 0.30,
      amountNet: 29.70,
      status: 'liquidado',
      createdAt: formattedDate,
      settledAt: formattedDate,
      endToEndId: `E00123456${now.getFullYear()}${String(now.getMonth()+1).padStart(2, '0')}${randSuffix}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success('Recebimento Pix demonstrativo liquidado em D+0 (+ R$ 29,70 líquido)!', 'Simulação Financeira');
  };

  const handleSimulatePendingPix = () => {
    const randomTicket = Math.floor(Math.random() * 900) + 100;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randSuffix = Math.random().toString(36).substring(2, 7);

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      chargeId: `ch_pix_pend_${randSuffix}`,
      ticketNumbers: [randomTicket],
      buyerNameMasked: `Participante Pendente (***.${Math.floor(Math.random()*899+100)}.${Math.floor(Math.random()*899+100)}-**)`,
      method: 'pix',
      flowType: 'entrada',
      description: `Cobrança Pix gerada para Cota #${randomTicket} (Aguardando Pagamento)`,
      amountGross: 15.00,
      providerFee: 0.15,
      amountNet: 14.85,
      status: 'aguardando_pagamento',
      createdAt: formattedDate,
      endToEndId: `E00123456${now.getFullYear()}${String(now.getMonth()+1).padStart(2, '0')}${randSuffix}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.info('Cobrança Pix emitida. Status registrado: Aguardando Pagamento.', 'Simulação Financeira');
  };

  const handleSimulateRefundOutflow = () => {
    const randomTicket = Math.floor(Math.random() * 900) + 100;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randSuffix = Math.random().toString(36).substring(2, 7);

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      chargeId: `ch_ref_${randSuffix}`,
      ticketNumbers: [randomTicket],
      buyerNameMasked: `Comprador Reembolsado (***.${Math.floor(Math.random()*899+100)}.${Math.floor(Math.random()*899+100)}-**)`,
      method: 'pix',
      flowType: 'saida',
      description: `Reembolso / Estorno de Cota #${randomTicket}`,
      amountGross: 15.00,
      providerFee: 0.30,
      amountNet: 15.00,
      status: 'reembolsado',
      createdAt: formattedDate,
      refundedAt: formattedDate,
      endToEndId: `E00123456${now.getFullYear()}${String(now.getMonth()+1).padStart(2, '0')}${randSuffix}REF`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.warning('Estorno e reembolso de R$ 15,00 registrado na demonstração.', 'Simulação Financeira');
  };

  const handleResetTransactions = () => {
    setTransactions(INITIAL_FINANCIAL_TRANSACTIONS);
    toast.info('Histórico financeiro redefinido para os registros padrão demonstrativos.', 'Histórico Redefinido');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Tipo', 'Descricao', 'Comprador', 'Metodo', 'Valor_Bruto_R$', 'Taxa_Provedor_R$', 'Valor_Liquido_R$', 'Status', 'EndToEnd_ID'];
    const rows = transactions.map(t => [
      t.id,
      t.createdAt,
      t.flowType || (t.status === 'reembolsado' ? 'saida' : 'entrada'),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.buyerNameMasked.replace(/"/g, '""')}"`,
      t.method,
      t.amountGross.toFixed(2),
      t.providerFee.toFixed(2),
      t.amountNet.toFixed(2),
      t.status,
      t.endToEndId || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `extrato_demonstrativo_numerocerto_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Extrato financeiro simulado exportado com sucesso (formato CSV).', 'Exportação Concluída');
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'liquidado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Liquidado</span>
          </span>
        );
      case 'aguardando_pagamento':
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Aguardando Pagamento</span>
          </span>
        );
      case 'reembolsado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <RotateCcw className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Reembolsado</span>
          </span>
        );
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Aprovado (D+30)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Filtered transactions for the history table
  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter !== 'todos') {
      if (statusFilter === 'aguardando_pagamento') {
        if (tx.status !== 'aguardando_pagamento' && tx.status !== 'pendente') return false;
      } else if (tx.status !== statusFilter) {
        return false;
      }
    }

    if (typeFilter !== 'todos') {
      const isOutflow = tx.flowType === 'saida' || tx.status === 'reembolsado';
      if (typeFilter === 'entrada' && isOutflow) return false;
      if (typeFilter === 'saida' && !isOutflow) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = tx.id.toLowerCase().includes(q) || tx.chargeId.toLowerCase().includes(q);
      const matchBuyer = tx.buyerNameMasked.toLowerCase().includes(q);
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchTickets = tx.ticketNumbers.some(n => String(n).includes(q));
      const matchEndToEnd = (tx.endToEndId || '').toLowerCase().includes(q);
      if (!matchId && !matchBuyer && !matchDesc && !matchTickets && !matchEndToEnd) {
        return false;
      }
    }

    return true;
  });

  const totalInflowsGross = transactions
    .filter(t => t.flowType !== 'saida' && t.status !== 'reembolsado')
    .reduce((acc, t) => acc + t.amountGross, 0);

  const totalOutflowsGross = transactions
    .filter(t => t.flowType === 'saida' || t.status === 'reembolsado')
    .reduce((acc, t) => acc + t.amountGross, 0);

  const totalAwaitingPayment = transactions
    .filter(t => t.status === 'aguardando_pagamento' || t.status === 'pendente')
    .reduce((acc, t) => acc + t.amountGross, 0);

  const totalSettledNet = transactions
    .filter(t => t.status === 'liquidado' && t.flowType !== 'saida')
    .reduce((acc, t) => acc + t.amountNet, 0);

  const reconciliation = computeFinancialReconciliation(transactions);

  // Masking helpers for private screen view
  const maskDocument = (doc: string) => {
    if (!profile.isMaskedInUI) return doc;
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) {
      return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
    }
    if (clean.length === 14) {
      return `${clean.slice(0, 2)}.***.***/${clean.slice(8, 12)}-**`;
    }
    return '***.***.***-**';
  };

  const maskPixKey = (key: string, type: PixKeyType) => {
    if (!profile.isMaskedInUI) return key;
    if (type === 'cpf_cnpj') return maskDocument(key);
    if (type === 'email') {
      const parts = key.split('@');
      if (parts.length === 2) return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    }
    if (type === 'phone') {
      return `(***) *****-${key.slice(-4)}`;
    }
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const maskBankInfo = (val: string) => {
    if (!profile.isMaskedInUI || val.length <= 3) return val;
    return `***${val.slice(-3)}`;
  };

  // Switch status with synchronized receiving state
  const setVerificationState = (newVerification: FinancialVerificationStatus) => {
    const newReceiving = getReceivingStatusForVerification(newVerification);
    const updated: OrganizerFinancialProfile = {
      ...profile,
      verificationStatus: newVerification,
      receivingStatus: newReceiving,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (newVerification === 'aprovado_demonstrativo') {
      setSimulatedDocuments({ identityDoc: true, proofOfAddress: true, bankingProof: true });
      toast.success('Habilitação aprovada em Modo Demonstração! Recebimentos simulados liberados.', 'Estado Atualizado: Verificado');
    } else if (newVerification === 'em_analise_documental') {
      setSimulatedDocuments({ identityDoc: true, proofOfAddress: true, bankingProof: false });
      toast.info('Documentos enviados para fila de auditoria bancária simulada.', 'Estado Atualizado: Em Análise');
    } else if (newVerification === 'rejeitado') {
      toast.error('Inconsistência identificada entre os dados cadastrais e a chave Pix.', 'Estado Atualizado: Inconsistência');
    } else {
      setSimulatedDocuments({ identityDoc: false, proofOfAddress: false, bankingProof: false });
      toast.warning('O cadastro retornou ao estágio pendente de documentação. Recebimentos bloqueados.', 'Estado Atualizado: Pendente');
    }
  };

  // Form submit handler
  const handleSaveFinancialData = (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.holderNameOrCorporate.trim() || !profile.holderDocument.trim() || !profile.pixKey.trim()) {
      toast.error('Preencha os campos essenciais do formulário demonstrativo antes de prosseguir.', 'Campos Obrigatórios');
      return;
    }

    const updated: OrganizerFinancialProfile = {
      ...profile,
      verificationStatus: 'aprovado_demonstrativo',
      receivingStatus: 'habilitado_modo_demonstracao',
      updatedAt: new Date().toISOString(),
    };

    setProfile(updated);
    setSimulatedDocuments({ identityDoc: true, proofOfAddress: true, bankingProof: true });
    toast.success('Dados demonstrativos salvos e habilitação ativada com sucesso!', 'Verificado com Sucesso');
  };

  // Status visual badge helpers
  const getVerificationBadge = (status: FinancialVerificationStatus) => {
    switch (status) {
      case 'aprovado_demonstrativo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verificado (Modo Demonstração)</span>
          </span>
        );
      case 'em_analise_documental':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>Em Análise Documental</span>
          </span>
        );
      case 'rejeitado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <BadgeAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Inconsistência nos Dados</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Pendente de Documentos</span>
          </span>
        );
    }
  };

  const getReceivingBadge = (status: ReceivingHabilitationStatus) => {
    switch (status) {
      case 'habilitado_modo_demonstracao':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span>Habilitado em Simulação Técnica</span>
          </span>
        );
      case 'pendente_homologacao_psp':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Pendente Homologação PSP/Bancária</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span>Bloqueado para Recebimento</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Demonstrative Nature Banner (Mandatory Notice) */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-amber-50/60 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 p-4 sm:p-5 text-amber-900 dark:text-amber-200 shadow-xs">
        <div className="flex items-start gap-3.5">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
              <span>Ambiente Demonstrativo — Nenhum Dado Real é Transacionado</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-200/80 dark:bg-amber-900/80 font-bold uppercase">
                Simulação
              </span>
            </p>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed text-xs">
              Este formulário e painel operam exclusivamente em ambiente local de prototipagem. <strong>Não insira senhas, chaves privadas ou dados bancários sigilosos</strong>. O destino dos recebimentos é simulado matematicamente com base nos prazos do Banco Central (Pix D+0) e cartões (D+30).
            </p>
          </div>
        </div>
      </div>

      {/* Header and Subtabs Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            <span>Dados Financeiros e Recebimentos</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gerenciamento privado da conta bancária de repasse, chave Pix e acompanhamento de liquidações.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('recebimento_pix')}
            className={`px-3 py-1.5 rounded-lg transition-all min-h-[34px] whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'recebimento_pix'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="h-3.5 w-3.5 text-violet-500" />
            <span>Recebimento via Pix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('solicitacoes')}
            className={`px-3 py-1.5 rounded-lg transition-all min-h-[34px] whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'solicitacoes'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Solicitações de Compra</span>
            {purchaseRequests.filter(p => p.status === 'PROOF_RECEIVED' || p.status === 'PENDING_PAYMENT').length > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {purchaseRequests.filter(p => p.status === 'PROOF_RECEIVED' || p.status === 'PENDING_PAYMENT').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('historico')}
            className={`px-3 py-1.5 rounded-lg transition-all min-h-[34px] whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'historico'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Histórico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('status')}
            className={`px-3 py-1.5 rounded-lg transition-all min-h-[34px] whitespace-nowrap cursor-pointer ${
              activeSubTab === 'status'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Status
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('conciliacao')}
            className={`px-3 py-1.5 rounded-lg transition-all min-h-[34px] whitespace-nowrap cursor-pointer ${
              activeSubTab === 'conciliacao'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Conciliação
          </button>
        </div>
      </div>

      {/* Visual State & Enablement Tracker Banner (Always visible at top) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Fluxo de Habilitação do Organizador
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Altere o estado cadastral abaixo para verificar a resposta visual imediata no aplicativo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getVerificationBadge(profile.verificationStatus)}
            {getReceivingBadge(profile.receivingStatus)}
          </div>
        </div>

        {/* 3-Step Visual Progression Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          
          {/* Step 1: Pendente de Documentos */}
          <div className={`p-3 rounded-xl border text-xs transition-all ${
            profile.verificationStatus === 'pendente_dados'
              ? 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">1. Pendente de Documentos</span>
              {profile.verificationStatus === 'pendente_dados' ? (
                <Clock className="h-4 w-4 text-amber-600" />
              ) : (
                <Check className="h-3.5 w-3.5 text-slate-400" />
              )}
            </div>
            <p className="text-[11px] leading-relaxed">
              Campos essenciais ou comprovações cadastrais pendentes de envio.
            </p>
          </div>

          {/* Step 2: Em Análise */}
          <div className={`p-3 rounded-xl border text-xs transition-all ${
            profile.verificationStatus === 'em_analise_documental'
              ? 'border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-2 ring-blue-400/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">2. Em Análise</span>
              {profile.verificationStatus === 'em_analise_documental' ? (
                <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
              ) : (
                <span className="text-[10px] font-mono">Fila PSP</span>
              )}
            </div>
            <p className="text-[11px] leading-relaxed">
              Dados enviados e em validação cadastral junto ao arranjo de pagamento.
            </p>
          </div>

          {/* Step 3: Verificado & Habilitado */}
          <div className={`p-3 rounded-xl border text-xs transition-all ${
            profile.verificationStatus === 'aprovado_demonstrativo'
              ? 'border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-400/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">3. Verificado</span>
              {profile.verificationStatus === 'aprovado_demonstrativo' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <span className="text-[10px] font-mono">Bloqueado</span>
              )}
            </div>
            <p className="text-[11px] leading-relaxed">
              Titularidade confirmada! Recebimentos demonstrativos liberados.
            </p>
          </div>

        </div>

        {/* Dynamic Contextual Explanation according to active state */}
        <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
          profile.verificationStatus === 'aprovado_demonstrativo'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
            : profile.verificationStatus === 'em_analise_documental'
            ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
            : profile.verificationStatus === 'rejeitado'
            ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
        }`}>
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">
              {profile.verificationStatus === 'aprovado_demonstrativo' && 'Organizador Habilitado: Todos os pagamentos simulados são direcionados com sucesso à conta cadastrada.'}
              {profile.verificationStatus === 'em_analise_documental' && 'Em Análise pelo Provedor: Os dados foram submetidos. Novas cobranças permanecem suspensas até a conclusão da verificação.'}
              {profile.verificationStatus === 'rejeitado' && 'Bloqueio de Habilitação: Há divergência entre a chave Pix informada e o titular bancário. Corrija o formulário.'}
              {profile.verificationStatus === 'pendente_dados' && 'Pendente de Documentos: O organizador não submeteu todos os comprovantes necessários. As cobranças estão bloqueadas.'}
            </span>
            <p className="text-[11px] opacity-90">
              Ambiente demonstrativo — utilize os botões rápidos no formulário para testar cada cenário visual.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy and Visibility Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            <strong>Proteção Ativa:</strong> Dados bancários e chave Pix ficam protegidos na visualização privada do organizador.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setProfile((p) => ({ ...p, isMaskedInUI: !p.isMaskedInUI }))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors min-h-[36px] self-start sm:self-auto cursor-pointer"
        >
          {profile.isMaskedInUI ? (
            <>
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>Revelar Dados (Privado)</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5 text-slate-500" />
              <span>Ocultar / Mascarar</span>
            </>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: SOLICITAÇÕES DE COMPRA DE COTAS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'solicitacoes' && (
        <OrganizerPurchaseRequests
          requests={purchaseRequests}
          onUpdateRequest={(updated) => {
            setPurchaseRequests((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: RECEBIMENTO VIA PIX (DADOS CADASTRAIS & BANCÁRIOS) */}
      {/* ------------------------------------------------------------- */}
      {(activeSubTab === 'recebimento_pix' || (activeSubTab as string) === 'formulario') && (
        <form onSubmit={handleSaveFinancialData} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span>Recebimento via Pix — Configuração do Sorteio</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informe a chave Pix destinada ao recebimento dos pagamentos. Os compradores conferem estes dados antes de transferir.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Atualizado em: {new Date(profile.updatedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Quick Simulation State Switcher inside Form */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>Simulação Rápida do Estado de Habilitação:</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Clique para alternar o status instantaneamente
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setVerificationState('pendente_dados')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                  profile.verificationStatus === 'pendente_dados'
                    ? 'border-amber-400 bg-amber-100/80 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span>Pendente de Documentos</span>
                <span className="text-[10px] font-normal opacity-75">Bloqueia Recebimentos</span>
              </button>

              <button
                type="button"
                onClick={() => setVerificationState('em_analise_documental')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                  profile.verificationStatus === 'em_analise_documental'
                    ? 'border-blue-400 bg-blue-100/80 dark:bg-blue-950 text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span>Em Análise</span>
                <span className="text-[10px] font-normal opacity-75">Validação PSP</span>
              </button>

              <button
                type="button"
                onClick={() => setVerificationState('aprovado_demonstrativo')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                  profile.verificationStatus === 'aprovado_demonstrativo'
                    ? 'border-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span>Verificado</span>
                <span className="text-[10px] font-normal opacity-75">Habilitado Demo</span>
              </button>

              <button
                type="button"
                onClick={() => setVerificationState('rejeitado')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                  profile.verificationStatus === 'rejeitado'
                    ? 'border-rose-400 bg-rose-100/80 dark:bg-rose-950 text-rose-900 dark:text-rose-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span>Inconsistência</span>
                <span className="text-[10px] font-normal opacity-75">Requer Ajuste</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nome / Razão Social */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Nome Completo ou Razão Social *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Associação Fictícia Estrela (Demonstrativo - Não insira dados reais)"
                value={profile.holderNameOrCorporate}
                onChange={(e) => setProfile({ ...profile, holderNameOrCorporate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
              <span className="text-[10px] text-slate-400">
                Campo demonstrativo para teste da interface.
              </span>
            </div>

            {/* CPF / CNPJ */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                CPF ou CNPJ (Demonstrativo) *
              </label>
              <input
                type="text"
                required
                placeholder="00.123.456/0001-99 (Demonstrativo - Não insira dados reais)"
                value={profile.isMaskedInUI ? maskDocument(profile.holderDocument) : profile.holderDocument}
                onChange={(e) => setProfile({ ...profile, holderDocument: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
              <span className="text-[10px] text-slate-400">
                Simulação de titularidade cadastral.
              </span>
            </div>

            {/* Nome do Titular da Conta */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Nome do Titular da Conta Bancária (Beneficiário Autorizado) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Associação Fictícia Estrela (Demonstrativo - Simulação Bancária)"
                value={profile.accountBeneficiaryName}
                onChange={(e) => setProfile({ ...profile, accountBeneficiaryName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
              <p className="text-[11px] text-slate-500">
                Deve coincidir com a titularidade do CPF/CNPJ para verificação e habilitação de repasses.
              </p>
            </div>

            {/* Tipo de Chave Pix */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tipo de Chave Pix *
              </label>
              <select
                value={profile.pixKeyType}
                onChange={(e) => setProfile({ ...profile, pixKeyType: e.target.value as PixKeyType })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px] cursor-pointer"
              >
                <option value="cpf_cnpj">CPF ou CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone Celular</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>

            {/* Chave Pix com Validação de Formato */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Chave Pix para Recebimento *
                </label>
                {(() => {
                  const key = profile.pixKey.trim();
                  if (!key) return null;
                  let isValid = false;
                  if (profile.pixKeyType === 'cpf_cnpj') {
                    const clean = key.replace(/\D/g, '');
                    isValid = clean.length === 11 || clean.length === 14;
                  } else if (profile.pixKeyType === 'email') {
                    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
                  } else if (profile.pixKeyType === 'phone') {
                    const clean = key.replace(/\D/g, '');
                    isValid = clean.length >= 10 && clean.length <= 13;
                  } else {
                    isValid = key.length >= 32;
                  }
                  return (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isValid 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {isValid ? 'Formato Válido' : 'Formato Incompleto'}
                    </span>
                  );
                })()}
              </div>
              <input
                type="text"
                required
                placeholder="Ex: chave-pix-demonstrativa@exemplo.com"
                value={profile.isMaskedInUI ? maskPixKey(profile.pixKey, profile.pixKeyType) : profile.pixKey}
                onChange={(e) => setProfile({ ...profile, pixKey: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
              <p className="text-[11px] text-slate-500">
                Atenção: Não presumimos que a chave é válida ou ativa apenas por digitação. É exigida homologação junto ao PSP.
              </p>
            </div>

            {/* Prévia dos Dados de Pagamento exibidos ao comprador */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 space-y-2 text-xs">
              <span className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <ShieldCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Prévia de Pagamento (Exibida aos Compradores antes da Transferência):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Destinatário:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {profile.accountBeneficiaryName || profile.holderNameOrCorporate || 'Nome a definir'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Chave Vinculada:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {profile.pixKey || 'Não cadastrada'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Trava de Segurança:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                    Bloqueio se houver pedidos pendentes
                  </span>
                </div>
              </div>
            </div>

            {/* Instituição Financeira */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Instituição Financeira (Banco / Fintech) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Banco do Brasil (001) / Nubank (260) (Demonstrativo)"
                value={profile.bankName}
                onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

            {/* Tipo de Conta */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tipo de Conta Bancária
              </label>
              <select
                value={profile.accountType}
                onChange={(e) => setProfile({ ...profile, accountType: e.target.value as BankAccountType })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px] cursor-pointer"
              >
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Conta Poupança</option>
                <option value="pagamento">Conta de Pagamento</option>
              </select>
            </div>

            {/* Agência */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Agência (quando exigida)
              </label>
              <input
                type="text"
                placeholder="Ex: 0001 (Demonstrativo - Simulação)"
                value={profile.isMaskedInUI ? maskBankInfo(profile.agency) : profile.agency}
                onChange={(e) => setProfile({ ...profile, agency: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

            {/* Conta */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Número da Conta com Dígito *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 12345-6 (Demonstrativo - Simulação)"
                value={profile.isMaskedInUI ? maskBankInfo(profile.accountNumber) : profile.accountNumber}
                onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

          </div>

          {/* Simulated Document Uploads Section */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>Documentos Comprobatórios (Simulação de Envio)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Modo Demonstrativo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={simulatedDocuments.identityDoc}
                  onChange={(e) => {
                    const next = { ...simulatedDocuments, identityDoc: e.target.checked };
                    setSimulatedDocuments(next);
                    if (!next.identityDoc) setVerificationState('pendente_dados');
                  }}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Documento com Foto (RG / CNH)
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={simulatedDocuments.proofOfAddress}
                  onChange={(e) => {
                    const next = { ...simulatedDocuments, proofOfAddress: e.target.checked };
                    setSimulatedDocuments(next);
                    if (!next.proofOfAddress) setVerificationState('pendente_dados');
                  }}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Comprovante de Endereço / Sede
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={simulatedDocuments.bankingProof}
                  onChange={(e) => {
                    const next = { ...simulatedDocuments, bankingProof: e.target.checked };
                    setSimulatedDocuments(next);
                  }}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Comprovante Bancário / DICT Pix
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              * Nenhum dado real é transmitido ou processado. Salvo apenas no armazenamento do navegador.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setVerificationState('em_analise_documental')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs min-h-[44px] cursor-pointer"
              >
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Simular Envio p/ Análise</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all min-h-[44px] cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Salvar e Habilitar Organizador</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 2: VISUALIZAÇÃO DE STATUS PARA VERIFICAÇÃO */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'status' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Verificação Cadastral */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1. Verificação Cadastral Bancária
                </span>
                <span className="text-[10px] font-mono text-slate-400">Status Dinâmico</span>
              </div>

              <div>{getVerificationBadge(profile.verificationStatus)}</div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {profile.verificationStatus === 'aprovado_demonstrativo' && 'Documentação e titularidade verificadas com sucesso na base de homologação simulada.'}
                {profile.verificationStatus === 'em_analise_documental' && 'Comprovantes enviados e em auditoria documental pelo provedor de pagamentos autorizado.'}
                {profile.verificationStatus === 'pendente_dados' && 'O titular ainda não submeteu os documentos comprobatórios ou preencheu todos os campos necessários.'}
                {profile.verificationStatus === 'rejeitado' && 'Identificada inconsistência nos documentos ou no titular da chave Pix informada.'}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Última auditoria local:</span>
                <span className="font-mono">{new Date(profile.updatedAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Card 2: Habilitação para Receber Pagamentos */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  2. Habilitação de Recebimento
                </span>
                <span className="text-[10px] font-mono text-slate-400">Controle de Fluxo</span>
              </div>

              <div>{getReceivingBadge(profile.receivingStatus)}</div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {profile.receivingStatus === 'habilitado_modo_demonstracao' && 'A conta está liberada para processar transações e arrecadações simuladas no ambiente de demonstração.'}
                {profile.receivingStatus === 'pendente_homologacao_psp' && 'Recebimentos suspensos preventivamente até a conclusão da verificação da chave Pix e do beneficiário.'}
                {profile.receivingStatus === 'bloqueado_aguardando_analise' && 'Recebimentos bloqueados. O organizador deve regularizar seu cadastro antes de aceitar pagamentos.'}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Destino cadastrado:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {profile.bankName} (Agência: {maskBankInfo(profile.agency)})
                </span>
              </div>
            </div>

          </div>

          {/* Interactive Status Switcher in Status Tab too for convenience */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>Simular Alternância de Habilitação do Organizador</span>
              </h5>
              <span className="text-[10px] text-slate-400">Demonstração Interativa</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setVerificationState('pendente_dados')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  profile.verificationStatus === 'pendente_dados'
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Pendente de Documentos
              </button>

              <button
                type="button"
                onClick={() => setVerificationState('em_analise_documental')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  profile.verificationStatus === 'em_analise_documental'
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Em Análise Documental
              </button>

              <button
                type="button"
                onClick={() => setVerificationState('aprovado_demonstrativo')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  profile.verificationStatus === 'aprovado_demonstrativo'
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Verificado / Aprovado
              </button>

              <button
                type="button"
                onClick={() => setVerificationState('rejeitado')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  profile.verificationStatus === 'rejeitado'
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Inconsistência nos Dados
              </button>
            </div>
          </div>

          {/* Compliance Checklist Breakdown */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Critérios de Conformidade para Ativação Operacional</span>
            </h4>

            <div className="space-y-3 text-xs">
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Titularidade Coincidente</p>
                  <p className="text-slate-600 dark:text-slate-400">O documento registrado coincide com o titular da conta e da chave Pix cadastrada.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Arranjo de Pagamento Desacoplado</p>
                  <p className="text-slate-600 dark:text-slate-400">O comprador paga via Pix ou cartão tokenizado e o valor líquido é destinado ao beneficiário sem intermediários informais.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Autorização Legal Externa (Pendente em Modo Demonstração)</p>
                  <p className="text-amber-800 dark:text-amber-300/90">A arrecadação pública com moeda corrente depende de registro formal perante os órgãos de controle.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: HISTÓRICO DE TRANSAÇÕES (ENTRADAS & SAÍDAS) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'historico' && (
        <div className="space-y-6">

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Total Inflows */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Entradas Brutas
                </span>
                <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                  <ArrowDownLeft className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 font-mono tabular-nums">
                + R$ {totalInflowsGross.toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-medium block">
                {transactions.filter(t => t.flowType !== 'saida' && t.status !== 'reembolsado').length} arrecadações simuladas
              </span>
            </div>

            {/* Total Outflows / Refunds */}
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  Saídas & Reembolsos
                </span>
                <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-900 dark:text-rose-100 font-mono tabular-nums">
                - R$ {totalOutflowsGross.toFixed(2)}
              </p>
              <span className="text-[10px] text-rose-700/80 dark:text-rose-300/80 font-medium block">
                {transactions.filter(t => t.flowType === 'saida' || t.status === 'reembolsado').length} estornos/repasses
              </span>
            </div>

            {/* Awaiting Payment */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Aguardando Pagamento
                </span>
                <span className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-900 dark:text-amber-100 font-mono tabular-nums">
                R$ {totalAwaitingPayment.toFixed(2)}
              </p>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-medium block">
                {transactions.filter(t => t.status === 'aguardando_pagamento' || t.status === 'pendente').length} cobranças pendentes
              </span>
            </div>

            {/* Settled Net */}
            <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">
                  Saldo Liquidado
                </span>
                <span className="p-1 rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-violet-900 dark:text-violet-100 font-mono tabular-nums">
                R$ {totalSettledNet.toFixed(2)}
              </p>
              <span className="text-[10px] text-violet-700/80 dark:text-violet-300/80 font-medium block">
                Efetivamente creditado em D+0
              </span>
            </div>

          </div>

          {/* Simulation Action Bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <span>Simulador de Transações Financeiras</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Acione eventos em tempo real para visualizar o comportamento do extrato, status e saldos na demonstração.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSimulatePixInflow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[36px]"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ Pix Liquidado (R$ 30,00)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulatePendingPix}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[36px]"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Pix Pendente (R$ 15,00)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateRefundOutflow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[36px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>- Reembolso (R$ 15,00)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer min-h-[36px]"
                  title="Exportar CSV demonstrativo"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Exportar CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTransactions}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs transition-colors cursor-pointer min-h-[36px]"
                  title="Restaurar dados padrão demonstrativos"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Restaurar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Toolbar & Search */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* Search Input */}
              <div className="sm:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por ID, participante, bilhete ou descrição..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="liquidado">Apenas Liquidados</option>
                  <option value="aguardando_pagamento">Apenas Aguardando Pagamento</option>
                  <option value="reembolsado">Apenas Reembolsados</option>
                  <option value="aprovado">Aprovados (D+30 Cartão)</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="sm:col-span-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="todos">Todos os Fluxos</option>
                  <option value="entrada">Apenas Entradas (+)</option>
                  <option value="saida">Apenas Saídas / Estornos (-)</option>
                </select>
              </div>

            </div>

            {/* Active Filters Summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="font-mono text-[11px]">
                Exibindo <strong>{filteredTransactions.length}</strong> de <strong>{transactions.length}</strong> transações registradas
              </span>

              {(statusFilter !== 'todos' || typeFilter !== 'todos' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('todos');
                    setTypeFilter('todos');
                    setSearchQuery('');
                  }}
                  className="text-violet-600 dark:text-violet-400 font-semibold hover:underline text-xs cursor-pointer"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Transactions History Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Data / ID</th>
                    <th className="py-3.5 px-4">Fluxo</th>
                    <th className="py-3.5 px-4">Descrição & Participante</th>
                    <th className="py-3.5 px-4">Método</th>
                    <th className="py-3.5 px-4 text-right">Bruto</th>
                    <th className="py-3.5 px-4 text-right">Taxa Ext.</th>
                    <th className="py-3.5 px-4 text-right">Líquido</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <History className="h-8 w-8 text-slate-400 stroke-[1.5]" />
                          <p className="font-semibold text-sm">Nenhuma transação encontrada</p>
                          <p className="text-xs text-slate-400 max-w-sm">
                            Tente ajustar os filtros de status ou a busca por termo para visualizar outros registros demonstrativos.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isOutflow = tx.flowType === 'saida' || tx.status === 'reembolsado';

                      return (
                        <tr 
                          key={tx.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Col 1: Date & ID */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="block font-medium text-slate-900 dark:text-white">
                              {tx.createdAt}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 block">
                              {tx.chargeId}
                            </span>
                          </td>

                          {/* Col 2: Flow Direction */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isOutflow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>Saída</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <ArrowDownLeft className="h-3 w-3" />
                                <span>Entrada</span>
                              </span>
                            )}
                          </td>

                          {/* Col 3: Description & Buyer */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate" title={tx.description || ''}>
                              {tx.description || `Cotas ${tx.ticketNumbers.map(n => `#${String(n).padStart(3, '0')}`).join(', ')}`}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                              <span>{tx.buyerNameMasked}</span>
                              {tx.ticketNumbers.length > 0 && (
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {tx.ticketNumbers.length} cota(s)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Col 4: Method */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {tx.method === 'pix' && <QrCode className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                              {tx.method === 'credit_card' && <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                              {tx.method === 'debit_card' && <CreditCard className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />}
                              {tx.method === 'google_pay' && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {tx.method === 'pix' ? 'Pix Instantâneo' :
                                 tx.method === 'credit_card' ? 'Cartão Crédito' :
                                 tx.method === 'debit_card' ? 'Cartão Débito' : 'Google Pay'}
                              </span>
                            </div>
                          </td>

                          {/* Col 5: Gross Amount */}
                          <td className="py-3 px-4 text-right font-mono font-medium tabular-nums whitespace-nowrap">
                            <span className={isOutflow ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-900 dark:text-white'}>
                              {isOutflow ? `- R$ ${tx.amountGross.toFixed(2)}` : `+ R$ ${tx.amountGross.toFixed(2)}`}
                            </span>
                          </td>

                          {/* Col 6: Provider Fee */}
                          <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums whitespace-nowrap text-[11px]">
                            R$ {tx.providerFee.toFixed(2)}
                          </td>

                          {/* Col 7: Net Amount */}
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                            <span className={isOutflow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                              {isOutflow ? `- R$ ${tx.amountNet.toFixed(2)}` : `R$ ${tx.amountNet.toFixed(2)}`}
                            </span>
                          </td>

                          {/* Col 8: Status Badge */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {getTransactionStatusBadge(tx.status)}
                          </td>

                          {/* Col 9: Action (Inspect) */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedTxForModal(tx)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Auditoria
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Note */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Prazos regulatórios: Pix liquida em D+0; cartões seguem ciclo D+30 via adquirente homologada.</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Ambiente de Demonstração NumeroCerto
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Transaction Inspection & Audit Modal */}
      {selectedTxForModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <span>Auditoria da Transação Demonstrativa</span>
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedTxForModal.chargeId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTxForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status & Direction pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status da Cobrança</span>
                <div>{getTransactionStatusBadge(selectedTxForModal.status)}</div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Líquido</span>
                <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  R$ {selectedTxForModal.amountNet.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Fields list */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Descrição:</span>
                <span className="font-medium text-slate-900 dark:text-white text-right max-w-xs">{selectedTxForModal.description || 'Arrecadação de Cotas'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Comprador (LGPD Mascarado):</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedTxForModal.buyerNameMasked}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Método de Liquidação:</span>
                <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{selectedTxForModal.method}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Valor Bruto Autorizado:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">R$ {selectedTxForModal.amountGross.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tarifa do Provedor (Retida pelo PSP):</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">- R$ {selectedTxForModal.providerFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Data de Criação:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedTxForModal.createdAt}</span>
              </div>

              {selectedTxForModal.settledAt && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Data de Liquidação Bancária:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{selectedTxForModal.settledAt}</span>
                </div>
              )}

              {selectedTxForModal.refundedAt && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Data do Estorno / Reembolso:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{selectedTxForModal.refundedAt}</span>
                </div>
              )}

              {selectedTxForModal.endToEndId && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">End-to-End ID (BACEN):</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all">{selectedTxForModal.endToEndId}</span>
                </div>
              )}

              {selectedTxForModal.ticketNumbers && selectedTxForModal.ticketNumbers.length > 0 && (
                <div className="py-2">
                  <span className="text-slate-500 block mb-1.5">Cotas Vinculadas ao Bilhete:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedTxForModal.ticketNumbers.map((num) => (
                      <span key={num} className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-mono text-xs font-bold">
                        #{String(num).padStart(3, '0')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Registro gerado para validação do fluxo técnico. Nenhum débito bancário real foi executado.</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxForModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer min-h-[38px]"
              >
                Fechar Auditoria
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 4: CONCILIAÇÃO & PRAZOS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'conciliacao' && (
        <div className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Autorizado (Bruto)</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                R$ {reconciliation.approvedGrossTotal.toFixed(2)}
              </p>
              <span className="text-[10px] text-slate-400">Autorizado pelos compradores</span>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Pendente de Liquidação</span>
              <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400 font-mono tabular-nums">
                R$ {reconciliation.pendingSettlementTotal.toFixed(2)}
              </p>
              <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80">Aguardando prazo do cartão (D+30)</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Efetivamente Recebido</span>
              <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                R$ {reconciliation.settledReceivedTotal.toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80">Creditado na conta do beneficiário</span>
            </div>

          </div>

          {/* Golden Rule Note */}
          <div className="p-4 rounded-xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-800 text-xs flex items-start gap-3">
            <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-300">
              <strong>Regra de Liquidação:</strong> Um valor autorizado no cartão de crédito só é considerado <span className="text-emerald-300 font-bold">Efetivamente Recebido</span> após o depósito correspondente na conta bancária homologada (D+30). O Pix liquida instantaneamente em D+0.
            </p>
          </div>

          {/* Transactions list */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Últimos Registros Demonstrativos ({transactions.length})
              </h5>
              <span className="text-[10px] text-slate-400 font-mono">Dados Simulados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans">
                    <th className="pb-2">Data / ID</th>
                    <th className="pb-2">Comprador</th>
                    <th className="pb-2">Método</th>
                    <th className="pb-2">Bruto</th>
                    <th className="pb-2">Líquido</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-2">
                        <span className="block font-sans text-[11px] font-medium">{tx.createdAt}</span>
                        <span className="text-[10px] text-slate-400">{tx.chargeId}</span>
                      </td>
                      <td className="py-2 font-sans">{tx.buyerNameMasked}</td>
                      <td className="py-2 uppercase font-sans text-[10px] font-bold">
                        {tx.method === 'credit_card' ? 'Cartão' : tx.method}
                      </td>
                      <td className="py-2 tabular-nums">R$ {tx.amountGross.toFixed(2)}</td>
                      <td className="py-2 tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {tx.amountNet.toFixed(2)}
                      </td>
                      <td className="py-2">
                        {tx.status === 'liquidado' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-sans font-bold">
                            Liquidado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-sans font-bold">
                            Pendente D+30
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
