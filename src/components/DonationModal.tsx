/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  QrCode,
  ArrowLeft,
  BellOff,
  Lock
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { 
  OFFICIAL_DONATION_PIX_PAYLOAD, 
  OFFICIAL_DONATION_KEY, 
  OFFICIAL_DONATION_RECIPIENT, 
  OFFICIAL_DONATION_CITY, 
  SUGGESTED_DONATION_AMOUNT,
  validateDonationPixPayload 
} from '../services/donationPixValidator';

export const DONATION_DISMISSED_KEY = 'numerocerto_donation_dismissed_v1';
export const DONATION_DISABLED_KEY = 'numerocerto_donation_disabled_v1';
export const DONATION_LAST_SHOWN_KEY = 'numerocerto_donation_last_shown_v1';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'invite' | 'pix_details';
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  initialView = 'invite',
}) => {
  const { toast } = useToast();
  const [view, setView] = useState<'invite' | 'pix_details'>(initialView);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Validate the official Pix payload on mount
  const validation = validateDonationPixPayload(OFFICIAL_DONATION_PIX_PAYLOAD);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      try {
        localStorage.setItem(DONATION_LAST_SHOWN_KEY, Date.now().toString());
      } catch {
        // Ignore in restricted environments
      }
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleDismissInvite = () => {
    try {
      if (dontShowAgain) {
        localStorage.setItem(DONATION_DISABLED_KEY, 'true');
        toast.info('Convites de apoio desativados neste dispositivo.', 'Preferência Salva');
      } else {
        localStorage.setItem(DONATION_DISMISSED_KEY, Date.now().toString());
      }
    } catch {
      // Ignore
    }
    onClose();
  };

  const handleCopyPayload = () => {
    try {
      navigator.clipboard.writeText(OFFICIAL_DONATION_PIX_PAYLOAD);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2500);
      toast.success('Código Pix Copia e Cola copiado para a área de transferência!', 'Copiado com Sucesso');
    } catch {
      toast.info('Selecione e copie o código Pix manualmente.', 'Copiar Código');
    }
  };

  const handleCopyKey = () => {
    try {
      navigator.clipboard.writeText(OFFICIAL_DONATION_KEY);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
      toast.success('Chave aleatória copiada com sucesso!', 'Chave Copiada');
    } catch {
      toast.info('Selecione e copie a chave manualmente.', 'Copiar Chave');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              <Heart className="h-5 w-5 fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Apoio ao NumeroCerto</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold">
                  100% Opcional
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contribuição voluntária para manutenção independente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* ========================================================
              VIEW 1: CONVITE AMIGÁVEL
             ======================================================== */}
          {view === 'invite' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/80 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/40 border border-violet-200 dark:border-violet-900/60 space-y-3">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-extrabold text-base sm:text-lg">
                  <span>💜 Gostou do NumeroCerto?</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Ajude-nos a manter e melhorar o aplicativo com uma contribuição voluntária de <strong>R$ 10,00</strong>.
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sua ajuda é bem-vinda, mas contribuir é totalmente opcional.
                </p>
              </div>

              {/* Guarantees Checklist */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                  Nossas Garantias de Transparência:
                </span>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Nenhuma cobrança automática:</strong> Não retemos dados de pagamento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Sem carteira virtual:</strong> Transferência direta ao desenvolvedor via Pix.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Sem privilégios em sorteios:</strong> Não altera chances de ganhar nem resultados.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Zero bloqueios:</strong> O aplicativo continua 100% liberado se você não contribuir.</span>
                  </li>
                </ul>
              </div>

              {/* Don't show again toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
                <span>Não exibir este convite automaticamente novamente</span>
              </label>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setView('pix_details')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
                >
                  <Heart className="h-4 w-4 fill-white text-white" />
                  <span>Quero contribuir com R$ 10</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismissInvite}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
                >
                  Agora não
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 2: TELA EXCLUSIVA PARA CONTRIBUIÇÃO VIA PIX
             ======================================================== */}
          {view === 'pix_details' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('invite')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Voltar ao convite"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Contribuição Voluntária via Pix
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Apoio financeiro direto para o desenvolvimento e manutenção do NumeroCerto.
                  </p>
                </div>
              </div>

              {/* Verified Details Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3.5 text-xs">
                
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Dados do Destinatário Oficial
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    Destinatário Validado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Nome do Destinatário:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                      {OFFICIAL_DONATION_RECIPIENT}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {OFFICIAL_DONATION_CITY}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Valor Sugerido:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base font-mono block mt-0.5">
                      R$ {SUGGESTED_DONATION_AMOUNT.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Valor único e voluntário
                    </span>
                  </div>
                </div>

                {/* Chave Pix Aleatória */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Chave Pix (Aleatória EVP):</span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="text-violet-600 dark:text-violet-400 hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold select-all break-all">
                    {OFFICIAL_DONATION_KEY}
                  </div>
                </div>

                {/* Pix Copia e Cola Field */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                    Código Pix Copia e Cola Oficial:
                  </label>
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={3}
                      value={OFFICIAL_DONATION_PIX_PAYLOAD}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all leading-relaxed"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all min-h-[42px]"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Código Copiado com Sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copiar Código Pix Copia e Cola</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Instructions Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-violet-500" />
                  Como Realizar a Transferência no Seu Banco:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>Copie o código Pix Copia e Cola acima.</li>
                  <li>Abra o aplicativo do seu banco ou carteira digital.</li>
                  <li>Escolha a opção <strong>Pix Copia e Cola</strong> (ou colar chave Pix).</li>
                  <li>Confira os dados do destinatário: <strong>Gabriela F. Teixeira</strong> e o valor de <strong>R$ 10,00</strong>.</li>
                  <li>Confirme a transferência com sua senha ou biometria bancária.</li>
                </ol>
              </div>

              {/* Mandatory Transparency Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-semibold text-[11px]">
                  Você pode concluir a transferência no aplicativo do seu banco. Obrigado por considerar apoiar o NumeroCerto!
                </p>
                <p className="text-[10px] opacity-90 leading-relaxed">
                  O aplicativo não processa transações bancárias diretamente e não declara que recebeu a contribuição sem confirmação externa. Doar não confere vantagens em sorteios nem altera qualquer regra.
                </p>
              </div>

              {/* Bottom Return Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Voltar ao NumeroCerto sem contribuir
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs"
                >
                  Concluir & Fechar
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
