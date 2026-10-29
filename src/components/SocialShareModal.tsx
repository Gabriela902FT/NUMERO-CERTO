/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Award, 
  ExternalLink,
  Smartphone,
  Palette,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { APP_LOGO_SRC } from '../data/mockData';

// Generated celebratory artwork asset
const CELEBRATION_IMAGE_SRC = '/src/assets/images/winner_celebration_card_1793236723144.jpg';

export interface WinnerShareData {
  edition: string;
  winningNumber: string;
  winnerMasked: string;
  prize: string;
  date: string;
  federalLotteryContest: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: WinnerShareData;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [shareData, setShareData] = useState<WinnerShareData>({
    edition: initialData?.edition || 'Edição 03 — Campanha Inverno Solidário',
    winningNumber: initialData?.winningNumber || '427',
    winnerMasked: initialData?.winnerMasked || 'Mariana C. (***.451.890-**)',
    prize: initialData?.prize || 'Notebook Dell Inspiron 15',
    date: initialData?.date || '15 de Julho de 2026',
    federalLotteryContest: initialData?.federalLotteryContest || 'Concurso Federal nº 5.892 (1º Prêmio: 84.427)',
  });

  const [cardTheme, setCardTheme] = useState<'violet' | 'emerald' | 'gold'>('violet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Update shareData when initialData changes
  useEffect(() => {
    if (initialData) {
      setShareData(initialData);
    }
  }, [initialData]);

  // Render canvas whenever data or theme changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const renderCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1080;
      const height = 1080;
      canvas.width = width;
      canvas.height = height;

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (cardTheme === 'emerald') {
        bgGrad.addColorStop(0, '#064e3b');
        bgGrad.addColorStop(0.5, '#042f2e');
        bgGrad.addColorStop(1, '#021815');
      } else if (cardTheme === 'gold') {
        bgGrad.addColorStop(0, '#3a2002');
        bgGrad.addColorStop(0.5, '#1e1102');
        bgGrad.addColorStop(1, '#0c0701');
      } else {
        bgGrad.addColorStop(0, '#2e1065');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#0f0e26');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Load and draw celebration artwork as background overlay
      try {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = CELEBRATION_IMAGE_SRC;
        await new Promise((resolve) => {
          bgImg.onload = resolve;
          bgImg.onerror = resolve; // Continue even if load fails
        });

        if (bgImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.28;
          ctx.drawImage(bgImg, 0, 0, width, height);
          ctx.restore();
        }
      } catch {
        // Fallback gracefully
      }

      // Decorative outer border
      ctx.strokeStyle = cardTheme === 'emerald' ? '#10b981' : cardTheme === 'gold' ? '#f59e0b' : '#8b5cf6';
      ctx.lineWidth = 14;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(44, 44, width - 88, height - 88);

      // 3. Header badge
      ctx.fillStyle = cardTheme === 'emerald' ? '#059669' : cardTheme === 'gold' ? '#d97706' : '#7c3aed';
      const badgeWidth = 520;
      const badgeHeight = 44;
      const badgeX = (width - badgeWidth) / 2;
      const badgeY = 70;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NÚMERO CERTO • COMUNICADO OFICIAL', width / 2, badgeY + 29);

      // 4. App Title & Edition
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('RESULTADO DO SORTEIO', width / 2, 175);

      ctx.fillStyle = cardTheme === 'emerald' ? '#34d399' : cardTheme === 'gold' ? '#fbbf24' : '#a78bfa';
      ctx.font = '600 24px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(shareData.edition, width / 2, 218);

      // 5. Giant Winning Number Card
      const cardW = 900;
      const cardH = 360;
      const cardX = (width - cardW) / 2;
      const cardY = 250;

      // Card background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 32);
      ctx.fill();
      ctx.strokeStyle = cardTheme === 'emerald' ? 'rgba(52, 211, 153, 0.4)' : cardTheme === 'gold' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(167, 139, 250, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // "NÚMERO CONTEMPLADO" subheader
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('BILHETE CONTEMPLADO', width / 2, cardY + 58);

      // Number badge
      const numBadgeW = 440;
      const numBadgeH = 150;
      const numBadgeX = (width - numBadgeW) / 2;
      const numBadgeY = cardY + 85;

      const numGrad = ctx.createLinearGradient(numBadgeX, numBadgeY, numBadgeX + numBadgeW, numBadgeY + numBadgeH);
      if (cardTheme === 'emerald') {
        numGrad.addColorStop(0, '#10b981');
        numGrad.addColorStop(1, '#059669');
      } else if (cardTheme === 'gold') {
        numGrad.addColorStop(0, '#f59e0b');
        numGrad.addColorStop(1, '#d97706');
      } else {
        numGrad.addColorStop(0, '#8b5cf6');
        numGrad.addColorStop(1, '#6d28d9');
      }

      ctx.fillStyle = numGrad;
      ctx.beginPath();
      ctx.roundRect(numBadgeX, numBadgeY, numBadgeW, numBadgeH, 24);
      ctx.fill();

      // Number text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 105px monospace';
      ctx.fillText(shareData.winningNumber, width / 2, numBadgeY + 112);

      // Winner details inside card
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 28px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(`Ganhador(a): ${shareData.winnerMasked}`, width / 2, cardY + 285);

      ctx.fillStyle = cardTheme === 'emerald' ? '#a7f3d0' : cardTheme === 'gold' ? '#fde68a' : '#ddd6fe';
      ctx.font = '600 24px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(`Prêmio: ${shareData.prize}`, width / 2, cardY + 325);

      // 6. Audit & Transparency block
      const infoBoxY = 645;
      const infoBoxW = 900;
      const infoBoxH = 190;
      const infoBoxX = (width - infoBoxW) / 2;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.roundRect(infoBoxX, infoBoxY, infoBoxW, infoBoxH, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('CRITÉRIO AUDITÁVEL & APURAÇÃO', infoBoxX + 40, infoBoxY + 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 21px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(`• Base Oficial: ${shareData.federalLotteryContest}`, infoBoxX + 40, infoBoxY + 85);
      ctx.fillText(`• Data da Apuração: ${shareData.date}`, infoBoxX + 40, infoBoxY + 120);
      ctx.fillText('• Status: Auditoria e Prestação de Contas Homologada', infoBoxX + 40, infoBoxY + 155);

      // 7. Footer & Mandatory Signature
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 19px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Simulação demonstrativa com base na extração oficial da Loteria Federal', width / 2, 885);

      // Mandatory Developer Credit: "Desenvolvedor: Gabriela Teixeira"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Desenvolvedor: Gabriela Teixeira', width / 2, 940);

      ctx.fillStyle = cardTheme === 'emerald' ? '#34d399' : cardTheme === 'gold' ? '#fbbf24' : '#c084fc';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('www.numerocerto.com.br • Sistema de Ações Transparentes', width / 2, 985);

      if (isMounted) {
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      }
    };

    renderCard();

    return () => {
      isMounted = false;
    };
  }, [isOpen, shareData, cardTheme]);

  if (!isOpen) return null;

  // Handle Download PNG
  const handleDownloadImage = () => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `resultado-numerocerto-${shareData.winningNumber}.png`;
      link.href = dataUrl;
      link.click();

      toast.success(
        `Card do ganhador (Bilhete ${shareData.winningNumber}) baixado com sucesso!`,
        'Imagem Gerada'
      );
    } catch {
      toast.error('Erro ao gerar imagem. Tente novamente.', 'Falha no Download');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate share text for WhatsApp/socials
  const formattedShareMessage = `🎉 *COMUNICADO OFICIAL — NÚMERO CERTO* 🎉\n\n🏆 *Bilhete Contemplado:* #${shareData.winningNumber}\n👤 *Ganhador(a):* ${shareData.winnerMasked}\n🎁 *Prêmio:* ${shareData.prize}\n📅 *Ação:* ${shareData.edition}\n🔍 *Auditoria:* ${shareData.federalLotteryContest}\n\nConfira todos os detalhes e a prestação de contas no Número Certo!\nDesenvolvedor: Gabriela Teixeira`;

  // Native Web Share API
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'resultado.png', { type: 'image/png' })] })) {
            const file = new File([blob], `resultado-numerocerto-${shareData.winningNumber}.png`, { type: 'image/png' });
            await navigator.share({
              title: `Resultado Número Certo — Bilhete ${shareData.winningNumber}`,
              text: formattedShareMessage,
              files: [file],
            });
            toast.success('Card compartilhado com sucesso!', 'Compartilhado');
          } else {
            await navigator.share({
              title: `Resultado Número Certo — Bilhete ${shareData.winningNumber}`,
              text: formattedShareMessage,
              url: window.location.href,
            });
            toast.success('Texto compartilhado com sucesso!', 'Compartilhado');
          }
        }, 'image/png');
      } else {
        // Fallback: Open WhatsApp directly
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedShareMessage)}`;
        window.open(whatsappUrl, '_blank');
        toast.info('Abrindo WhatsApp para compartilhamento...', 'WhatsApp');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedShareMessage)}`;
        window.open(whatsappUrl, '_blank');
      }
    }
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareMessage);
      setCopiedText(true);
      toast.success('Texto de divulgação copiado com sucesso!', 'Copiado');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      toast.error('Não foi possível copiar o texto.', 'Erro');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      
      {/* Hidden Canvas used for high-res 1080x1080 rendering */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Compartilhar & Gerar Imagem do Ganhador
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere um card visual oficial em alta resolução (1080×1080) pronto para redes sociais e WhatsApp.
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Card Visual Preview */}
            <div className="lg:col-span-7 flex flex-col items-center space-y-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-start">
                Prévia do Card em Alta Resolução (1080×1080):
              </span>

              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-xl border border-slate-300 dark:border-slate-700 bg-slate-950">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Card Oficial do Ganhador"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    Gerando card visual...
                  </div>
                )}
              </div>

              {/* Theme selector */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5" />
                  Tema visual:
                </span>
                <button
                  type="button"
                  onClick={() => setCardTheme('violet')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    cardTheme === 'violet'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Violeta Nobre
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('emerald')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    cardTheme === 'emerald'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Verde Trevo
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('gold')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    cardTheme === 'gold'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Dourado Campeão
                </button>
              </div>
            </div>

              {/* Right: Imutabilidade do Ganhador & Botões de Ação */}
              <div className="lg:col-span-5 space-y-5">
                
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Dados Oficiais da Apuração
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      Imutável / Auditado
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Em conformidade com a <strong>Lei nº 5.768/1971</strong>, os dados do contemplado são vinculados à extração oficial da Loteria Federal e <strong>não podem ser alterados livremente</strong> pelo organizador.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Bilhete Contemplado:</span>
                        <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">1º Prêmio Federal</span>
                      </div>
                      <div className="font-mono font-extrabold text-base text-violet-700 dark:text-violet-300 mt-0.5">
                        #{shareData.winningNumber}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Ganhador Identificado (LGPD Protegido):</span>
                        <span className="text-[9px] text-slate-500">CPF Mascarado</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {shareData.winnerMasked}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Prêmio Homologado:</div>
                      <div className="font-medium text-slate-900 dark:text-slate-200 mt-0.5">
                        {shareData.prize}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Edição & Auditoria:</div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                        {shareData.edition}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {shareData.federalLotteryContest}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-t border-slate-200 dark:border-slate-800">
                    <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Edição direta desativada para proteção contra fraude e integridade do sorteio.</span>
                  </div>
                </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all min-h-[48px]"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar Imagem PNG em Alta Resolução</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all min-h-[48px]"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Compartilhar (WhatsApp / Redes Sociais)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all min-h-[44px]"
                >
                  {copiedText ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Texto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Mensagem Formatada</span>
                    </>
                  )}
                </button>
              </div>

              {/* Regulatory note */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Card gerado com auditoria auditável e assinatura obrigatória do desenvolvedor: <strong>Gabriela Teixeira</strong>.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
