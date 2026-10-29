/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveSection } from '../types';
import { useTheme } from '../context/ThemeContext';
import { APP_LOGO_SRC } from '../data/mockData';
import { Sun, Moon, Menu, X, PlusCircle, ShieldCheck, Sparkles, Heart, Bell } from 'lucide-react';

interface NavbarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  selectedTicketsCount: number;
  onOpenDonationModal?: (view?: 'invite' | 'pix_details') => void;
  onOpenNotificationsModal?: () => void;
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  selectedTicketsCount,
  onOpenDonationModal,
  onOpenNotificationsModal,
  unreadNotificationsCount = 0,
}) => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveSection; label: string; badge?: number }[] = [
    { id: 'home', label: 'Início' },
    { id: 'numbers', label: 'Números 001-1000', badge: selectedTicketsCount > 0 ? selectedTicketsCount : undefined },
    { id: 'my-tickets', label: 'Minhas Participações' },
    { id: 'prize-eval', label: 'Avaliar com IA' },
    { id: 'simulator', label: 'Simulador' },
    { id: 'drafts', label: 'Rascunhos' },
    { id: 'organizer', label: 'Organizador' },
    { id: 'transparency', label: 'Transparência' },
    { id: 'rules', label: 'Regras' },
    { id: 'results', label: 'Apuração' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Wordmark with Official App Icon */}
        <button
          onClick={() => {
            setActiveSection('home');
            setMobileMenuOpen(false);
          }}
          className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg p-1"
          aria-label="Ir para página inicial do Número Certo"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-violet-500/20 transition-transform group-hover:scale-105">
            <img
              src={APP_LOGO_SRC}
              alt="Ícone oficial Número Certo Sorteios"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Número Certo
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Sorteios & Transparência
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`relative px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[44px] ${
                  isActive
                    ? 'text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Explicit Light / Dark Theme Segmented Control */}
          <div 
            className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            role="group"
            aria-label="Controle de tema"
          >
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[36px] ${
                theme === 'light'
                  ? 'bg-white text-violet-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Tema Claro"
              aria-pressed={theme === 'light'}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Claro</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[36px] ${
                theme === 'dark'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Tema Escuro"
              aria-pressed={theme === 'dark'}
            >
              <Moon className="h-3.5 w-3.5 text-violet-200" />
              <span className="hidden sm:inline">Escuro</span>
            </button>
          </div>

          {/* Notification Center Trigger */}
          {onOpenNotificationsModal && (
            <button
              type="button"
              onClick={onOpenNotificationsModal}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Notificações e avisos"
              aria-label="Abrir central de notificações"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                </span>
              )}
            </button>
          )}

          {/* Voluntary Contribution Button (Heart) */}
          {onOpenDonationModal && (
            <button
              type="button"
              onClick={() => onOpenDonationModal('pix_details')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 bg-purple-50 hover:bg-purple-100 dark:text-violet-300 dark:bg-purple-950/60 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 shadow-xs transition-all whitespace-nowrap min-h-[36px]"
              title="Apoiar o projeto voluntariamente com R$ 10 via Pix"
            >
              <Heart className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
              <span className="hidden sm:inline">Apoiar</span>
            </button>
          )}

          {/* Action Button: Avaliar com IA */}
          <button
            onClick={() => {
              setActiveSection('prize-eval');
              setMobileMenuOpen(false);
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 dark:text-violet-200 dark:bg-violet-950/80 dark:hover:bg-violet-900 border border-violet-300 dark:border-violet-700 rounded-lg shadow-xs transition-all whitespace-nowrap min-h-[44px]"
          >
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span>Avaliar Prêmio IA</span>
          </button>

          {/* Action Button: Criar Rascunho */}
          <button
            onClick={() => {
              setActiveSection('drafts');
              setMobileMenuOpen(false);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-lg shadow-sm transition-all whitespace-nowrap min-h-[44px]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Rascunho</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden items-center justify-center p-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px]"
            aria-label="Menu principal"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 shadow-xl">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-colors text-left min-h-[44px] ${
                    isActive
                      ? 'text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/60 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="inline-flex h-5 items-center justify-center rounded-full bg-emerald-500 px-2 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveSection('drafts');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg min-h-[44px]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Criar Rascunho de Sorteio</span>
            </button>

            {onOpenDonationModal && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDonationModal('pix_details');
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-violet-700 dark:text-violet-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-lg min-h-[44px]"
              >
                <Heart className="h-4 w-4 fill-violet-500 text-violet-500" />
                <span>Apoiar o NumeroCerto (Pix R$ 10)</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 justify-center py-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Modo Demonstrativo com Segurança & LGPD</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
