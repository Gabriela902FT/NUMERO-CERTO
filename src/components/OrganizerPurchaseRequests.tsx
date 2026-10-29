/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PurchaseRequest, 
  PurchaseRequestStatus, 
  AuditLogEntry 
} from '../types';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BadgeAlert, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  X, 
  FileCheck, 
  Sparkles, 
  FileText,
  UserCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface OrganizerPurchaseRequestsProps {
  requests: PurchaseRequest[];
  onUpdateRequest: (updated: PurchaseRequest) => void;
}

export const OrganizerPurchaseRequests: React.FC<OrganizerPurchaseRequestsProps> = ({
  requests,
  onUpdateRequest,
}) => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Restricted Proof Modal State
  const [selectedProofRequest, setSelectedProofRequest] = useState<PurchaseRequest | null>(null);
  const [isProofImageRevealed, setIsProofImageRevealed] = useState(false);

  // Formal Controlled Audit Exception Modal
  const [selectedExceptionRequest, setSelectedExceptionRequest] = useState<PurchaseRequest | null>(null);
  const [exceptionReason, setExceptionReason] = useState('');
  const [exceptionOperator, setExceptionOperator] = useState('');
  const [targetStatus, setTargetStatus] = useState<PurchaseRequestStatus>('PAYMENT_CONFIRMED');

  const filtered = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchBuyer = r.buyerNameMasked.toLowerCase().includes(q);
      const matchNums = r.ticketNumbers.some(n => String(n).includes(q));
      if (!matchId && !matchBuyer && !matchNums) return false;
    }
    return true;
  });

  const getStatusBadge = (status: PurchaseRequestStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Confirmada</span>
          </span>
        );
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Pagamento Confirmado</span>
          </span>
        );
      case 'PROOF_RECEIVED':
      case 'PAYMENT_UNCONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Comprovante Recebido</span>
          </span>
        );
      case 'PAYMENT_INSUFFICIENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
            <BadgeAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            <span>Pagamento Insuficiente</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <span>Expirada</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 line-through">
            <span>Cancelada</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Em Revisão</span>
          </span>
        );
      case 'PENDING_PAYMENT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="h-3.5 w-3.5" />
            <span>Aguardando Pix</span>
          </span>
        );
    }
  };

  const handleOpenRestrictedProof = (req: PurchaseRequest) => {
    setSelectedProofRequest(req);
    setIsProofImageRevealed(false);
  };

  const handleOpenExceptionModal = (req: PurchaseRequest) => {
    setSelectedExceptionRequest(req);
    setExceptionReason('');
    setExceptionOperator('Operador Responsável');
    setTargetStatus('PAYMENT_CONFIRMED');
  };

  const handleSaveControlledException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExceptionRequest) return;

    if (!exceptionReason.trim() || exceptionReason.trim().length < 15) {
      toast.error('Informe uma justificativa formal com ao menos 15 caracteres.', 'Justificativa Obrigatória');
      return;
    }

    const newLog: AuditLogEntry = {
      id: `aud-exc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: 'EXCECAO_OPERACIONAL_REGISTRADA',
      previousValue: selectedExceptionRequest.status,
      newValue: targetStatus,
      reason: exceptionReason.trim(),
      operator: exceptionOperator.trim() || 'Auditor do Organizador',
      hash: `sha256-${Math.random().toString(16).substring(2, 10)}`
    };

    const updated: PurchaseRequest = {
      ...selectedExceptionRequest,
      status: targetStatus,
      auditLogs: [newLog, ...selectedExceptionRequest.auditLogs],
    };

    onUpdateRequest(updated);
    toast.success('Exceção operacional registrada na trilha de auditoria permanente!', 'Auditoria Concluída');
    setSelectedExceptionRequest(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Solicitações de Compra de Cotas</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-mono font-bold">
              {filtered.length} solicitações
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhamento das reservas, verificação dos comprovantes e conciliação financeira do Pix.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, cota ou comprador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 min-w-[200px]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="all">Todos os Status</option>
            <option value="PENDING_PAYMENT">Aguardando Pagamento</option>
            <option value="PROOF_RECEIVED">Comprovante Recebido</option>
            <option value="PAYMENT_CONFIRMED">Pagamento Confirmado</option>
            <option value="PAYMENT_INSUFFICIENT">Pagamento Insuficiente</option>
            <option value="CONFIRMED">Participação Confirmada</option>
            <option value="EXPIRED">Expirada</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Solicitação / Data</th>
                <th className="py-3 px-4">Comprador</th>
                <th className="py-3 px-4">Cotas Selecionadas</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações Restritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-violet-700 dark:text-violet-300 block">
                      #{req.id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {req.createdAt}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {req.buyerNameMasked}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {req.buyerPhoneMasked || 'Telefone Protegido'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {req.ticketNumbers.map((num) => (
                        <span
                          key={num}
                          className="px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-mono text-[10px] font-bold border border-violet-200 dark:border-violet-800"
                        >
                          #{String(num).padStart(3, '0')}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {req.quantity} cota(s) × R$ {req.unitPrice.toFixed(2)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    R$ {req.totalExpected.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(req.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {req.proofFileName && (
                      <button
                        type="button"
                        onClick={() => handleOpenRestrictedProof(req)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                      >
                        <Eye className="h-3 w-3 text-violet-500" />
                        <span>Comprovante</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenExceptionModal(req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                    >
                      <ShieldCheck className="h-3 w-3 text-amber-500" />
                      <span>Auditoria</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restricted Proof Inspection Modal */}
      {selectedProofRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Comprovante com Acesso Restrito (LGPD)
                </h4>
              </div>
              <button
                onClick={() => setSelectedProofRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Solicitação:</span>
                <span className="font-mono font-bold">#{selectedProofRequest.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comprador:</span>
                <span className="font-semibold">{selectedProofRequest.buyerNameMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Esperado vs Declarado:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {selectedProofRequest.totalExpected.toFixed(2)} / R$ {(selectedProofRequest.declaredAmount || selectedProofRequest.totalExpected).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Arquivo:</span>
                <span className="font-mono text-[11px] truncate max-w-[200px]">{selectedProofRequest.proofFileName}</span>
              </div>
            </div>

            {/* Proof Image Visual Container with Blur Masking */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 min-h-[200px] flex flex-col items-center justify-center">
              <div className={`transition-all duration-300 w-full flex items-center justify-center ${
                isProofImageRevealed ? 'filter-none' : 'blur-md select-none pointer-events-none'
              }`}>
                {selectedProofRequest.proofImageBase64 ? (
                  <img
                    src={selectedProofRequest.proofImageBase64}
                    alt="Comprovante"
                    className="max-h-64 object-contain rounded-lg"
                  />
                ) : (
                  <div className="p-6 rounded-xl bg-white/10 text-white font-mono text-center text-xs space-y-1">
                    <FileText className="h-10 w-10 mx-auto text-violet-400 mb-2" />
                    <p className="font-bold">COMPROVANTE DE TRANSFERÊNCIA PIX</p>
                    <p className="text-[10px] text-slate-300">Valor: R$ {selectedProofRequest.totalExpected.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-300">Autenticação: {selectedProofRequest.id}-BCB-E2E</p>
                  </div>
                )}
              </div>

              {!isProofImageRevealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center space-y-2">
                  <Lock className="h-6 w-6 text-emerald-400" />
                  <p className="text-xs text-white font-bold">
                    Visualização Protegida por Privacidade
                  </p>
                  <p className="text-[11px] text-slate-300 max-w-xs">
                    Dados bancários de terceiros não são expostos publicamente conforme a LGPD.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsProofImageRevealed(true)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md"
                  >
                    Revelar Imagem para Conferência
                  </button>
                </div>
              )}
            </div>

            {selectedProofRequest.aiAnalysisNotes && (
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-violet-700 dark:text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Conferência da IA & Regras:
                </span>
                <p className="text-[11px] leading-relaxed">
                  {selectedProofRequest.aiAnalysisNotes}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedProofRequest(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
            >
              Fechar Visualizador
            </button>
          </div>
        </div>
      )}

      {/* Formal Controlled Exception Modal */}
      {selectedExceptionRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveControlledException}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Exceção Operacional com Auditoria
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExceptionRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              O organizador <strong>não pode marcar manualmente uma compra como paga</strong> apenas para contornar verificações do sistema. Caso exista uma exceção legítima (ex: compensação comprovada em extrato bancário oficial), registre a justificativa formal abaixo:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Novo Estado da Solicitação:</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as PurchaseRequestStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="PAYMENT_CONFIRMED">Pagamento Confirmado (Aguardando Homologação)</option>
                  <option value="CONFIRMED">Participação Confirmada Definitiva</option>
                  <option value="PAYMENT_INSUFFICIENT">Pagamento Insuficiente</option>
                  <option value="UNDER_REVIEW">Encaminhar para Revisão</option>
                  <option value="CANCELLED">Cancelar Solicitação</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Responsável / Operador:*</label>
                <input
                  type="text"
                  required
                  value={exceptionOperator}
                  onChange={(e) => setExceptionOperator(e.target.value)}
                  placeholder="Nome do Auditor ou Responsável"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Justificativa Formal Registrada:*</label>
                <textarea
                  required
                  rows={3}
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  placeholder="Ex: Conciliado no extrato Santander ref. protocolo bancário #98124, comprovante com valor integral compensado em conta corrente."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedExceptionRequest(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                Gravar Exceção na Auditoria
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
