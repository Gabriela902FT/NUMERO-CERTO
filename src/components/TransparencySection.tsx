/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  BookOpen, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Info, 
  Building, 
  CheckCircle2, 
  Clock, 
  Scale, 
  HelpCircle,
  Lock,
  Image as ImageIcon,
  Eye,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CHECKLIST_STORAGE_KEY = 'numerocerto_regulatory_checklist_v1';

interface RegulatoryCheckItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

const DEFAULT_CHECKLIST: RegulatoryCheckItem[] = [
  {
    id: 'spa_mf',
    label: 'Resposta formal da SPA / Ministério da Fazenda',
    description: 'Obter resposta escrita da Secretaria de Prêmios e Apostas sobre o modelo de plataforma intermediadora para sorteios criados por terceiros.',
    completed: false,
  },
  {
    id: 'loteria_mg',
    label: 'Consulta à Loteria do Estado de Minas Gerais',
    description: 'Consultar formalmente sobre parcerias, utilização de dados públicos, licença de uso de marca e eventual integração técnica.',
    completed: false,
  },
  {
    id: 'modalidades',
    label: 'Definição de modalidades e responsabilidade legal',
    description: 'Confirmar se cada modalidade precisa de autorização prévia e quem é formalmente responsável por solicitá-la.',
    completed: false,
  },
  {
    id: 'assessoria_juridica',
    label: 'Parecer com especialista em loterias e promoções',
    description: 'Consultar assessoria jurídica especializada em promoções comerciais, terceiro setor e plataformas digitais.',
    completed: false,
  },
  {
    id: 'compliance_lgpd',
    label: 'Obrigações de compliance, PLD, CDC e LGPD',
    description: 'Confirmar obrigações de identificação, prevenção a fraude, proteção do consumidor, retenção segura e minimização de dados.',
    completed: false,
  },
  {
    id: 'empresa_cnaes',
    label: 'Constituição societária, CNAEs e contratos de meios de pagamento',
    description: 'Definir CNPJ, enquadramento de CNAEs para intermediação tecnológica, termos contratuais com provedor e homologação bancária.',
    completed: false,
  },
];

export const TransparencySection: React.FC = () => {
  const { toast } = useToast();

  const [checklist, setChecklist] = useState<RegulatoryCheckItem[]>(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_CHECKLIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
    } catch {
      // Ignore
    }
  }, [checklist]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.completed;
          toast.info(
            `Item regulatório marcado como: ${next ? 'Concluído' : 'Pendente'}.`,
            'Roteiro Regulatório'
          );
          return { ...item, completed: next };
        }
        return item;
      })
    );
  };

  const completedCount = checklist.filter((c) => c.completed).length;

  return (
    <div className="space-y-8 py-4 sm:py-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2.5">
          <Shield className="h-7 w-7 text-violet-600 dark:text-violet-400" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Área de Transparência & Situação Regulatória
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Informações completas sobre a situação legal do protótipo, ausência de parcerias fictícias e roteiro para homologação definitiva conforme normas da Secretaria de Prêmios e Apostas (SPA/MF).
        </p>
      </div>

      {/* Main Status Grid (from TransparencyScreen & RODAPE_MODELO.md) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Item 1: Desenvolvedor */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Desenvolvedor
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Projeto Independente em Fase de Protótipo
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Desenvolvido por <strong>Gabriela Teixeira</strong>. Razão social definitiva e CNPJ da operadora serão informados e publicados apenas após enquadramento e constituição societária formal.
          </p>
        </div>

        {/* Item 2: Loteria Mineira */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Loteria Mineira
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Nenhuma Parceria Confirmada
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Não há contrato, autorização ou parceria oficial com a Loteria do Estado de Minas Gerais nesta versão. É expressamente vedado sugerir vínculo sem documento formal válido.
          </p>
        </div>

        {/* Item 3: Autorizações */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Autorizações Oficiais
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Aguardando Orientação Formal
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Nenhum documento autorizativo está publicado neste momento. Esta seção será atualizada com link público somente após confirmação documental com divulgação legal autorizada.
          </p>
        </div>

        {/* Item 4: Resultados */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Resultados & Apuração
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Modo Simulado / Demonstrativo
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Esta versão não consulta nem reproduz resultados oficiais em tempo real para pagamentos monetários. Nenhum sorteio com dinheiro real é operado.
          </p>
        </div>

        {/* Item 5: Termos e Privacidade */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Privacidade & LGPD
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Dados Locais & Proteção Ativa
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Nunca exibimos CPF, endereço, telefone ou dados bancários em páginas públicas. O aceite de termos registra data e hora, sem eliminar direitos legais.
          </p>
        </div>

        {/* Item 6: Responsabilidade Compartilhada */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Responsabilidade
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Sem Letras Miúdas
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            A responsabilidade não pode ser atribuída unilateralmente ao organizador nem à plataforma. Ambos devem respeitar as obrigações mútuas de boa-fé e transparência.
          </p>
        </div>

      </div>

      {/* Espaço para Autorização Futura (Requirement from CADASTRO / RODAPE_MODELO) */}
      <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold text-sm">
          <Scale className="h-5 w-5 text-emerald-500" />
          <span>Espaço Reservado para Divulgação de Autorização Futura</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Quando existir documento autorizativo formalmente homologado pelo poder público, esta área exibirá com transparência e link auditável os seguintes metadados oficiais:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-sans block">Órgão Emissor</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">[Aguardando Homologação]</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-sans block">Número e Data</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Proc. Nº --/----</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-sans block">Escopo Autorizado</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Campanhas Beneficentes</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-sans block">Validade & Condições</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Em conformidade com a Lei</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          * A publicação respeitará a privacidade: jamais serão divulgados e-mails integrais ou informações com dados pessoais sensíveis ou de restrição legal.
        </p>
      </div>

      {/* Roteiro Regulatório Interativo (from ROTEIRO_REGULATORIO.md) */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              <span>Checklist do Roteiro Regulatório</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Etapas indispensáveis a serem cumpridas antes da ativação de qualquer sorteio com cobrança real.
            </p>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300">
            {completedCount} de {checklist.length} concluídos
          </span>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                item.completed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">
                {item.completed ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5 text-slate-400" />
                )}
              </div>

              <div className="space-y-0.5">
                <h4 className={`text-xs sm:text-sm font-bold ${item.completed ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-85' : 'text-slate-900 dark:text-white'}`}>
                  {item.label}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fontes Oficiais para Consulta Regulamentar (Somente Legislação Escrita - Sem Links Externos) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span>Fontes Oficiais para Consulta Regulamentar</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Orientações públicas da Secretaria de Prêmios e Apostas do Ministério da Fazenda sobre rifas e promoções comerciais:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* As rifas são permitidas? */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  As rifas são permitidas?
                </span>
                <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                  gov.br / Ministério da Fazenda
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                Orientações
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Segundo as orientações públicas da Secretaria de Prêmios e Apostas do Ministério da Fazenda, a arrecadação de recursos mediante venda de bilhetes numerados (rifas) por pessoas físicas é vedada pela legislação brasileira. Apenas pessoas jurídicas sem fins lucrativos que atendam aos requisitos legais podem pleitear autorização formal prévia para sorteios filantrópicos.
            </p>
          </div>

          {/* Legislação de Promoções Comerciais */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  Legislação de Promoções Comerciais
                </span>
                <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                  Lei nº 5.768/1971 e Decretos
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                Base Legal
              </span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed list-disc list-inside">
              <li>
                <strong>Lei Federal nº 5.768, de 20 de dezembro de 1971:</strong> Dispõe sobre a distribuição gratuita de prêmios, mediante sorteio, vale-brinde ou concurso, a título de propaganda, e estabelece normas de proteção à poupança popular.
              </li>
              <li>
                <strong>Decreto Federal nº 70.951, de 9 de agosto de 1972:</strong> Regulamenta a Lei nº 5.768/1971 e estabelece as regras de autorização e fiscalização de promoções e sorteios.
              </li>
              <li>
                <strong>Lei Federal nº 14.790, de 29 de dezembro de 2023:</strong> Disciplina as competências da Secretaria de Prêmios e Apostas do Ministério da Fazenda (SPA/MF).
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
