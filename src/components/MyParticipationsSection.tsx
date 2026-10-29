/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PurchaseRequest, 
  PurchaseRequestStatus, 
  ActiveSection, 
  DisputeReport,
  LotteryAction 
} from '../types';
import { 
  getAllPurchaseRequests, 
  updatePurchaseRequestStatus, 
  publicLookup, 
  getStoredDisputes, 
  saveDispute 
} from '../services/purchaseStorage';
import { useToast } from '../context/ToastContext';
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  BadgeAlert, 
  Search, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  FileCheck, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Send, 
  ArrowRight, 
  MessageSquare, 
  Smartphone,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Hash
} from 'lucide-react';

interface MyParticipationsSectionProps {
  setActiveSection: (sec: ActiveSection) => void;
  activeAction: LotteryAction;
}

export const MyParticipationsSection: React.FC<MyParticipationsSectionProps> = ({
  setActiveSection,
  activeAction,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'participations' | 'public_lookup' | 'disputes'>('participations');
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Modal Viewer
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<PurchaseRequest | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Public Query State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<ReturnType<typeof publicLookup> | null>(null);

  // Dispute Form State
  const [disputeOrderId, setDisputeOrderId] = useState('');
  const [disputeCategory, setDisputeCategory] = useState<DisputeReport['category']>('divergencia_pagamento');
  const [disputeContact, setDisputeContact] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputesList, setDisputesList] = useState<DisputeReport[]>([]);

  const loadData = () => {
    setRequests(getAllPurchaseRequests());
    setDisputesList(getStoredDisputes());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchNumbers = r.ticketNumbers.some((n) => String(n).includes(q));
      if (!matchId && !matchNumbers) return false;
    }
    return true;
  });

  const getStatusBadge = (status: PurchaseRequestStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Participação Confirmada</span>
          </span>
        );
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Pagamento Confirmado (Conciliando)</span>
          </span>
        );
      case 'PROOF_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Comprovante Enviado (Aguardando Banco)</span>
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Reserva Ativa (Aguardando Pix)</span>
          </span>
        );
      case 'PAYMENT_INSUFFICIENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <BadgeAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>Pagamento Insuficiente</span>
          </span>
        );
      case 'EXPIRED':
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>{status === 'EXPIRED' ? 'Reserva Expirada' : 'Cancelado'}</span>
          </span>
        );
    }
  };

  const copyText = (txt: string, isKey: boolean) => {
    try {
      navigator.clipboard.writeText(txt);
      if (isKey) {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2000);
      }
      toast.success('Copiado para a área de transferência!', 'Copiado');
    } catch {
      toast.info('Selecione e copie manualmente.', 'Copiar');
    }
  };

  const handleRunPublicLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    const res = publicLookup(lookupQuery);
    setLookupResult(res);
  };

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) {
      toast.error('Descreva o motivo da contestação ou dúvida.', 'Campo Obrigatório');
      return;
    }
    const newReport: DisputeReport = {
      protocol: `PROT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: disputeOrderId.trim() || undefined,
      category: disputeCategory,
      contactMasked: disputeContact.trim() || 'Usuário da Sessão',
      description: disputeDescription.trim(),
      status: 'recebido',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      responseNotes: 'Registrado na fila de conciliação e ética operacional.'
    };
    saveDispute(newReport);
    setDisputesList(getStoredDisputes());
    setDisputeDescription('');
    setDisputeOrderId('');
    setDisputeContact('');
    toast.success(`Protocolo ${newReport.protocol} aberto com sucesso!`, 'Contestação Registrada');
  };

  return (
    <div className="space-y-8 py-6 sm:py-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              <TicketIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Minhas Participações & Rastreamento
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Acompanhe a situação de cada pedido, prazos de reserva, conferência de comprovantes e cotas garantidas.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('participations')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'participations'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TicketIcon className="h-3.5 w-3.5" />
            <span>Meus Pedidos ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('public_lookup')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'public_lookup'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Consulta Pública por Código</span>
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'disputes'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Canal de Dúvidas & Ética</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MEUS PEDIDOS & PARTICIPAÇÕES
         ========================================================================= */}
      {activeTab === 'participations' && (
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por PED-XXXX ou nº da cota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Filtrar:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'CONFIRMED', label: 'Confirmados' },
                { id: 'PROOF_RECEIVED', label: 'Comprovante Enviado' },
                { id: 'PENDING_PAYMENT', label: 'Aguardando Pix' },
                { id: 'PAYMENT_INSUFFICIENT', label: 'Divergentes' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setStatusFilter(btn.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === btn.id
                      ? 'bg-violet-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <TicketIcon className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nenhuma participação encontrada nesta busca
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Selecione bilhetes na grade de números de 001 a 1000 para iniciar um pedido transparente e acompanhar suas cotas.
                </p>
              </div>
              <button
                onClick={() => setActiveSection('numbers')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <span>Ir para a Grade de Números</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-violet-300 dark:hover:border-violet-700/60 transition-all"
                >
                  
                  {/* Top Bar: Order ID & Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {req.id}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {req.createdAt}
                      </span>
                    </div>

                    <div className="pt-1">
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Ticket Numbers Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Cotas Selecionadas ({req.quantity}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {req.ticketNumbers.map((num) => (
                        <span
                          key={num}
                          className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900"
                        >
                          #{String(num).padStart(3, '0')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Financials & Calculation */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500 text-[11px]">Cálculo Determinístico:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {req.quantity} × R$ {req.unitPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-0.5 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px]">Total da Operação:</span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        R$ {req.totalExpected.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Notes & Verification */}
                  {req.aiAnalysisNotes && (
                    <div className="text-[11px] p-2.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-violet-900 dark:text-violet-300">
                      <span className="font-bold block mb-0.5 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-violet-500" />
                        Conferência da Operação:
                      </span>
                      <p className="line-clamp-2 leading-relaxed text-[10px]">
                        {req.aiAnalysisNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions & Details */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetails(req)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ver Detalhes & Trilha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDisputeOrderId(req.id);
                        setActiveTab('disputes');
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      title="Contestar ou enviar dúvida sobre este pedido"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Dúvida</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          TAB 2: CONSULTA PÚBLICA POR CÓDIGO OU BILHETE
         ========================================================================= */}
      {activeTab === 'public_lookup' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Auditoria e Transparência Aberta
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-violet-500" />
                <span>Consulta Pública de Pedidos e Cotas</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Qualquer participante ou terceiro pode consultar a situação pública de um pedido ou número de bilhete sem expor dados pessoais protegidos pela LGPD.
              </p>
            </div>

            <form onSubmit={handleRunPublicLookup} className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Digite o código (ex: PED-48291) ou o número (ex: 014)..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm transition-colors shrink-0"
              >
                Consultar
              </button>
            </form>

            {lookupResult && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                {!lookupResult.found ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Nenhum registro encontrado para "{lookupQuery}"
                    </p>
                    <p className="text-[11px] opacity-90">
                      Verifique se digitou o código completo do pedido (incluindo "PED-") ou o número da cota de 001 a 1000.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Resultado da Consulta Pública ({lookupResult.type === 'order' ? 'Por Pedido' : 'Por Cota'})
                      </span>
                      {getStatusBadge(lookupResult.data!.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Identificador:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{lookupResult.data!.id}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Titular (LGPD Mascarado):</span>
                        <span className="font-bold text-slate-900 dark:text-white">{lookupResult.data!.buyerMasked}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Cotas Vinculadas:</span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {lookupResult.data!.ticketNumbers.map(n => (
                          <span key={n} className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-mono font-bold text-xs">
                            #{String(n).padStart(3, '0')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>Eventos Registrados: <strong>{lookupResult.data!.auditCount}</strong></span>
                      <span className="font-mono truncate max-w-xs">Hash: {lookupResult.data!.lastAuditHash}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CANAL DE DÚVIDAS, CONTESTAÇÕES E ÉTICA
         ========================================================================= */}
      {activeTab === 'disputes' && (
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Dispute Registration Form */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Atendimento Ético & Prevenção de Conflitos
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-500" />
                <span>Registrar Dúvida, Divergência ou Contestação</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Se você realizou um pagamento divergente, teve dúvidas sobre a apuração ou deseja reportar qualquer inconformidade, registre sua manifestação formal com protocolo.
              </p>
            </div>

            <form onSubmit={handleCreateDispute} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Número do Pedido (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PED-48291"
                    value={disputeOrderId}
                    onChange={(e) => setDisputeOrderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Categoria da Manifestação:
                  </label>
                  <select
                    value={disputeCategory}
                    onChange={(e) => setDisputeCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="divergencia_pagamento">Divergência de Pagamento / Valor Pix</option>
                    <option value="duvida_regulamento">Dúvida sobre Regulamento e Regras</option>
                    <option value="denuncia_irregularidade">Reportar Inconformidade / Alerta</option>
                    <option value="outro">Outro Assunto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Seu Contato para Retorno (E-mail ou Telefone):
                </label>
                <input
                  type="text"
                  placeholder="Ex: seuemail@exemplo.com ou (31) 98888-0000"
                  value={disputeContact}
                  onChange={(e) => setDisputeContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Descrição dos Fatos:
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva de forma clara e objetiva o que ocorreu..."
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Enviar Contestação com Protocolo</span>
                </button>
              </div>

            </form>
          </div>

          {/* Disputes History */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Histórico de Protocolos Abertos ({disputesList.length})
            </h4>

            {disputesList.map((item) => (
              <div
                key={item.protocol}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded">
                    {item.protocol}
                  </span>
                  <span className="text-slate-400 text-[11px]">{item.createdAt}</span>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.description}
                  </p>
                  {item.orderId && (
                    <span className="text-[11px] text-slate-500 block">
                      Vinculado ao Pedido: <strong>{item.orderId}</strong>
                    </span>
                  )}
                  {item.responseNotes && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-[11px] mt-2">
                      <span className="font-bold block mb-0.5">Resposta do Atendimento:</span>
                      {item.responseNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          ORDER DETAILS MODAL (Com Trilha de Auditoria e Dados de Pagamento)
         ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Detalhes do Pedido {selectedOrderDetails.id}</span>
                </h3>
                <span className="text-xs text-slate-400">Criado em {selectedOrderDetails.createdAt}</span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Status Atual:</span>
                {getStatusBadge(selectedOrderDetails.status)}
              </div>

              {/* Numbers */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Cotas Vinculadas ({selectedOrderDetails.quantity}):
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedOrderDetails.ticketNumbers.map(n => (
                    <span key={n} className="px-2.5 py-1 rounded-lg font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      #{String(n).padStart(3, '0')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Financial values */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Total Calculado:</span>
                  <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    R$ {selectedOrderDetails.totalExpected.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Destinatário Pix:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedOrderDetails.organizerRecipientName}
                  </span>
                </div>
              </div>

              {/* Pix Copia e Cola */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Chave Pix do Organizador:</span>
                  <button
                    type="button"
                    onClick={() => copyText(selectedOrderDetails.organizerPixKey, true)}
                    className="text-[11px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey ? 'Copiado!' : 'Copiar Chave'}</span>
                  </button>
                </div>
                <span className="font-mono text-xs font-bold block text-slate-800 dark:text-slate-200">
                  {selectedOrderDetails.organizerPixKey}
                </span>
              </div>

              {/* Audit Trail */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Trilha de Auditoria & Imutabilidade:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[10px]">
                  {selectedOrderDetails.auditLogs?.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <div className="flex justify-between text-slate-400">
                        <span>{log.timestamp} · {log.operator}</span>
                        <span className="text-violet-600 dark:text-violet-400">{log.action}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-sans text-[11px]">
                        {log.reason}
                      </p>
                      <span className="text-[9px] text-slate-400 truncate block">
                        Hash: {log.hash}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                Fechar Detalhes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
