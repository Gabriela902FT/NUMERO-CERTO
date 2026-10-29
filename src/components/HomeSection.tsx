/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveSection, LotteryAction } from '../types';
import { APP_LOGO_SRC } from '../data/mockData';
import { 
  Sparkles, 
  Ticket as TicketIcon, 
  Calculator, 
  ShieldCheck, 
  FileEdit, 
  Award, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Heart,
  MessageSquare,
  Bell,
  Scale,
  Search,
  History
} from 'lucide-react';

interface HomeSectionProps {
  activeAction: LotteryAction;
  setActiveSection: (section: ActiveSection) => void;
  selectedTicketsCount: number;
  onOpenDonationModal?: () => void;
  onOpenNotifications?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  activeAction,
  setActiveSection,
  selectedTicketsCount,
  onOpenDonationModal,
  onOpenNotifications,
}) => {
  const percentFilled = Math.round(
    ((activeAction.reservedCount + activeAction.paidCount) / activeAction.totalNumbers) * 100
  );

  return (
    <div className="space-y-10 py-6 sm:py-8">
      
      {/* Notice Banner: Demonstrative Mode */}
      <div className="rounded-xl border border-amber-300/60 bg-amber-50/90 p-4 dark:border-amber-700/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs sm:text-sm">
            <p className="font-semibold">
              Ambiente de Demonstração e Transparência Regulamentar
            </p>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
              O <strong>Número Certo</strong> opera neste ambiente em modo de simulação técnica e arquitetura de regras. Não há intermediação financeira, venda com moeda real ou sorteios com valor monetário até a obtenção das autorizações formais junto aos órgãos reguladores competentes.
            </p>
            <button
              onClick={() => setActiveSection('transparency')}
              className="inline-flex items-center gap-1 font-bold text-violet-700 dark:text-violet-300 hover:underline pt-1 text-xs"
            >
              <span>Consultar Área de Transparência & Situação Regulatória</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Showcase with Official App Icon */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-violet-800/40">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-800/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 border border-violet-700/60">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Identidade Roxo & Verde-Menta</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Número Certo
              </h1>
              <p className="text-lg sm:text-xl font-medium text-violet-200">
                Gestão transparente e demonstrativa para sorteios organizados.
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Desenvolvido com foco em regras claras, sem letras miúdas, separação rigorosa de papéis, simulação de taxas e controle seguro de bilhetes numerados de 001 a 1000.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveSection('numbers')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all min-h-[44px]"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Explorar Grade 001 a 1000</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveSection('prize-eval')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all min-h-[44px]"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Avaliar Prêmio com IA</span>
              </button>

              <button
                onClick={() => setActiveSection('simulator')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-950/80 hover:bg-violet-900 border border-violet-700/80 text-white font-semibold text-sm transition-all min-h-[44px]"
              >
                <Calculator className="h-4 w-4 text-violet-300" />
                <span>Simulador de Taxas</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual with App Icon */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-600 via-emerald-400 to-indigo-600 opacity-70 blur-xl group-hover:opacity-100 transition duration-1000" />
              <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 p-4 border border-violet-500/30 shadow-2xl flex flex-col items-center">
                <img
                  src={APP_LOGO_SRC}
                  alt="Logotipo e Ícone do Aplicativo Número Certo"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl shadow-inner transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-3 text-center">
                  <span className="text-xs font-mono font-medium tracking-widest uppercase text-emerald-400">
                    Ícone Oficial do Aplicativo
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Featured Demonstrative Campaign Card */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Sorteio em Demonstração Ativa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Exemplo prático de uma ação com cotas de 001 a 1000 e regras públicas
            </p>
          </div>

          <button
            onClick={() => setActiveSection('drafts')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline self-start sm:self-auto"
          >
            <FileEdit className="h-4 w-4" />
            <span>Gerenciar Meus Rascunhos</span>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/90 p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  {activeAction.causeOrBeneficiary}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {activeAction.drawDate}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {activeAction.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeAction.description}
              </p>

              {/* Prizes Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/40 p-3.5 border border-violet-100 dark:border-violet-900/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
                    <Award className="h-4 w-4 text-emerald-500" />
                    <span>Prêmio Principal (1º Lugar)</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeAction.mainPrize}
                  </p>
                </div>

                {activeAction.secondaryPrize && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Premiação Secundária</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeAction.secondaryPrize}
                    </p>
                  </div>
                )}
              </div>

              {/* Method Transparency */}
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Critério de Apuração: </span>
                {activeAction.drawMethod}
              </div>
            </div>

            {/* Right Column: Numbers Progress & Quick Action */}
            <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-6 space-y-4">
              
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Preço da Cota
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    R$ {activeAction.pricePerTicket.toFixed(2)}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    <span>Ocupação Demonstrativa</span>
                    <span className="font-bold tabular-nums">{percentFilled}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2 text-center">
                    <span className="block text-slate-400 text-[10px]">Reservados/Pagos</span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {activeAction.reservedCount + activeAction.paidCount} / {activeAction.totalNumbers}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2 text-center">
                    <span className="block text-slate-400 text-[10px]">Disponíveis</span>
                    <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {activeAction.totalNumbers - (activeAction.reservedCount + activeAction.paidCount)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveSection('numbers')}
                className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Escolher Meus Números</span>
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* AI Prize Valuation Feature Callout Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Nova Ferramenta de Precisão & Transparência</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Avalie seu Prêmio por Fotografia com IA
            </h3>
            <p className="text-xs sm:text-sm text-violet-100 leading-relaxed">
              Tire uma foto com a câmera do celular ou selecione da galeria. A IA identifica a categoria, marca e modelo, estima o valor de mercado (diferenciando preço de vitrine de valor praticado) e calcula o ponto de equilíbrio no simulador financeiro.
            </p>
          </div>

          <button
            onClick={() => setActiveSection('prize-eval')}
            className="self-start md:self-center shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-violet-800 hover:bg-violet-50 font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span>Iniciar Avaliação com IA</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hub de Ações & Navegação Organizada (Requisito: Seção 3 do Prompt Mestre) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Central de Ações Rápidas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Acesso direto às funcionalidades de participação, organização, auditoria e suporte
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Selecionar Números */}
          <button
            onClick={() => setActiveSection('numbers')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 group-hover:scale-105 transition-transform">
                <TicketIcon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Selecionar Números
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Grade de 001 a 1000 com seleção múltipla, reservas e cálculo determinístico.
              </p>
            </div>
          </button>

          {/* Card 2: Acompanhar Minhas Participações */}
          <button
            onClick={() => setActiveSection('my-tickets')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Minhas Participações
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Acompanhe o status do Pix, comprovantes anexados e cotas garantidas.
              </p>
            </div>
          </button>

          {/* Card 3: Avaliar com IA */}
          <button
            onClick={() => setActiveSection('prize-eval')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                NumeroCerto AI (Prêmio)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Fotografe o produto com a câmera do celular e estime a faixa de valor de mercado.
              </p>
            </div>
          </button>

          {/* Card 4: Simulador de Custos */}
          <button
            onClick={() => setActiveSection('simulator')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
                <Calculator className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Simulador Financeiro
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Simule cenários de cotas, despesas, ponto de equilíbrio e saldo matemático.
              </p>
            </div>
          </button>

          {/* Card 5: Organizar Sorteio */}
          <button
            onClick={() => setActiveSection('drafts')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 group-hover:scale-105 transition-transform">
                <FileEdit className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Organizar Sorteio (Rascunhos)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Cadastre regras, configure seu Pix recebedor e gerencie solicitações.
              </p>
            </div>
          </button>

          {/* Card 6: Resultados & Apuração */}
          <button
            onClick={() => setActiveSection('results')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Histórico & Apuração
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Resultados imutáveis atrelados ao 1º prêmio oficial da Loteria Federal.
              </p>
            </div>
          </button>

          {/* Card 7: Transparência & Segurança */}
          <button
            onClick={() => setActiveSection('transparency')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Transparência & Legislação
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Checklist da SPA/MF, Lei nº 5.768/1971 e consulta pública de pedidos.
              </p>
            </div>
          </button>

          {/* Card 8: Contribuição Voluntária */}
          <button
            onClick={() => onOpenDonationModal ? onOpenDonationModal() : setActiveSection('home')}
            className="group text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-400 hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 group-hover:scale-105 transition-transform">
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Apoiar o NumeroCerto
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Contribuição voluntária opcional de R$ 10 via Pix para manter o projeto.
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* 4 Architectural Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 space-y-2">
          <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            01
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Grade 001 a 1000
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Navegação ágil com busca instantânea de números, ferramenta surpresinha e visualização de disponibilidade.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 space-y-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            02
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Rascunhos Locais
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Crie, edite e organize sorteios salvos com segurança no armazenamento do seu dispositivo, sem servidores ocultos.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 space-y-2">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            03
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Simulador Ilustrativo
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Calcule custos, estimativas de premiação e taxas de serviço de forma transparente antes de qualquer compromisso.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 space-y-2">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            04
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Transparência & LGPD
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Regras visíveis em fontes confortáveis, termos com carimbo de aceite e preservação total da privacidade dos dados.
          </p>
        </div>

      </div>

    </div>
  );
};
