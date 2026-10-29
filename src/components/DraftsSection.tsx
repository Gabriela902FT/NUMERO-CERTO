/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LotteryDraft } from '../types';
import { 
  FileText, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Calendar, 
  Award, 
  Save, 
  X, 
  HardDrive, 
  AlertCircle,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DraftsSectionProps {
  drafts: LotteryDraft[];
  onSaveDraft: (draft: LotteryDraft) => void;
  onDeleteDraft: (draftId: string) => void;
}

export const DraftsSection: React.FC<DraftsSectionProps> = ({
  drafts,
  onSaveDraft,
  onDeleteDraft,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeDraft, setActiveDraft] = useState<LotteryDraft | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  const startNewDraft = () => {
    setActiveDraft({
      id: `draft-${Date.now()}`,
      title: '',
      description: '',
      mainPrize: '',
      secondaryPrize: '',
      totalNumbers: 1000,
      pricePerTicket: 10.0,
      drawDate: '',
      causeOrBeneficiary: '',
      rulesNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(true);
  };

  const handleEditDraft = (draft: LotteryDraft) => {
    setActiveDraft({ ...draft });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDraft) return;

    if (!activeDraft.title.trim()) {
      toast.error('Por favor, informe o título do sorteio antes de salvar.', 'Campo Obrigatório');
      return;
    }

    const updated: LotteryDraft = {
      ...activeDraft,
      updatedAt: new Date().toISOString(),
    };

    onSaveDraft(updated);
    setIsEditing(false);
    setActiveDraft(null);
  };

  const handleDelete = (id: string) => {
    onDeleteDraft(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 py-4 sm:py-6">
      {/* Header & Local Drafts Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Rascunhos de Sorteio
            </h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-violet-100 dark:bg-violet-950/60 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <HardDrive className="h-3 w-3" />
              LocalStorage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Planeje suas ações antes de qualquer submissão. Os dados ficam salvos exclusivamente no armazenamento do seu dispositivo.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={startNewDraft}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all self-start sm:self-auto min-h-[44px]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Rascunho</span>
          </button>
        )}
      </div>

      {/* Edit / Create Form View */}
      {isEditing && activeDraft && (
        <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeDraft.createdAt === activeDraft.updatedAt ? 'Criar Novo Rascunho' : 'Editar Rascunho'}
            </h3>
            <button
              onClick={() => {
                setIsEditing(false);
                setActiveDraft(null);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Título da Ação / Sorteio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rifa Beneficente do Centro Comunitário"
                  value={activeDraft.title}
                  onChange={(e) => setActiveDraft({ ...activeDraft, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Objetivo / Descrição
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva a finalidade da ação, o que será realizado com os fundos arrecadados..."
                  value={activeDraft.description}
                  onChange={(e) => setActiveDraft({ ...activeDraft, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Prêmio Principal (1º Lugar) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Smart TV 50 polegadas 4K"
                  value={activeDraft.mainPrize}
                  onChange={(e) => setActiveDraft({ ...activeDraft, mainPrize: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Premiação Secundária (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cesta de Café da Manhã Especial"
                  value={activeDraft.secondaryPrize}
                  onChange={(e) => setActiveDraft({ ...activeDraft, secondaryPrize: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Quantidade Total de Bilhetes
                </label>
                <select
                  value={activeDraft.totalNumbers}
                  onChange={(e) => setActiveDraft({ ...activeDraft, totalNumbers: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                >
                  <option value={100}>100 cotas (001 a 100)</option>
                  <option value={250}>250 cotas (001 a 250)</option>
                  <option value={500}>500 cotas (001 a 500)</option>
                  <option value={1000}>1000 cotas (001 a 1000) — Padrão</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Valor Estimado por Cota (R$)
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="1"
                  value={activeDraft.pricePerTicket}
                  onChange={(e) => setActiveDraft({ ...activeDraft, pricePerTicket: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Entidade / Causa Beneficiada
                </label>
                <input
                  type="text"
                  placeholder="Ex: Grêmio Estudantil / Paróquia do Bairro"
                  value={activeDraft.causeOrBeneficiary}
                  onChange={(e) => setActiveDraft({ ...activeDraft, causeOrBeneficiary: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Data Prevista para Apuração
                </label>
                <input
                  type="date"
                  value={activeDraft.drawDate}
                  onChange={(e) => setActiveDraft({ ...activeDraft, drawDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Notas sobre Regras e Apuração
                </label>
                <textarea
                  rows={2}
                  placeholder="Critérios da extração, prazo de entrega do prêmio ao ganhador, canal de atendimento..."
                  value={activeDraft.rulesNotes}
                  onChange={(e) => setActiveDraft({ ...activeDraft, rulesNotes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

            </div>

            {/* Privacy reminder */}
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/40 p-3 text-xs text-violet-800 dark:text-violet-300 flex items-center gap-2">
              <HardDrive className="h-4 w-4 shrink-0 text-violet-500" />
              <span>
                Este rascunho será salvo no <strong>armazenamento local (LocalStorage)</strong> do seu navegador.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setActiveDraft(null);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Rascunho Local</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <FileText className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Nenhum rascunho salvo ainda
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Crie o seu primeiro rascunho para estruturar valores, premiação e regras da sua ação beneficente.
            </p>
            <button
              onClick={startNewDraft}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-sm transition-all min-h-[44px]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Criar Rascunho</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map((draft) => {
              const estimatedGross = (draft.totalNumbers * draft.pricePerTicket).toFixed(2);

              return (
                <div
                  key={draft.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                          {draft.causeOrBeneficiary || 'Rascunho Local'}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {draft.title}
                        </h4>
                      </div>

                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        {draft.totalNumbers} cotas
                      </span>
                    </div>

                    {draft.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {draft.description}
                      </p>
                    )}

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Prêmio: {draft.mainPrize}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Preço: R$ {draft.pricePerTicket.toFixed(2)} / cota</span>
                        <span>Bruto Estimado: R$ {estimatedGross}</span>
                      </div>

                      {draft.drawDate && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                          <Calendar className="h-3 w-3" />
                          <span>Previsão: {draft.drawDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      Atualizado em {new Date(draft.updatedAt).toLocaleDateString('pt-BR')}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditDraft(draft)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/60 transition-colors min-h-[36px]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>

                      {deleteConfirmId === draft.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(draft.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(draft.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Excluir rascunho"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
