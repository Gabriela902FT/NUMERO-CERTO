/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DEMO_PAST_RESULTS, DEMO_ACTION } from '../data/mockData';
import { 
  Award, 
  Search, 
  CheckCircle2, 
  Calendar, 
  FileCheck, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  Share2,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { SocialShareModal, WinnerShareData } from './SocialShareModal';

export const ResultsSection: React.FC = () => {
  const [checkTicketNumber, setCheckTicketNumber] = useState('');
  const [checkResult, setCheckResult] = useState<{
    status: 'winning' | 'non_winning' | 'not_found';
    message: string;
    details?: string;
    winningData?: WinnerShareData;
  } | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<WinnerShareData | undefined>(undefined);

  const handleOpenShare = (data?: WinnerShareData) => {
    if (data) {
      setShareModalData(data);
    } else {
      // Default to Edição 03
      setShareModalData({
        edition: 'Edição 03 — Campanha Inverno Solidário',
        winningNumber: '427',
        winnerMasked: 'Mariana C. (***.451.890-**)',
        prize: 'Notebook Dell Inspiron 15',
        date: '15 de Julho de 2026',
        federalLotteryContest: 'Concurso Federal nº 5.892 (1º Prêmio: 84.427)',
      });
    }
    setIsShareModalOpen(true);
  };

  const handleCheckTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const query = checkTicketNumber.trim();
    if (!query) return;

    const formatted = query.padStart(3, '0');
    
    // Check against past winner 427
    if (formatted === '427') {
      const winningData: WinnerShareData = {
        edition: 'Edição 03 — Campanha Inverno Solidário',
        winningNumber: '427',
        winnerMasked: 'Mariana C. (***.451.890-**)',
        prize: 'Notebook Dell Inspiron 15',
        date: '15 de Julho de 2026',
        federalLotteryContest: 'Concurso Federal nº 5.892 (1º Prêmio: 84.427)',
      };
      setCheckResult({
        status: 'winning',
        message: `Parabéns! O bilhete ${formatted} foi contemplado na Edição 03!`,
        details: 'Prêmio: Notebook Dell Inspiron 15 (Auditado pelo Concurso Federal nº 5.892).',
        winningData,
      });
    } else if (formatted === '089') {
      const winningData: WinnerShareData = {
        edition: 'Edição 02 — Reforma da Biblioteca Infantil',
        winningNumber: '089',
        winnerMasked: 'Rodrigo S. (***.112.983-**)',
        prize: 'Smartphone Samsung Galaxy S23',
        date: '10 de Abril de 2026',
        federalLotteryContest: 'Concurso Federal nº 5.864 (1º Prêmio: 32.089)',
      };
      setCheckResult({
        status: 'winning',
        message: `Parabéns! O bilhete ${formatted} foi contemplado na Edição 02!`,
        details: 'Prêmio: Smartphone Samsung Galaxy S23 (Auditado pelo Concurso Federal nº 5.864).',
        winningData,
      });
    } else {
      const num = parseInt(query, 10);
      if (num >= 1 && num <= 1000) {
        setCheckResult({
          status: 'non_winning',
          message: `O bilhete ${formatted} é válido no sistema demonstrativo.`,
          details: 'Não foi contemplado nas edições encerradas consultadas.',
        });
      } else {
        setCheckResult({
          status: 'not_found',
          message: `Número ${query} fora da faixa permitida (001 a 1000).`,
          details: 'Por favor, consulte um número válido de três dígitos.',
        });
      }
    }
  };

  return (
    <div className="space-y-8 py-4 sm:py-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Apuração & Resultados Demonstrativos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Consulte o método auditável baseado nos dígitos da extração oficial da Loteria Federal do Brasil e gere cards de divulgação para redes sociais.
          </p>
        </div>

        {/* Global Share Button */}
        <button
          type="button"
          onClick={() => handleOpenShare()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto shrink-0 min-h-[44px]"
        >
          <Share2 className="h-4 w-4" />
          <span>Divulgar Ganhador (Gerar Imagem)</span>
        </button>
      </div>

      {/* Ticket Verification Tool */}
      <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Validador de Bilhete
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Verificar se Meu Número Foi Contemplado
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Digite o número da sua cota (ex: 427, 089 ou qualquer número entre 001 e 1000):
          </p>
        </div>

        <form onSubmit={handleCheckTicket} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={4}
              placeholder="Ex: 427"
              value={checkTicketNumber}
              onChange={(e) => setCheckTicketNumber(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
          >
            <Search className="h-4 w-4" />
            <span>Consultar Bilhete</span>
          </button>
        </form>

        {checkResult && (
          <div
            className={`rounded-2xl p-4 sm:p-5 border text-xs sm:text-sm space-y-3 animate-in fade-in duration-200 ${
              checkResult.status === 'winning'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : checkResult.status === 'non_winning'
                ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              {checkResult.status === 'winning' ? (
                <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-slate-500 shrink-0" />
              )}
              <span>{checkResult.message}</span>
            </div>
            
            {checkResult.details && (
              <p className="text-xs opacity-90 pl-7">{checkResult.details}</p>
            )}

            {/* If ticket is a winner, offer immediate social card generation */}
            {checkResult.status === 'winning' && checkResult.winningData && (
              <div className="pl-7 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenShare(checkResult.winningData)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all min-h-[38px]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Gerar & Compartilhar Card Deste Ganhador</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How Auditing Works */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span>Como Funciona o Critério Oficial de Apuração</span>
        </div>
        
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Para garantir 100% de isenção e imparcialidade, o número vencedor é atrelado ao resultado oficial do <strong>1º Prêmio da Loteria Federal</strong>. Como a grade opera de 001 a 1000, consideram-se os 3 últimos dígitos da milhar sorteada (ou 1000 caso os 3 dígitos finais correspondam a 000).
        </p>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
          <div className="text-slate-500">Exemplo Ilustrativo de Extração:</div>
          <div className="text-slate-800 dark:text-slate-200 font-bold">
            1º Prêmio da Loteria Federal: <span className="text-violet-600 dark:text-violet-400">84.427</span>
          </div>
          <div className="text-emerald-600 dark:text-emerald-400 font-bold">
            → Número Contemplado no Número Certo: 427
          </div>
        </div>
      </div>

      {/* Regra de Imutabilidade dos Dados do Ganhador */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Imutabilidade dos Dados do Ganhador & Integridade do Resultado</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
            Lei nº 5.768/1971 · Art. 4º
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Após a apuração oficial e identificação do contemplado, <strong>o sistema não permite ao organizador alterar, substituir ou excluir os dados do ganhador</strong>. Essa salvaguarda garante a proteção contra fraudes, assegura o direito do participante contemplado e impede a adulteração silenciosa do histórico.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">1. Sem Alteração Livre</span>
            <p className="text-slate-500 dark:text-slate-400 leading-tight">
              O organizador não possui botões ou formulários para substituir o ganhador arbitrariamente.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">2. Trilha de Auditoria</span>
            <p className="text-slate-500 dark:text-slate-400 leading-tight">
              Eventuais retificações materiais exigem procedimento formal, justificativa, data e responsável gravados.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">3. Proteção LGPD</span>
            <p className="text-slate-500 dark:text-slate-400 leading-tight">
              CPF, telefone e dados privados são mascarados e nunca expostos publicamente.
            </p>
          </div>
        </div>
      </div>

      {/* Demonstrative Past Editions with Social Share Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Histórico Demonstrativo de Ações Anteriores
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Clique em "Compartilhar" para gerar o card
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_PAST_RESULTS.map((res) => {
            const resultData: WinnerShareData = {
              edition: res.edition,
              winningNumber: res.winningNumber,
              winnerMasked: res.winnerMasked,
              prize: res.prizeDelivered,
              date: res.date,
              federalLotteryContest: res.federalLotteryContest,
            };

            return (
              <div
                key={res.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">{res.date}</span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {res.edition}
                      </h4>
                    </div>
                    <div className="rounded-xl bg-violet-600 text-white px-3 py-1 text-center font-mono font-extrabold text-sm shadow-xs">
                      #{res.winningNumber}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1 text-xs border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ganhador:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{res.winnerMasked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Prêmio Entregue:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{res.prizeDelivered}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Auditoria:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{res.auditStatus}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Critério: {res.federalLotteryContest}
                  </p>
                </div>

                {/* Social Share Action Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOpenShare(resultData)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-bold text-xs border border-violet-200 dark:border-violet-800 transition-all min-h-[38px]"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Compartilhar & Gerar Imagem do Ganhador</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Social Share & Image Generation Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialData={shareModalData}
      />

    </div>
  );
};

