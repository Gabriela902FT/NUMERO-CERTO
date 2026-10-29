/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calculator, Info, TrendingUp, DollarSign, ShieldAlert, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface SimulatorSectionProps {
  onNavigateToAiEval?: () => void;
}

export const SimulatorSection: React.FC<SimulatorSectionProps> = ({ onNavigateToAiEval }) => {
  const [totalTickets, setTotalTickets] = useState<number>(120);
  const [ticketPrice, setTicketPrice] = useState<number>(10.0);
  const [prizeCost, setPrizeCost] = useState<number>(300.0);
  const [refunds, setRefunds] = useState<number>(0.0);
  const [feeMode, setFeeMode] = useState<'progressive' | 'percentage'>('progressive');
  const [feeRate, setFeeRate] = useState<number>(7.5); // 7.5%

  const grossRevenue = totalTickets * ticketPrice;
  const netAfterRefunds = Math.max(0, grossRevenue - refunds);

  // Progressive tier fee calculation from Android Etapa 3 (MainActivity.kt):
  // < 200 -> 0.0
  // < 500 -> 10.0
  // < 1000 -> 20.0
  // >= 1000 -> 20.0 + ((net - 1000.0) * 0.01).coerceAtMost(80.0)
  const calculateProgressiveFee = (net: number) => {
    if (net < 200.0) return { fee: 0.0, tierName: 'Isento (< R$ 200)' };
    if (net < 500.0) return { fee: 10.0, tierName: 'Faixa 1: R$ 10,00 fixos' };
    if (net < 1000.0) return { fee: 20.0, tierName: 'Faixa 2: R$ 20,00 fixos' };
    const excess = net - 1000.0;
    const variable = Math.min(80.0, excess * 0.01);
    return { fee: 20.0 + variable, tierName: 'Faixa 3: R$ 20 + 1% excedente (teto R$ 80)' };
  };

  const progressiveResult = calculateProgressiveFee(netAfterRefunds);
  const platformFee = feeMode === 'progressive' 
    ? progressiveResult.fee 
    : (netAfterRefunds * feeRate) / 100;

  const netSurplus = Math.max(0, netAfterRefunds - prizeCost - platformFee);
  const marginPercent = grossRevenue > 0 ? ((netSurplus / grossRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 py-4 sm:py-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Simulador Ilustrativo de Taxas e Repasses
          </h2>
          <span className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            Apenas Simulação
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Calcule a estimativa de arrecadação bruta, cancelamentos/reembolsos, premiação e taxa de serviço hipotética da plataforma com base nas regras do projeto.
        </p>
      </div>

      {/* Warning Alert */}
      <div className="rounded-xl border border-amber-300/80 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          Nota Regulatória sobre Taxas (Conforme Documento REGRAS_DESCUMPRIMENTO_E_TAXA.md)
        </p>
        <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
          O cálculo abaixo reflete simulação matemática local. Nenhuma taxa real é cobrada nesta plataforma. Qualquer eventual cobrança futura dependerá de enquadramento legal, regulamentação aplicável e tabela pública aprovada pelo órgão regulador.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Input Parameters Column */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span>Parâmetros da Ação</span>
          </h3>

          <div className="space-y-4">
            
            {/* Total Numbers */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-slate-700 dark:text-slate-300">Cotas Efetivamente Pagas</label>
                <span className="font-mono text-violet-600 dark:text-violet-400 font-bold">{totalTickets} cotas</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[50, 120, 250, 500].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTotalTickets(num)}
                    className={`py-2 text-xs font-bold font-mono rounded-lg border transition-all min-h-[38px] ${
                      totalTickets === num
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                max="1000"
                value={totalTickets}
                onChange={(e) => setTotalTickets(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Ou digite o número de cotas"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                * Não conte números apenas selecionados ou reservados — informe apenas cotas pagas.
              </p>
            </div>

            {/* Price Per Ticket */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <label className="text-slate-700 dark:text-slate-300">Valor por Cota (R$)</label>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  R$ {ticketPrice.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>R$ 1,00</span>
                <span>R$ 50,00</span>
                <span>R$ 100,00</span>
              </div>
            </div>

            {/* Refunds / Cancellations */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Cancelamentos / Reembolsos (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={refunds}
                  onChange={(e) => setRefunds(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Descontados antes de calcular a taxa da plataforma e o repasse ao organizador.
              </p>
            </div>

            {/* Prize Cost */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Custo Estimado do Prêmio (R$)
                </label>
                {onNavigateToAiEval && (
                  <button
                    type="button"
                    onClick={onNavigateToAiEval}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Avaliar Prêmio com IA</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={prizeCost}
                  onChange={(e) => setPrizeCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Valor desembolsado pelo organizador para aquisição do prêmio a ser entregue.
              </p>
            </div>

            {/* Fee Calculation Mode Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Fórmula de Simulação de Taxa
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFeeMode('progressive')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    feeMode === 'progressive'
                      ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-bold">Faixas Progressivas</p>
                  <p className="text-[10px] opacity-80">Conforme código Android Etapa 3</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFeeMode('percentage')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    feeMode === 'percentage'
                      ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-bold">Percentual Fixo</p>
                  <p className="text-[10px] opacity-80">Ex: 5%, 7.5% ou 10%</p>
                </button>
              </div>

              {feeMode === 'percentage' && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[5.0, 7.5, 10.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFeeRate(rate)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        feeRate === rate
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Results & Demonstrative Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/60 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Demonstrativo Financeiro Estimado</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Margem Líquida ~{marginPercent}%
              </span>
            </h3>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              
              <div className="flex justify-between items-center py-2 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-sans">
                  Arrecadação Bruta ({totalTickets} cotas × R$ {ticketPrice.toFixed(2)})
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {refunds > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-200/80 dark:border-slate-800 text-slate-500">
                  <span className="font-sans">(-) Cancelamentos / Reembolsos</span>
                  <span className="font-bold tabular-nums">
                    - R$ {refunds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="font-sans font-semibold">(=) Base Efetiva Arrecadada</span>
                <span className="font-bold tabular-nums">
                  R$ {netAfterRefunds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200/80 dark:border-slate-800 text-amber-600 dark:text-amber-400">
                <div className="font-sans">
                  <span>(-) Taxa Simulada da Plataforma</span>
                  {feeMode === 'progressive' && (
                    <span className="block text-[10px] text-amber-700/80 dark:text-amber-400/80">
                      {progressiveResult.tierName}
                    </span>
                  )}
                </div>
                <span className="font-bold tabular-nums">
                  - R$ {platformFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200/80 dark:border-slate-800 text-red-600 dark:text-red-400">
                <span className="font-sans">(-) Custo Estimado do Prêmio</span>
                <span className="font-bold tabular-nums">
                  - R$ {prizeCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                <span className="font-sans text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Saldo Líquido para a Causa/Organizador
                </span>
                <span className="font-mono tabular-nums">
                  R$ {netSurplus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Com <strong>{totalTickets} cotas pagas</strong> a <strong>R$ {ticketPrice.toFixed(2)}</strong>, o valor arrecadado líquido de taxas e prêmios resulta em aproximadamente <strong>R$ {netSurplus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> destinados ao propósito comunitário.
            </div>
          </div>

          {/* Reference Tiers Card from Android Etapa 3 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Regras da Simulação Progressiva (Android Etapa 3)</span>
              <Info className="h-4 w-4 text-slate-400" />
            </h4>
            
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 font-sans">
              <li><strong>Até R$ 200:</strong> Isento na simulação (R$ 0,00 de taxa).</li>
              <li><strong>R$ 200 a R$ 499:</strong> R$ 10,00 fixos.</li>
              <li><strong>R$ 500 a R$ 999:</strong> R$ 20,00 fixos.</li>
              <li><strong>A partir de R$ 1.000:</strong> R$ 20,00 + 1% sobre o excedente (teto de R$ 80,00).</li>
            </ul>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              * Valores meramente ilustrativos. Não há transação bancária real em execução neste protótipo.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

