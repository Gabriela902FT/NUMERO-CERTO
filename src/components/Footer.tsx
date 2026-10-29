/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveSection } from '../types';
import { APP_LOGO_SRC } from '../data/mockData';
import { Shield, FileText, Calculator, Info, Heart } from 'lucide-react';

interface FooterProps {
  setActiveSection: (section: ActiveSection) => void;
  onOpenDonationModal?: (view?: 'invite' | 'pix_details') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveSection, onOpenDonationModal }) => {
  return (
    <footer className="mt-auto border-t border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={APP_LOGO_SRC}
                alt="Número Certo Logo"
                className="h-8 w-8 rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Número Certo — Sorteios
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Plataforma em modelo demonstrativo e educacional para gestão transparente de números e sorteios comunitários. Todas as operações financeiras reais exigem enquadramento legal nos termos da legislação brasileira vigente.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Ambiente de Demonstração
              </span>
              <span>·</span>
              <span>Dados 100% Locais</span>
              <span>·</span>
              <span>Em Conformidade com a LGPD</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Navegação
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => setActiveSection('numbers')}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Grade de Números (001 a 1000)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('my-tickets')}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium text-violet-700 dark:text-violet-300"
                >
                  Minhas Participações & Rastreamento
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('drafts')}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Rascunhos Locais
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('simulator')}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Simulador de Taxas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('results')}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Apuração & Auditoria
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Transparency */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Transparência & Regras
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => setActiveSection('rules')}
                  className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Regras do Organizador
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('rules')}
                  className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Regras do Participante
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('transparency')}
                  className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Transparência & Roteiro Legal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('organizer')}
                  className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                  Perfil & Dados Financeiros (Pix)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Provisory Prototype Legal Disclaimer from RODAPE_MODELO.md */}
        <div className="py-4 px-4 my-2 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
            Rodapé — Texto Provisório do Protótipo (Conformidade Regulatória):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Desenvolvedor:</span>
              <span>Projeto independente em fase de protótipo por Gabriela Teixeira.</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Loteria Mineira:</span>
              <span>Não há parceria confirmada nesta versão.</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Autorizações:</span>
              <span>Nenhuma autorização declarada ou publicada neste protótipo.</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Resultados:</span>
              <span>Esta versão não consulta nem reproduz resultados oficiais.</span>
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1">
            <span>Termos de Uso • Privacidade • Contato: a publicar antes de qualquer lançamento público.</span>
            <span>Quando existir autorização publicável: divulgação restrita a dados comprovados (órgão emissor, nº, escopo e validade).</span>
          </div>
        </div>

        {/* Mandatory Developer Signature Row:
            "Desenvolvedor: Gabriela Teixeira; pequeno, porém legível, branco no tema escuro e preto no tema claro."
        */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-semibold text-black dark:text-white tracking-wide">
            Desenvolvedor: Gabriela Teixeira
          </p>

          {onOpenDonationModal && (
            <button
              type="button"
              onClick={() => onOpenDonationModal('pix_details')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors"
            >
              <Heart className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
              <span>Apoiar Projeto (Contribuição Voluntária de R$ 10)</span>
            </button>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Número Certo — Plataforma de Sorteios & Transparência
          </p>
        </div>
      </div>
    </footer>
  );
};
