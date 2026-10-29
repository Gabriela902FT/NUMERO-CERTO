/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Ticket, LotteryAction } from '../types';
import { 
  Search, 
  Sparkles, 
  Check, 
  X, 
  Info, 
  CheckCircle2, 
  RotateCcw, 
  Ticket as TicketIcon,
  ChevronLeft,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { BuyerCheckoutFlowModal } from './BuyerCheckoutFlowModal';

interface NumberGridSectionProps {
  tickets: Ticket[];
  selectedTicketNumbers: number[];
  onToggleTicket: (num: number) => void;
  onClearSelection: () => void;
  onConfirmReservation: (selectedNumbers: number[]) => void;
  activeAction: LotteryAction;
}

export const NumberGridSection: React.FC<NumberGridSectionProps> = ({
  tickets,
  selectedTicketNumbers,
  onToggleTicket,
  onClearSelection,
  onConfirmReservation,
  activeAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'paid' | 'selected'>('all');
  const [pageRange, setPageRange] = useState<number>(0); // 0 = 1-100, 1 = 101-200, etc.
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [lastReservedTickets, setLastReservedTickets] = useState<number[]>([]);
  const { toast } = useToast();

  const PAGE_SIZE = 100;
  const TOTAL_PAGES = Math.ceil(tickets.length / PAGE_SIZE); // 10 pages for 1000 tickets

  // Filtered and searched tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.trim().toLowerCase();
        const matchesNumber = ticket.formattedNumber.includes(query) || ticket.number.toString() === query;
        if (!matchesNumber) return false;
      }

      // Status filter
      const isSelected = selectedTicketNumbers.includes(ticket.number);
      if (statusFilter === 'selected') {
        return isSelected;
      }
      if (statusFilter === 'available') {
        return ticket.status === 'available' && !isSelected;
      }
      if (statusFilter === 'reserved') {
        return ticket.status === 'reserved';
      }
      if (statusFilter === 'paid') {
        return ticket.status === 'paid';
      }
      return true;
    });
  }, [tickets, searchTerm, statusFilter, selectedTicketNumbers]);

  // If search is active or filtering by 'selected', show all matching.
  // Otherwise, paginate by range of 100 for clean responsive rendering.
  const isBrowsingAll = searchTerm.trim() !== '' || statusFilter === 'selected';
  const displayedTickets = useMemo(() => {
    if (isBrowsingAll) {
      return filteredTickets;
    }
    const start = pageRange * PAGE_SIZE;
    return filteredTickets.slice(start, start + PAGE_SIZE);
  }, [filteredTickets, isBrowsingAll, pageRange]);

  // Surpresinha: pick random N available tickets
  const pickRandomAvailable = (count: number) => {
    const available = tickets.filter(
      (t) => t.status === 'available' && !selectedTicketNumbers.includes(t.number)
    );
    if (available.length === 0) return;

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count).map((t) => t.number);
    picked.forEach((num) => onToggleTicket(num));
    toast.info(
      `${picked.length} ${picked.length === 1 ? 'número adicionado' : 'números adicionados'} à sua seleção via Surpresinha!`,
      'Surpresinha'
    );
  };

  const handleConfirmOrder = () => {
    if (selectedTicketNumbers.length === 0) return;
    setLastReservedTickets([...selectedTicketNumbers]);
    onConfirmReservation(selectedTicketNumbers);
    setShowReceiptModal(true);
  };

  const totalPrice = (selectedTicketNumbers.length * activeAction.pricePerTicket).toFixed(2);

  return (
    <div className="space-y-6 py-4 sm:py-6">
      
      {/* Header and Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Grade de Números (001 a 1000)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Escolha suas cotas demonstrativas ou use a ferramenta surpresinha.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-xs" />
            <span className="text-slate-600 dark:text-slate-300">Disponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-violet-600 shadow-xs" />
            <span className="text-slate-600 dark:text-slate-300">Selecionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-200 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700" />
            <span className="text-slate-600 dark:text-slate-300">Reservado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
            <span className="text-slate-600 dark:text-slate-400">Pago</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Surpresinha */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar número (ex: 042, 777)..."
            className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="md:col-span-5 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos (1000)
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              statusFilter === 'available'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Disponíveis
          </button>
          <button
            onClick={() => setStatusFilter('selected')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap min-h-[36px] flex items-center gap-1 ${
              statusFilter === 'selected'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Meus ({selectedTicketNumbers.length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('reserved')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
              statusFilter === 'reserved'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Reservados
          </button>
        </div>

        {/* Surpresinha (Quick Random Pick) */}
        <div className="md:col-span-3 flex items-center justify-end gap-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline">
            Surpresinha:
          </span>
          <button
            onClick={() => pickRandomAvailable(1)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/80 transition-colors min-h-[36px]"
            title="Escolher 1 número aleatório disponível"
          >
            +1
          </button>
          <button
            onClick={() => pickRandomAvailable(3)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/80 transition-colors min-h-[36px]"
            title="Escolher 3 números aleatórios disponíveis"
          >
            +3
          </button>
          <button
            onClick={() => pickRandomAvailable(5)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/80 transition-colors min-h-[36px]"
            title="Escolher 5 números aleatórios disponíveis"
          >
            +5
          </button>
        </div>

      </div>

      {/* Range Quick Pagination (001-100, 101-200, ... 901-1000) when not searching */}
      {!isBrowsingAll && (
        <div className="flex items-center justify-between gap-2 border-y border-slate-200/80 dark:border-slate-800/80 py-2.5 overflow-x-auto">
          <button
            disabled={pageRange === 0}
            onClick={() => setPageRange((prev) => Math.max(0, prev - 1))}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Página anterior de números"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {Array.from({ length: TOTAL_PAGES }).map((_, idx) => {
              const startNum = (idx * PAGE_SIZE + 1).toString().padStart(3, '0');
              const endNum = ((idx + 1) * PAGE_SIZE).toString().padStart(3, '0');
              const isActive = pageRange === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setPageRange(idx)}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap min-h-[32px] ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {startNum}-{endNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={pageRange === TOTAL_PAGES - 1}
            onClick={() => setPageRange((prev) => Math.min(TOTAL_PAGES - 1, prev + 1))}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Próxima página de números"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Ticket Grid View */}
      {displayedTickets.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <TicketIcon className="h-10 w-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhum número encontrado para os critérios selecionados
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tente limpar a busca ou mudar o filtro de status.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
          >
            Mostrar todos os números
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2">
          {displayedTickets.map((ticket) => {
            const isSelected = selectedTicketNumbers.includes(ticket.number);
            const isAvailable = ticket.status === 'available';
            const isReserved = ticket.status === 'reserved';
            const isPaid = ticket.status === 'paid';

            let stateClasses = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400';
            
            if (isSelected) {
              stateClasses = 'bg-violet-600 text-white border-violet-700 ring-2 ring-violet-400 shadow-md scale-105';
            } else if (isReserved) {
              stateClasses = 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 cursor-not-allowed opacity-75';
            } else if (isPaid) {
              stateClasses = 'bg-slate-200 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed line-through';
            }

            return (
              <button
                key={ticket.number}
                type="button"
                disabled={!isAvailable && !isSelected}
                onClick={() => isAvailable && onToggleTicket(ticket.number)}
                title={
                  isSelected
                    ? `Número ${ticket.formattedNumber} selecionado por você`
                    : isReserved
                    ? `Número ${ticket.formattedNumber} reservado (${ticket.buyerMasked || 'Demonstrativo'})`
                    : isPaid
                    ? `Número ${ticket.formattedNumber} confirmado/pago (${ticket.buyerMasked || 'Demonstrativo'})`
                    : `Clique para selecionar o número ${ticket.formattedNumber}`
                }
                className={`flex flex-col items-center justify-center p-2 rounded-xl font-mono text-xs font-bold border transition-all min-h-[44px] min-w-[44px] select-none ${stateClasses}`}
              >
                <span>{ticket.formattedNumber}</span>
                {isSelected && (
                  <span className="text-[9px] font-sans font-normal opacity-90 mt-0.5">Meu</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart / Sticky Action Bar for Selected Numbers */}
      {selectedTicketNumbers.length > 0 && (
        <div className="sticky bottom-4 z-30 rounded-2xl border border-violet-500/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 shadow-xl text-slate-900 dark:text-white transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 items-center justify-center rounded-md bg-violet-600 px-2 text-xs font-bold text-white">
                  {selectedTicketNumbers.length} {selectedTicketNumbers.length === 1 ? 'cota' : 'cotas'}
                </span>
                <span className="text-sm font-bold">
                  Total demonstrativo: R$ {totalPrice}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Números:</span>
                {selectedTicketNumbers.slice(0, 10).map((n) => (
                  <span key={n} className="font-mono font-semibold text-violet-600 dark:text-violet-400">
                    {n.toString().padStart(3, '0')}
                  </span>
                ))}
                {selectedTicketNumbers.length > 10 && (
                  <span>+{selectedTicketNumbers.length - 10} outros</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onClearSelection}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors min-h-[44px]"
              >
                Limpar
              </button>
              
              <button
                onClick={() => setIsCheckoutModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
              >
                <Smartphone className="h-4 w-4" />
                <span>Pagar via Pix (Etapas A — D)</span>
              </button>

              <button
                onClick={handleConfirmOrder}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 min-h-[44px]"
                title="Reserva rápida para teste demonstrativo"
              >
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Reserva Rápida</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Simulated Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Reserva Demonstrativa Registrada
                </h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Comprovante Fictício:</span>
                <span className="font-mono font-bold">#NC-DEMO-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Ação:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {activeAction.title}
                </span>
              </div>

              <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Cotas Reservadas ({lastReservedTickets.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {lastReservedTickets.map((num) => (
                    <span
                      key={num}
                      className="inline-block px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-mono text-xs font-bold"
                    >
                      {num.toString().padStart(3, '0')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Valor Simulado:
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  R$ {(lastReservedTickets.length * activeAction.pricePerTicket).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Clear Legal / Transparency Notice */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                Aviso Legal de Simulação
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
                Nenhum pagamento real foi processado. Este ambiente demonstra a integridade da grade de bilhetes, controle de ocupação e preservação de dados.
              </p>
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors min-h-[44px]"
            >
              Concluir & Fechar
            </button>

          </div>
        </div>
      )}

      {/* Simplified Direct Pix Buyer Checkout Flow (Etapas A, B, C, D) */}
      <BuyerCheckoutFlowModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        selectedNumbers={selectedTicketNumbers}
        action={activeAction}
        onCompleteReservation={(confirmedNums) => {
          onConfirmReservation(confirmedNums);
          setIsCheckoutModalOpen(false);
        }}
      />

    </div>
  );
};
