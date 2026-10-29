/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveSection, Ticket, LotteryDraft } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeSection } from './components/HomeSection';
import { NumberGridSection } from './components/NumberGridSection';
import { DraftsSection } from './components/DraftsSection';
import { SimulatorSection } from './components/SimulatorSection';
import { PrizeEvaluationSection } from './components/PrizeEvaluationSection';
import { OrganizerSection } from './components/OrganizerSection';
import { RulesSection } from './components/RulesSection';
import { ResultsSection } from './components/ResultsSection';
import { TransparencySection } from './components/TransparencySection';
import { MyParticipationsSection } from './components/MyParticipationsSection';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { DonationModal, DONATION_DISABLED_KEY, DONATION_LAST_SHOWN_KEY } from './components/DonationModal';
import { getStoredNotifications } from './services/purchaseStorage';
import { DEMO_ACTION, INITIAL_DRAFTS, generateInitialTickets } from './data/mockData';
import { 
  Home, 
  Grid3X3, 
  FileEdit, 
  Calculator, 
  UserCheck, 
  ShieldCheck, 
  Award,
  Sparkles 
} from 'lucide-react';

const DRAFTS_STORAGE_KEY = 'numerocerto_local_drafts_v1';
const TICKETS_STORAGE_KEY = 'numerocerto_tickets_state_v1';

function AppContent() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [selectedTicketNumbers, setSelectedTicketNumbers] = useState<number[]>([]);
  const { toast } = useToast();

  // Tickets state (001 to 1000)
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return generateInitialTickets();
  });

  // Drafts state with localStorage persistence
  const [drafts, setDrafts] = useState<LotteryDraft[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_DRAFTS;
  });

  // Voluntary donation modal state
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationInitialView, setDonationInitialView] = useState<'invite' | 'pix_details'>('pix_details');

  // Notifications modal state
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(() => {
    try {
      const list = getStoredNotifications();
      return list.filter(n => !n.read).length;
    } catch {
      return 1;
    }
  });

  const handleOpenNotifications = () => {
    setIsNotificationsModalOpen(true);
  };

  const handleOpenDonation = (view: 'invite' | 'pix_details' = 'pix_details') => {
    setDonationInitialView(view);
    setIsDonationModalOpen(true);
  };

  // Gentle, non-intrusive invite trigger respecting frequency and user opt-out
  const triggerGentleDonationInvite = () => {
    try {
      const isDisabled = localStorage.getItem(DONATION_DISABLED_KEY) === 'true';
      if (isDisabled) return;
      const lastShown = parseInt(localStorage.getItem(DONATION_LAST_SHOWN_KEY) || '0', 10);
      const hoursSince = (Date.now() - lastShown) / (1000 * 60 * 60);
      if (hoursSince < 12) return; // Non-intrusive: max once every 12 hours
      setDonationInitialView('invite');
      setIsDonationModalOpen(true);
    } catch {
      // Ignore
    }
  };

  // Save drafts to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Ignore
    }
  }, [drafts]);

  // Save tickets to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // Ignore
    }
  }, [tickets]);

  // Toggle ticket selection in cart
  const handleToggleTicket = (ticketNum: number) => {
    setSelectedTicketNumbers((prev) => {
      const isRemoving = prev.includes(ticketNum);
      const updated = isRemoving
        ? prev.filter((n) => n !== ticketNum)
        : [...prev, ticketNum].sort((a, b) => a - b);
      return updated;
    });
  };

  const handleClearSelection = () => {
    const count = selectedTicketNumbers.length;
    if (count > 0) {
      setSelectedTicketNumbers([]);
      toast.info(
        `A seleção de ${count} ${count === 1 ? 'cota foi removida' : 'cotas foi removida'}.`,
        'Seleção Limpa'
      );
    }
  };

  // Confirm demonstrative reservation
  const handleConfirmReservation = (reservedNumbers: number[]) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (reservedNumbers.includes(t.number)) {
          return {
            ...t,
            status: 'reserved',
            buyerMasked: 'Você (Reserva Demonstrativa)',
            reservedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    const count = reservedNumbers.length;
    setSelectedTicketNumbers([]);
    toast.success(
      `Reserva demonstrativa de ${count} ${count === 1 ? 'cota confirmada' : 'cotas confirmada'} com sucesso!`,
      'Reserva Concluída'
    );
    setTimeout(triggerGentleDonationInvite, 2500);
  };

  // Drafts operations
  const handleSaveDraft = (draftToSave: LotteryDraft) => {
    setDrafts((prev) => {
      const exists = prev.some((d) => d.id === draftToSave.id);
      if (exists) {
        return prev.map((d) => (d.id === draftToSave.id ? draftToSave : d));
      } else {
        return [draftToSave, ...prev];
      }
    });
    toast.success(
      `Rascunho "${draftToSave.title || 'Novo Sorteio'}" salvo com sucesso no dispositivo!`,
      'Rascunho Salvo'
    );
    setTimeout(triggerGentleDonationInvite, 2500);
  };

  const handleDeleteDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    const title = draft ? `"${draft.title}"` : 'Rascunho';
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    toast.warning(
      `${title} foi excluído do armazenamento local.`,
      'Rascunho Removido'
    );
  };

  const handleCreateDraftFromPrize = (prizeTitle: string, estimatedValue: number) => {
    const newDraft: LotteryDraft = {
      id: `draft-${Date.now()}`,
      title: `Ação Beneficente — ${prizeTitle}`,
      description: `Rascunho de sorteio gerado após avaliação técnica com IA. Valor de mercado estimado: R$ ${estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      mainPrize: prizeTitle,
      secondaryPrize: 'Premiação secundária a definir',
      totalNumbers: 1000,
      pricePerTicket: 5.0,
      drawDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      causeOrBeneficiary: 'Entidade Social Beneficiária',
      rulesNotes: 'Em conformidade com a Lei nº 5.768/1971. Sorteio atrelado à extração oficial da Loteria Federal.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDrafts((prev) => [newDraft, ...prev]);
    setActiveSection('drafts');
    toast.success(
      `Rascunho para "${prizeTitle}" criado com base na avaliação com IA!`,
      'Rascunho Gerado'
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedTicketsCount={selectedTicketNumbers.length}
        onOpenDonationModal={handleOpenDonation}
        onOpenNotificationsModal={handleOpenNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 lg:pb-12">
          {activeSection === 'home' && (
            <HomeSection
              activeAction={DEMO_ACTION}
              setActiveSection={setActiveSection}
              selectedTicketsCount={selectedTicketNumbers.length}
              onOpenDonationModal={() => handleOpenDonation('pix_details')}
              onOpenNotifications={handleOpenNotifications}
            />
          )}

          {activeSection === 'numbers' && (
            <NumberGridSection
              tickets={tickets}
              selectedTicketNumbers={selectedTicketNumbers}
              onToggleTicket={handleToggleTicket}
              onClearSelection={handleClearSelection}
              onConfirmReservation={handleConfirmReservation}
              activeAction={DEMO_ACTION}
            />
          )}

          {activeSection === 'my-tickets' && (
            <MyParticipationsSection
              setActiveSection={setActiveSection}
              activeAction={DEMO_ACTION}
            />
          )}

          {activeSection === 'prize-eval' && (
            <PrizeEvaluationSection
              onCreateDraftFromPrize={handleCreateDraftFromPrize}
              onApplyToSimulator={(val) => {
                setActiveSection('simulator');
                toast.info(`Valor de ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} disponível para simulação.`, 'Prêmio Selecionado');
              }}
            />
          )}

          {activeSection === 'drafts' && (
            <DraftsSection
              drafts={drafts}
              onSaveDraft={handleSaveDraft}
              onDeleteDraft={handleDeleteDraft}
            />
          )}

          {activeSection === 'simulator' && (
            <SimulatorSection onNavigateToAiEval={() => setActiveSection('prize-eval')} />
          )}

          {activeSection === 'organizer' && <OrganizerSection />}

          {activeSection === 'transparency' && <TransparencySection />}

          {activeSection === 'rules' && <RulesSection />}

          {activeSection === 'results' && <ResultsSection />}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Touch-first ergonomic tab bar) */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
        aria-label="Navegação móvel inferior"
      >
        <div className="grid grid-cols-6 items-center h-16 px-1 max-w-lg mx-auto">
          <button
            onClick={() => setActiveSection('home')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeSection === 'home'
                ? 'text-violet-600 dark:text-violet-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="text-[9px] tracking-tight mt-1">Início</span>
          </button>

          <button
            onClick={() => setActiveSection('numbers')}
            className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeSection === 'numbers'
                ? 'text-violet-600 dark:text-violet-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="text-[9px] tracking-tight mt-1">Grade</span>
            {selectedTicketNumbers.length > 0 && (
              <span className="inline-flex items-center justify-center absolute top-1 right-2 h-4 min-w-[16px] px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                {selectedTicketNumbers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('prize-eval')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeSection === 'prize-eval'
                ? 'text-violet-600 dark:text-violet-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-[9px] tracking-tight mt-1">IA Prêmio</span>
          </button>

          <button
            onClick={() => setActiveSection('simulator')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeSection === 'simulator'
                ? 'text-violet-600 dark:text-violet-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span className="text-[9px] tracking-tight mt-1">Simulador</span>
          </button>

          <button
            onClick={() => setActiveSection('drafts')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeSection === 'drafts'
                ? 'text-violet-600 dark:text-violet-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <FileEdit className="h-4 w-4" />
            <span className="text-[9px] tracking-tight mt-1">Rascunhos</span>
          </button>

          <button
            onClick={() => setActiveSection('organizer')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeSection === 'organizer'
                ? 'text-violet-600 dark:text-violet-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span className="text-[9px] tracking-tight mt-1">Organizador</span>
          </button>
        </div>
      </nav>

      {/* Footer with mandatory developer signature: "Desenvolvedor: Gabriela Teixeira" */}
      <Footer
        setActiveSection={setActiveSection}
        onOpenDonationModal={handleOpenDonation}
      />

      {/* Voluntary Contribution / Donation via Pix Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        initialView={donationInitialView}
      />

      {/* Notification Center & Settings Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onNavigateSection={(sec) => setActiveSection(sec)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
