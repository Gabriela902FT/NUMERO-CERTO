/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  HelpCircle,
  XCircle,
  Landmark,
  Shield,
  FileCheck2,
  Info
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TERMS_VERSION = 'v1.4-2026';
const STORAGE_KEY = 'numerocerto_terms_acceptance_record';

export const RulesSection: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'organizer' | 'participant' | 'compliance' | 'legal' | 'platform_fee'>('organizer');
  const [acceptedRecord, setAcceptedRecord] = useState<{ acceptedAt: string; version: string } | null>(null);
  const [justAccepted, setJustAccepted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAcceptedRecord(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleAcceptTerms = () => {
    const record = {
      acceptedAt: new Date().toLocaleString('pt-BR'),
      version: TERMS_VERSION,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Ignore
    }
    setAcceptedRecord(record);
    toast.success(
      `Termos e Condições (${TERMS_VERSION}) aceitos com sucesso! Registro salvo no aparelho.`,
      'Aceite Registrado'
    );
  };

  return (
    <div className="space-y-8 py-4 sm:py-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Regras, Transparência & Segurança Jurídica
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Sem letras miúdas. Todas as diretrizes operacionais, direitos dos participantes e responsabilidades dos organizadores são apresentados com tipografia confortável, alto contraste e linguagem acessível.
        </p>
      </div>

      {/* Acceptance Status Banner */}
      <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/60 dark:bg-violet-950/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Termos de Uso e Boas Práticas ({TERMS_VERSION})
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {acceptedRecord ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Aceite registrado neste dispositivo em: <strong>{acceptedRecord.acceptedAt}</strong> (Versão: {acceptedRecord.version}). O aceite formal não substitui autorizações regulatórias legais.
              </span>
            ) : (
              <span>
                Leia com atenção as cláusulas abaixo e registre seu aceite consciente.
              </span>
            )}
          </p>
        </div>

        {!acceptedRecord ? (
          <button
            onClick={handleAcceptTerms}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto min-h-[44px]"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Registrar Aceite dos Termos</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Aceite Registrado</span>
          </div>
        )}
      </div>

      {justAccepted && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-4 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>Aceite registrado localmente com carimbo de data e hora!</span>
        </div>
      )}

      {/* Tab Switcher: Organizer vs Participant vs Compliance */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('organizer')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === 'organizer'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          1. Regras para o Organizador
        </button>
        <button
          onClick={() => setActiveTab('participant')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === 'participant'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          2. Regras para o Participante
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === 'compliance'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          3. Fluxo em Caso de Descumprimento
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap min-h-[44px] flex items-center gap-1.5 ${
            activeTab === 'legal'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>4. Fundamentação Legal</span>
        </button>
        <button
          onClick={() => setActiveTab('platform_fee')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap min-h-[44px] flex items-center gap-1.5 ${
            activeTab === 'platform_fee'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>5. Regras de Taxa & Descumprimento</span>
        </button>
      </div>

      {/* Tab 1: Organizer Rules */}
      {activeTab === 'organizer' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Deveres e Vedações do Organizador
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              O organizador é o promotor responsável pelo sorteio e deve zelar pela fidedignidade da ação perante os participantes e as autoridades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Garantia da Premiação e Transparência
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                O organizador deve possuir previamente ou assegurar formalmente os fundos ou bens descritos como prêmio. É proibido alterar o prêmio ou as condições da apuração após o início da divulgação aos participantes.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Critério de Apuração Auditável
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                O sorteio deve utilizar critérios públicos e independentes, tais como as extrações oficiais da <strong>Loteria Federal</strong> ou da loteria estadual formalmente autorizada, garantindo que o organizador não tenha qualquer controle sobre o resultado.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Enquadramento Legal e Responsabilidade Compartilhada
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                A mera alteração do vocábulo "rifa" para "sorteio" ou "ação entre amigos" não configura regularização automática. A responsabilidade não pode ser imputada unilateralmente nem exime obrigações mútuas de lisura e proteção ao consumidor.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Vedação a Menores e Proteção de Dados
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                É vedada a participação de menores de 18 anos em modalidades que envolvam desembolso financeiro. Os dados dos compradores não podem ser expostos na internet sem anonimização.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Participant Rules */}
      {activeTab === 'participant' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Direitos e Garantias do Participante
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ao adquirir uma cota ou número demonstrativo, o participante tem direito à informação límpida, comprovante nominal e verificação auditável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Identificação Exata da Cota
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Cada cota escolhida (de 001 a 1000) gera comprovante com número, data, hora e vinculação ao nome do participante. O mesmo número não pode ser vendido a duas pessoas distintas.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Prazo e Entrega do Prêmio
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                O contemplado tem direito a receber o prêmio exatamente como anunciado, livre de ônus ou encargos ocultos, no prazo máximo estipulado no regulamento (geralmente até 30 dias corridos).
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Direito de Cancelamento e Reembolso
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Em caso de cancelamento da ação, não realização da extração na data limite ou descumprimento de prazos essenciais, os valores pagos devem ser integralmente restituídos aos participantes.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 space-y-2 border border-slate-200/80 dark:border-slate-700/80">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Privacidade Pessoal (LGPD)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Seus dados telefônicos, endereço e documento completo jamais são expostos publicamente. Somente o primeiro nome com sobrenome abreviado é apresentado no relatório demonstrativo.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Tab 3: Non-compliance & Suspension Flow */}
      {activeTab === 'compliance' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Procedimento em Caso de Denúncia ou Descumprimento
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Fluxo transparente e proporcional para preservação da integridade da plataforma e dos direitos de todos os envolvidos.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div className="space-y-1 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Bloqueio Preventivo Antes da Publicação
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Ações que apresentarem dados cadastrais inconsistentes, produtos proibidos por lei (armas, medicamentos, etc.) ou ausência de enquadramento são bloqueadas antes mesmo da disponibilização dos bilhetes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div className="space-y-1 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Suspensão Imediata e Ocultação para Análise
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Havendo denúncia fundamentada de fraude ou descumprimento de prazos após a divulgação, a ação é imediatamente suspensa e ocultada preventivamente, impedindo novas reservas.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div className="space-y-1 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Preservação de Evidências com Acesso Restrito
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Os registros de bilhetes, transações, comprovantes e logs de auditoria são congelados e preservados de forma inviolável para eventual análise pericial ou apresentação às autoridades competentes.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div className="space-y-1 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Direito de Resposta, Contestação e Medidas Proporcionais
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  É assegurado ao organizador e ao participante o prazo de até 5 (cinco) dias úteis para esclarecimento formal e apresentação de contraprovas, com aplicação de medidas estritamente proporcionais à gravidade do fato apurado.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 4: Fundamentação Legal & Marco Regulatório */}
      {activeTab === 'legal' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-8 shadow-sm">
          
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300">
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Fundamentação Legal & Marco Regulatório
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Legislação federal brasileira, decretos e atos normativos que disciplinam sorteios, promoções comerciais e proteção à economia popular.
                </p>
              </div>
            </div>
          </div>

          {/* Destaque: Orientações Públicas da SPA/MF sobre Rifas */}
          <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <h4 className="text-base font-bold text-amber-900 dark:text-amber-200">
                Orientações Públicas da Secretaria de Prêmios e Apostas do Ministério da Fazenda
              </h4>
            </div>
            
            <div className="space-y-2.5 text-xs sm:text-sm text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
              <p>
                <strong>As rifas são permitidas?</strong> Segundo a orientação pública e formal dos órgãos reguladores federais (gov.br / Ministério da Fazenda), a emissão e venda de bilhetes numerados (rifas) por <strong>pessoas físicas é expressamente vedada pela legislação brasileira</strong>, caracterizando exploração de loteria não autorizada sujeita a sanções civis e penais.
              </p>
              <p>
                <strong>Exceção filantrópica restrita:</strong> Apenas pessoas jurídicas regularmente constituídas e devidamente certificadas no Terceiro Setor (entidades filantrópicas, de assistência social ou de interesse público, nos termos do Art. 4º da Lei nº 5.768/1971 e da Lei nº 13.019/2014) podem requerer <strong>autorização prévia</strong> junto à SPA/MF para a realização de sorteios beneficentes, com destinação integral da renda aos seus objetivos estatutários e prestação de contas obrigatória.
              </p>
              <p>
                <strong>Promoções Comerciais:</strong> Pessoas jurídicas dos setores de comércio, indústria ou serviços podem realizar sorteios vinculados à aquisição de mercadorias ou serviços, exclusivamente mediante autorização prévia, caução prévia dos prêmios e plano de distribuição de prêmios registrado na SPA/MF.
              </p>
            </div>
          </div>

          {/* Cards de Legislação Principal */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span>Legislação de Promoções Comerciais e Sorteios</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Lei 5.768/1971 */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 inline-block mb-1.5">
                      Lei Ordinária Federal
                    </span>
                    <h5 className="font-bold text-base text-slate-900 dark:text-white">
                      Lei nº 5.768, de 20 de dezembro de 1971
                    </h5>
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dispõe sobre a distribuição gratuita de prêmios, mediante sorteio, vale-brinde ou concurso, a título de propaganda, e estabelece normas de proteção à poupança popular.
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700/80 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Artigo 1º:</span>
                    <span>Condiciona qualquer distribuição de prêmios por sorteio à prévia autorização governamental pelo órgão competente.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Artigo 4º:</span>
                    <span>Prevê hipóteses excepcionais de autorização para sociedades civis de fins beneficentes ou filantrópicos com destinação integral de recursos aos fins institucionais.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Artigo 12:</span>
                    <span>Sanciona a realização de operações sem autorização prévia com a perda dos bens prometidos e interdição da atividade.</span>
                  </div>
                </div>
              </div>

              {/* Decreto 70.951/1972 */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 inline-block mb-1.5">
                      Decreto Regulamentador
                    </span>
                    <h5 className="font-bold text-base text-slate-900 dark:text-white">
                      Decreto nº 70.951, de 9 de agosto de 1972
                    </h5>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Regulamenta a Lei nº 5.768/1971, fixando as condições procedimentais, prazos, prestação de contas circunstanciada e penalidades operacionais.
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700/80 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Modalidades:</span>
                    <span>Define sorteio, vale-brinde, concurso e assemelhados, fixando regras para apuração pública e transparente.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Propriedade prévia:</span>
                    <span>Exige comprovação formal de propriedade dos prêmios ou depósito bancário caucionado antes do início da ação.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Artigo 47:</span>
                    <span>Prazo decadencial de 180 (cento e oitenta) dias para resgate de prêmios não reclamados, convertendo o valor ao Tesouro Nacional.</span>
                  </div>
                </div>
              </div>

              {/* Lei 14.790/2023 */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 inline-block mb-1.5">
                      Atualização Legislativa
                    </span>
                    <h5 className="font-bold text-base text-slate-900 dark:text-white">
                      Lei nº 14.790, de 29 de dezembro de 2023
                    </h5>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Moderniza o marco regulatório de loterias e apostas de quota fixa, fortalecendo a governança pública e a integridade de jogos e promoções comerciais.
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700/80 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Competências:</span>
                    <span>Reafirma a competência privativa da União para legislar, autorizar e fiscalizar sorteios e promoções no território nacional.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Fiscalização:</span>
                    <span>Instrumentos rigorosos de monitoramento contra lavagem de dinheiro, fraude e publicidade desleal.</span>
                  </div>
                </div>
              </div>

              {/* Decreto 11.907/2024 e SPA/MF */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 inline-block mb-1.5">
                      Estrutura Administrativa
                    </span>
                    <h5 className="font-bold text-base text-slate-900 dark:text-white">
                      Decreto nº 11.907/2024 e SPA/MF
                    </h5>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Cria formalmente a Secretaria de Prêmios e Apostas no âmbito do Ministério da Fazenda como o órgão central regulador e fiscalizador.
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700/80 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Regulação:</span>
                    <span>Edição de portarias operacionais, autorizações e homologações de sistemas técnicos e de pagamento.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">• Sancionamento:</span>
                    <span>Atuação administrativa direta na apuração de infrações e combate a plataformas irregulares.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Legislação Complementar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Legislação Protetiva Complementar</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">CDC — Lei nº 8.078/1990</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Transparência de regras, veracidade das informações ofertadas e proibição estrita de cláusulas abusivas ou publicidade enganosa.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">LGPD — Lei nº 13.709/2018</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Tratamento estritamente necessário de dados, não exposição pública de telefones ou documentos e direito à privacidade dos participantes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Decreto-Lei nº 3.688/1941</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Lei das Contravenções Penais (Artigos 50 e 51), tipificando a realização clandestina de jogos de azar e rifas não autorizadas.
                </p>
              </div>
            </div>
          </div>

          {/* Declaração de Conformidade do App */}
          <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 p-4 sm:p-5 flex items-start gap-3">
            <Info className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white">
                Compromisso com a Legalidade e Conscientização
              </p>
              <p>
                O <strong>Número Certo</strong> cumpre rigorosamente as normas vigentes, disponibilizando esta fundamentação legal completa e de acesso público para conscientizar organizadores e participantes sobre as exigências regulatórias brasileiras. Todas as regras estão disponíveis em texto aberto, sem links externos opacos ou ocultação de exigências legais.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Tab 5: Regras de Taxa da Plataforma & Descumprimento (REGRAS_DESCUMPRIMENTO_E_TAXA.md) */}
      {activeTab === 'platform_fee' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-8 shadow-sm">
          
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300">
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Regras de Descumprimento & Taxa da Plataforma
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Especificação oficial do protótipo baseada no documento regulatório de integridade e diretrizes econômicas.
                </p>
              </div>
            </div>
          </div>

          {/* Banner de Estado do Documento */}
          <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Estado do Documento:
            </span>
            <p>
              Documento de produto para protótipo. Não é parecer jurídico, autorização governamental ou tarifa comercial vigente. A plataforma opera em modo demonstrativo e educacional.
            </p>
          </div>

          {/* Grid: 4 Princípios Essenciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            
            {/* Bloco 1: Taxa da Plataforma Proposta */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="h-4 w-4 text-violet-600" />
                <span>Taxa da Plataforma — Diretrizes da Proposta</span>
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong>Criação gratuita de rascunhos:</strong> Não é cobrada taxa inicial ou de adesão para planejar ou criar rascunhos.</li>
                <li><strong>Apenas se legalmente viável:</strong> Taxa de serviço prevista unicamente se o modelo for juridicamente validado e homologado pelos órgãos competentes.</li>
                <li><strong>Tabela pública e imutável:</strong> Publicar a tabela e a memória de cálculo antes do organizador aderir; nenhuma taxa é alterada retroativamente.</li>
                <li><strong>Base líquida recebida:</strong> Cobrança calculada exclusivamente sobre valores confirmados e efetivamente liquidados, com desconto de cancelamentos e reembolsos.</li>
                <li><strong>Sem cobrança se não houver receita:</strong> Não há cobrança se a ação não arrecadar fundos elegíveis.</li>
              </ul>
            </div>

            {/* Bloco 2: Regras Visíveis e Acessíveis */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>Transparência & Direitos Legais</span>
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong>Regras separadas e claras:</strong> Mostrar termos distintos para organizadores e participantes em tipografia confortável.</li>
                <li><strong>Sem letras miúdas:</strong> Não esconder penalidades ou cláusulas essenciais em rodapés inacessíveis.</li>
                <li><strong>Registro de aceite:</strong> Armazenar versão, data/hora e ação explícita de aceite local.</li>
                <li><strong>Direitos inalienáveis:</strong> O aceite dos termos não elimina direitos legais do consumidor nem isenta automaticamente a plataforma de obrigações legais.</li>
              </ul>
            </div>

            {/* Bloco 3: Identidade, IMEI e Prêmio */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Identidade, IMEI & Avaliação por IA</span>
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong>Não exigir IMEI:</strong> É vedada a exigência de número IMEI do aparelho celular como condição padrão para participar ou criar sorteios.</li>
                <li><strong>Identidade ≠ Autorização:</strong> A verificação de dados de identidade do organizador não equivale nem substitui autorização legal da SPA/MF.</li>
                <li><strong>Limites da IA:</strong> Análise de fotografia ou IA aponta inconsistências visuais, mas não confirma autenticidade, propriedade nem garante a entrega do prêmio.</li>
                <li><strong>Revisão humana obrigatória:</strong> Previsão de canal de contestação e revisão humana para casos duvidosos.</li>
              </ul>
            </div>

            {/* Bloco 4: Fluxo de Descumprimento */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-600" />
                <span>Fluxo Rigoroso em Descumprimento</span>
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong>Bloqueio prévio:</strong> Impedir publicação em caso de pendência essencial ou produto vedado por lei.</li>
                <li><strong>Suspensão preventiva:</strong> Ocultar a página imediatamente em caso de denúncia fundamentada para cessar novas reservas.</li>
                <li><strong>Preservação probatória:</strong> Não apagar registros; manter logs e bilhetes preservados para perícia ou auditoria pública.</li>
                <li><strong>Privacidade absoluta:</strong> Nunca expor publicamente CPF, documentos ou telefone do organizador ou de compradores.</li>
              </ul>
            </div>

          </div>

          {/* Orientações Públicas SPA/MF */}
          <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              Validação Regulatória Obrigatória (SPA / Ministério da Fazenda):
            </span>
            <p className="leading-relaxed">
              A página oficial da Secretaria de Prêmios e Apostas do Ministério da Fazenda informa que rifas com venda de bilhetes numerados não são admitidas em regra para particulares, descrevendo regimes específicos para entidades beneficentes devidamente autorizadas. Não ativar venda de números, cobrança de participantes, publicação pública ou sorteio final sem confirmação documental prévia por escrito.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
