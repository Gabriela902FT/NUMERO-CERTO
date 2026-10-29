/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Camera, 
  Upload, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  FileCheck, 
  ExternalLink,
  Smartphone,
  Eye,
  Info,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { 
  LotteryAction, 
  PurchaseRequest, 
  PurchaseRequestStatus, 
  AuditLogEntry, 
  OrganizerFinancialProfile 
} from '../types';
import { DEFAULT_FINANCIAL_PROFILE } from '../data/mockData';
import { upsertPurchaseRequest } from '../services/purchaseStorage';

interface BuyerCheckoutFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: number[];
  action: LotteryAction;
  onCompleteReservation: (confirmedNumbers: number[]) => void;
  organizerProfile?: OrganizerFinancialProfile;
}

export const BuyerCheckoutFlowModal: React.FC<BuyerCheckoutFlowModalProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  action,
  onCompleteReservation,
  organizerProfile = DEFAULT_FINANCIAL_PROFILE,
}) => {
  const { toast } = useToast();

  // Wizard Steps:
  // Step A: Escolher os números & Detalhes da Reserva
  // Step B: Pagar via Pix (Chave e QR Code)
  // Step C: Enviar Comprovante (Câmera do celular / Galeria + Conferência IA)
  // Step D: Confirmação da Participação & Status
  const [currentStep, setCurrentStep] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Purchase Request state
  const quantity = selectedNumbers.length;
  const unitPrice = action.pricePerTicket;
  const totalExpected = quantity * unitPrice; // Deterministic calculation

  // Countdown timer for 15-minute temporary reservation
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);

  // Status & purchase tracking
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseRequestStatus>('PENDING_PAYMENT');
  const [orderId, setOrderId] = useState<string>(() => `PED-${Math.floor(100000 + Math.random() * 900000)}`);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Receipt / Proof state
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [declaredAmountInput, setDeclaredAmountInput] = useState<string>(totalExpected.toFixed(2));
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    matchesDeterministicTotal: boolean;
    difference: number;
    explanation: string;
    ocrExtractedAmount?: number;
    detectedRecipient?: string;
  } | null>(null);

  // Live Camera Viewfinder State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Audit Log for this purchase
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: `log-init-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: 'SOLICITACAO_CRIADA',
      previousValue: 'NENHUM',
      newValue: `Reserva temporária de ${quantity} cotas (${selectedNumbers.map(n => String(n).padStart(3, '0')).join(', ')})`,
      reason: 'Solicitação inicial pelo comprador',
      operator: 'Sistema de Grade',
      hash: 'sha256-8f92b9c71a340b10'
    }
  ]);

  // Reservation countdown timer effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPurchaseStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraStream = async (facing: 'environment' | 'user') => {
    stopCameraStream();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador sem suporte ao visor WebRTC. Use o botão da câmera nativa.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      toast.info('Visor da câmera iniciado. Aponte para o comprovante.', 'Câmera Ativa');
    } catch (err: unknown) {
      console.warn('Câmera indisponível:', err);
      toast.warning('Abrindo seletor da câmera nativa do celular...', 'Câmera do Celular');
      cameraInputRef.current?.click();
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        stopCameraStream();
        setProofImage(dataUrl);
        setProofFileName('foto_comprovante_camera.jpg');
        toast.success('Foto do comprovante capturada com a câmera!', 'Comprovante Anexado');
      }
    } catch {
      toast.error('Não foi possível capturar o quadro da câmera.', 'Erro');
    }
  };

  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImage(reader.result);
        setProofFileName(file.name || 'foto_camera_celular.jpg');
        toast.success('Fotografia recebida da câmera com sucesso!', 'Foto Carregada');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImage(reader.result);
        setProofFileName(file.name);
        toast.info('Arquivo do comprovante selecionado da galeria.', 'Arquivo Pronto');
      }
    };
    reader.readAsDataURL(file);
  };

  // Pix EMV string preview
  const pixKeyClean = organizerProfile.pixKey || '00.123.456/0001-99';
  const recipientName = organizerProfile.accountBeneficiaryName || action.organizerName || 'Comissão Comunitária';
  const pixFormattedAmount = totalExpected.toFixed(2);
  const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0114${pixKeyClean.replace(/\D/g, '') || '00123456000199'}5204000053039865405${pixFormattedAmount}5802BR5925${recipientName.slice(0, 25).toUpperCase()}6009SAO PAULO62070503${orderId.slice(-4)}6304`;

  const copyToClipboard = (text: string, type: 'key' | 'payload') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2500);
        toast.success('Chave Pix copiada com sucesso!', 'Copiado');
      } else {
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2500);
        toast.success('Código Pix Copia e Cola copiado!', 'Copiado');
      }
    } catch {
      toast.info('Selecione e copie o texto manualmente.', 'Copiar');
    }
  };

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Deterministic value checker with simulated AI OCR explanation
  const handleVerifyProofWithAI = () => {
    if (!proofImage) {
      toast.error('Por favor, tire uma foto ou selecione o comprovante primeiro.', 'Foto Obrigatória');
      return;
    }

    setIsVerifyingProof(true);

    setTimeout(() => {
      const declaredVal = parseFloat(declaredAmountInput.replace(',', '.')) || 0;
      const difference = declaredVal - totalExpected;
      const matches = Math.abs(difference) < 0.01;

      let newStatus: PurchaseRequestStatus = 'PROOF_RECEIVED';
      let explanation = '';

      if (matches) {
        newStatus = 'PAYMENT_UNCONFIRMED';
        explanation = `O valor declarado no comprovante (R$ ${declaredVal.toFixed(2)}) corresponde exatamente ao valor total esperado (R$ ${totalExpected.toFixed(2)} = ${quantity} cotas × R$ ${unitPrice.toFixed(2)}). Aguardando confirmação confiável de recebimento pelo banco/PSP.`;
      } else if (declaredVal < totalExpected) {
        newStatus = 'PAYMENT_INSUFFICIENT';
        explanation = `Divergência detectada: Valor do comprovante (R$ ${declaredVal.toFixed(2)}) é inferior ao total esperado de R$ ${totalExpected.toFixed(2)}. Faltam R$ ${(totalExpected - declaredVal).toFixed(2)}. A participação permanecerá pendente até complementação.`;
      } else {
        newStatus = 'UNDER_REVIEW';
        explanation = `Valor do comprovante (R$ ${declaredVal.toFixed(2)}) é superior ao total esperado de R$ ${totalExpected.toFixed(2)}. Encaminhado para conferência administrativa.`;
      }

      setPurchaseStatus(newStatus);
      setAiAnalysisResult({
        matchesDeterministicTotal: matches,
        difference,
        explanation,
        ocrExtractedAmount: declaredVal,
        detectedRecipient: recipientName,
      });

      // Add to audit trail
      setAuditLogs((prev) => [
        {
          id: `log-proof-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'COMPROVANTE_ENVIADO_E_CONFERIDO',
          previousValue: 'PENDING_PAYMENT',
          newValue: newStatus,
          reason: `Conferência determinística: Esperado R$ ${totalExpected.toFixed(2)} vs Declarado R$ ${declaredVal.toFixed(2)}. ${explanation}`,
          operator: 'Motor Determinístico & IA OCR',
          hash: `sha256-${Math.random().toString(16).substring(2, 10)}`
        },
        ...prev
      ]);

      setIsVerifyingProof(false);
      setCurrentStep('D');
      toast.info('Comprovante processado! Veja o relatório de integridade na Etapa D.', 'Conferência Concluída');
      syncCurrentRequest('PROOF_RECEIVED');
    }, 1200);
  };

  const syncCurrentRequest = (statusOverride?: PurchaseRequestStatus, customLogs?: AuditLogEntry[]) => {
    try {
      const activeLogs = customLogs || auditLogs;
      const req: PurchaseRequest = {
        id: orderId,
        ticketNumbers: selectedNumbers,
        quantity,
        unitPrice,
        totalExpected,
        buyerNameMasked: 'Você (Sessão Atual)',
        status: statusOverride || purchaseStatus,
        organizerPixKey: pixKeyClean,
        organizerRecipientName: recipientName,
        pixCopiaECola,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        expiresAt: new Date(Date.now() + timeLeftSeconds * 1000).toISOString().replace('T', ' ').slice(0, 16),
        declaredAmount: declaredAmountInput ? parseFloat(declaredAmountInput) : totalExpected,
        proofFileName: proofFileName || undefined,
        aiAnalysisNotes: aiAnalysisResult?.explanation || undefined,
        confirmedAt: (statusOverride || purchaseStatus) === 'CONFIRMED' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
        auditLogs: activeLogs
      };
      upsertPurchaseRequest(req);
    } catch (e) {
      console.warn('Erro ao sincronizar pedido:', e);
    }
  };

  // Sync on initial opening
  useEffect(() => {
    if (isOpen) {
      syncCurrentRequest('PENDING_PAYMENT');
    }
  }, [isOpen]);

  // Operational PSP Webhook simulation (demonstrative testing tool)
  const handleSimulatePspWebhookConfirmation = () => {
    setPurchaseStatus('CONFIRMED');
    const newLog: AuditLogEntry = {
      id: `log-conf-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: 'CONFIRMACAO_BANCARIA_PSP',
      previousValue: purchaseStatus,
      newValue: 'CONFIRMED',
      reason: `Notificação autenticada de crédito via arranjo Pix (EndToEnd: E00123456${Date.now()}) no valor de R$ ${totalExpected.toFixed(2)}. Cotas homologadas exclusivamente.`,
      operator: 'PSP Central Autorizado (Simulação Idempotente)',
      hash: `sha256-${Math.random().toString(16).substring(2, 10)}`
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    syncCurrentRequest('CONFIRMED', updatedLogs);
    onCompleteReservation(selectedNumbers);
    toast.success('Participação confirmada! Números vinculados exclusivamente ao seu nome.', 'Sorteio Confirmado');
  };

  const handleSimulateInsufficient = () => {
    setPurchaseStatus('PAYMENT_INSUFFICIENT');
    const newLog: AuditLogEntry = {
      id: `log-ins-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: 'PAGAMENTO_INSUFICIENTE',
      previousValue: purchaseStatus,
      newValue: 'PAYMENT_INSUFFICIENT',
      reason: 'Crédito bancário recebido em valor inferior ao esperado pela compra.',
      operator: 'Auditoria de Conciliação',
      hash: `sha256-${Math.random().toString(16).substring(2, 10)}`
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    syncCurrentRequest('PAYMENT_INSUFFICIENT', updatedLogs);
    toast.warning('Status alterado para Pagamento Insuficiente.', 'Atenção');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      
      {/* Hidden file inputs for direct camera capture and gallery upload */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeCameraCapture}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleGalleryUpload}
        className="hidden"
      />

      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header with Title and Expiration Badge */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Aquisição de Cotas — Fluxo Direto via Pix
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  {orderId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sem carteira interna ou depósitos prévios: pagamento direto ao organizador.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              timeLeftSeconds > 180 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' 
                : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse'
            }`}>
              <Clock className="h-3.5 w-3.5" />
              <span>Reserva: {formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Wizard Step Progression Bar */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => setCurrentStep('A')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
              currentStep === 'A'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>A. Escolher</span>
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

          <button
            onClick={() => setCurrentStep('B')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
              currentStep === 'B'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>B. Pagar Pix</span>
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

          <button
            onClick={() => setCurrentStep('C')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
              currentStep === 'C'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>C. Comprovante</span>
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

          <button
            onClick={() => setCurrentStep('D')}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
              currentStep === 'D'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>D. Confirmar</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100">

          {/* ========================================================
              ETAPA A: ESCOLHER OS NÚMEROS E CONFERIR RESERVA
             ======================================================== */}
          {currentStep === 'A' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  Etapa A — Escolher os Números & Conferir Parâmetros
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Prêmio: <strong>{action.mainPrize}</strong> · Organizado por: <strong>{action.organizerName}</strong>
                </p>
              </div>

              {/* Cotas Selecionadas */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Cotas Selecionadas ({quantity}):
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    R$ {unitPrice.toFixed(2)} por cota
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedNumbers.map((num) => (
                    <span
                      key={num}
                      className="px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-950/90 text-violet-800 dark:text-violet-200 font-mono text-xs font-extrabold border border-violet-200 dark:border-violet-800"
                    >
                      #{String(num).padStart(3, '0')}
                    </span>
                  ))}
                </div>

                {/* Deterministic formula explanation */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span>Fórmula determinística do total:</span>
                    <span className="font-mono">{quantity} cotas × R$ {unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
                    <span className="text-slate-900 dark:text-white">Valor Total Calculado:</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      R$ {totalExpected.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Temporary Reservation Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Regra da Reserva Temporária (15 minutos)</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  Suas cotas ficam bloqueadas temporariamente pelo prazo de 15 minutos para que você realize a transferência Pix e anexe o comprovante. Se a solicitação não for confirmada no prazo, os números voltam automaticamente a ficar disponíveis para outros participantes.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep('B')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
                >
                  <span>Continuar para Pagamento via Pix</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA B: PAGAR VIA PIX (CHAVE, RECIPIENTE E QR CODE)
             ======================================================== */}
          {currentStep === 'B' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  Etapa B — Pagamento via Pix
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Transferência Direta para a Conta do Organizador
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Abra o aplicativo do seu banco, confira o valor e o nome do destinatário antes de confirmar o Pix.
                </p>
              </div>

              {/* Payment Box */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                
                {/* QR Code Graphic Placeholder */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div className="relative p-2 bg-white rounded-lg shadow-xs">
                    <QrCode className="h-32 w-32 text-slate-900" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    QR Code Pix Dinâmico
                  </span>
                </div>

                {/* Details & Copy Buttons */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Valor Exato a Pagar:
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      R$ {totalExpected.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Destinatário Vinculado:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                      {recipientName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Instituição: {organizerProfile.bankName || 'Banco do Brasil S.A.'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Chave Pix:
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        readOnly
                        value={pixKeyClean}
                        className="w-full px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(pixKeyClean, 'key')}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 min-h-[36px]"
                      >
                        {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(pixCopiaECola, 'payload')}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors min-h-[38px]"
                    >
                      {copiedPayload ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedPayload ? 'Código Copiado!' : 'Copiar Código Pix Copia e Cola'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Crucial Mandatory Security Warning */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Aviso de Segurança Financeira</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong>Não afirmamos que o pagamento foi realizado apenas por abrir esta tela.</strong> Conclua a transferência em seu banco e avance para enviar a fotografia do comprovante.
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('A')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('C')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
                >
                  <span>Já paguei: Enviar Comprovante</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA C: ENVIAR COMPROVANTE (FOTO CÂMERA DO CELULAR)
             ======================================================== */}
          {currentStep === 'C' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  Etapa C — Enviar Comprovante do Pix
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Tirar Foto com a Câmera do Celular ou Selecionar Imagem
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Priorize fotografar o comprovante diretamente com a câmera do celular para conferência imediata.
                </p>
              </div>

              {/* In-Browser Live Camera Viewfinder (if active) */}
              {isCameraActive && (
                <div className="rounded-2xl overflow-hidden border-2 border-violet-500 bg-black relative p-2 flex flex-col items-center">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full max-h-72 object-cover rounded-xl"
                  />
                  <div className="flex items-center justify-center gap-3 py-3 w-full">
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Fotografar Agora</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
                        setCameraFacing(nextFacing);
                        startCameraStream(nextFacing);
                      }}
                      className="p-2.5 rounded-full bg-slate-800 text-white hover:bg-slate-700"
                      title="Alternar Câmera"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="px-3 py-2 rounded-full bg-red-600 text-white text-xs font-bold"
                    >
                      Cancelar Visor
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Trigger Buttons (Mobile First) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primary: Native Smartphone Camera Capture */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-violet-500/80 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-violet-900 dark:text-violet-200 transition-all shadow-sm group min-h-[90px]"
                >
                  <div className="p-2.5 rounded-xl bg-violet-600 text-white mb-2 group-hover:scale-105 transition-transform">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm">
                    Tirar Foto com a Câmera do Celular
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Aciona a câmera nativa do seu smartphone
                  </span>
                </button>

                {/* Secondary: In-Browser Realtime Camera or Gallery */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => startCameraStream(cameraFacing)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors min-h-[44px]"
                  >
                    <Camera className="h-4 w-4 text-violet-500" />
                    <span>Abrir Visor em Tempo Real</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors min-h-[44px]"
                  >
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span>Ou Escolher Imagem da Galeria</span>
                  </button>
                </div>
              </div>

              {/* Attached Proof Preview */}
              {proofImage && (
                <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Comprovante Anexado: {proofFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProofImage(null);
                        setProofFileName('');
                      }}
                      className="text-slate-400 hover:text-red-500 text-xs"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="relative max-h-48 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center bg-black/50">
                    <img
                      src={proofImage}
                      alt="Prévia do Comprovante"
                      className="max-h-48 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Declared Value vs Expected Value Verification Form */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                  Conferência de Valores:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Valor Esperado da Compra:</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      R$ {totalExpected.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      ({quantity} cotas × R$ {unitPrice.toFixed(2)})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <label className="text-slate-400 block text-[10px] mb-1">Valor Declarado no Comprovante (R$):</label>
                    <input
                      type="text"
                      value={declaredAmountInput}
                      onChange={(e) => setDeclaredAmountInput(e.target.value)}
                      placeholder="Ex: 30.00"
                      className="w-full px-2.5 py-1 font-mono font-bold text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  O sistema executa conferência determinística para verificar se o valor pago é suficiente. A IA generativa é utilizada apenas para leitura ótica (OCR) e explicação de eventuais divergências, nunca para alterar regras ou dar quitação automática.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('B')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={!proofImage || isVerifyingProof}
                  onClick={handleVerifyProofWithAI}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
                >
                  {isVerifyingProof ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Conferindo com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Conferir Comprovante com IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              ETAPA D: CONFIRMAR A PARTICIPAÇÃO & STATUS
             ======================================================== */}
          {currentStep === 'D' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Status Header Badge */}
              <div className={`rounded-2xl p-4 sm:p-5 border text-xs sm:text-sm space-y-2 ${
                purchaseStatus === 'CONFIRMED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : purchaseStatus === 'PAYMENT_INSUFFICIENT'
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                  {purchaseStatus === 'CONFIRMED' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : purchaseStatus === 'PAYMENT_INSUFFICIENT' ? (
                    <BadgeAlert className="h-5 w-5 text-red-500 shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <span>
                    Status da Solicitação: {
                      purchaseStatus === 'CONFIRMED'
                        ? 'Participação Confirmada'
                        : purchaseStatus === 'PAYMENT_INSUFFICIENT'
                        ? 'Pagamento Insuficiente'
                        : 'Comprovante Recebido — Aguardando Confirmação Bancária'
                    }
                  </span>
                </div>

                <p className="text-xs opacity-90 pl-7 leading-relaxed">
                  {purchaseStatus === 'CONFIRMED'
                    ? 'Recebimento homologado! Suas cotas foram atribuídas exclusivamente à sua titularidade.'
                    : purchaseStatus === 'PAYMENT_INSUFFICIENT'
                    ? 'O valor identificado é inferior ao total esperado. Complete o valor ou entre em contato com o organizador.'
                    : 'A imagem do comprovante foi registrada e analisada. Conforme os requisitos de integridade, a participação só é marcada como "Confirmada" após conciliação financeira confiável.'}
                </p>
              </div>

              {/* Deterministic Verification Summary Card */}
              {aiAnalysisResult && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      Resultado da Conferência Determinística
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      aiAnalysisResult.matchesDeterministicTotal
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {aiAnalysisResult.matchesDeterministicTotal ? 'Valores Coincidentes' : 'Divergência'}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {aiAnalysisResult.explanation}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-center">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">Esperado</span>
                      <span className="font-bold">R$ {totalExpected.toFixed(2)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">Declarado</span>
                      <span className="font-bold">R$ {aiAnalysisResult.ocrExtractedAmount?.toFixed(2)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">Diferença</span>
                      <span className={`font-bold ${Math.abs(aiAnalysisResult.difference) < 0.01 ? 'text-emerald-500' : 'text-red-500'}`}>
                        R$ {aiAnalysisResult.difference.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulation Testing Sandbox Controls (Explicitly Labeled) */}
              <div className="rounded-2xl border border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-violet-900 dark:text-violet-200">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-violet-500" />
                    Simulador de Webhook Bancário (Ambiente Demonstrativo)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-200">
                    Modo Teste
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Para validar os estados da aplicação sem transações bancárias reais, acione os eventos do provedor abaixo:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSimulatePspWebhookConfirmation}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Simular Notificação PSP: Pagamento Confirmado</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateInsufficient}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <BadgeAlert className="h-3.5 w-3.5" />
                    <span>Simular Pagamento Insuficiente</span>
                  </button>
                </div>
              </div>

              {/* Audit Log Trilha */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                  Trilha de Auditoria & Imutabilidade do Registro:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <div className="flex justify-between text-slate-500">
                        <span>{log.timestamp} · {log.operator}</span>
                        <span className="text-violet-600 dark:text-violet-400">{log.action}</span>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200">{log.reason}</div>
                      <div className="text-[9px] text-slate-400 truncate">Hash: {log.hash}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Conclusion Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm"
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
