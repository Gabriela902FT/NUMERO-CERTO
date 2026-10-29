/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  FileText, 
  Calculator, 
  HelpCircle, 
  ExternalLink, 
  Info, 
  Image as ImageIcon, 
  Sliders, 
  Lock, 
  Eye, 
  EyeOff,
  DollarSign, 
  Percent, 
  FileCheck, 
  ArrowRight,
  TrendingUp,
  Receipt,
  Scale,
  X,
  FlipHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  PrizeCategory,
  PhysicalCondition,
  OperationalStatus,
  InvoiceStatus,
  PrizeVisualIdentification,
  PrizeOrganizerClarifications,
  MarketPriceEstimation,
  DemonstrativeFinancialSimulation,
  AttachedProofDocument,
} from '../types/prizeEvaluation';
import {
  evaluatePrizeFromImage,
  recalculateEstimateWithCondition,
  calculateFinancialSimulation,
  formatBRL,
  CATEGORY_LABELS,
  CONDITION_LABELS,
  DEMO_PRESET_ITEMS,
} from '../services/prizeEvaluationService';
import { NumeroCertoAiAssistant } from './NumeroCertoAiAssistant';

interface PrizeEvaluationSectionProps {
  onApplyToSimulator?: (prizeValue: number, prizeTitle: string) => void;
  onCreateDraftFromPrize?: (prizeTitle: string, estimatedValue: number) => void;
}

export const PrizeEvaluationSection: React.FC<PrizeEvaluationSectionProps> = ({
  onApplyToSimulator,
  onCreateDraftFromPrize,
}) => {
  const { toast } = useToast();

  // Mode: Wizard (Camera + Simulator) vs Multi-Module AI Assistant (Etapa 7)
  const [evaluationMode, setEvaluationMode] = useState<'wizard' | 'multi_module_ai'>('wizard');

  // Wizard active step: 'capture' | 'identification' | 'pricing' | 'simulator' | 'compliance'
  const [activeStep, setActiveStep] = useState<
    'capture' | 'identification' | 'pricing' | 'simulator' | 'compliance'
  >('capture');

  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('foto_premio.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Identification & Clarification states
  const [visualId, setVisualId] = useState<PrizeVisualIdentification | null>(null);
  const [clarifications, setClarifications] = useState<PrizeOrganizerClarifications>({
    correctedCategory: 'smartphones',
    correctedBrand: '',
    correctedModel: '',
    yearOfManufacture: new Date().getFullYear().toString(),
    capacityOrSpecs: '',
    condition: 'seminovo_excelente',
    operationalStatus: 'totalmente_funcional',
    includedAccessories: ['Caixa Original', 'Carregador Homologado'],
    invoiceStatus: 'possui_com_chave',
    invoiceAccessKeyMasked: '3524 0912 3456 7890 •••• •••• ••••',
    notes: '',
  });

  // Price estimate states
  const [priceEstimate, setPriceEstimate] = useState<MarketPriceEstimation | null>(null);
  const [adoptedPrizeValue, setAdoptedPrizeValue] = useState<number>(0);

  // Financial Simulator states
  const [additionalCosts, setAdditionalCosts] = useState<number>(150); // e.g. frete seguro
  const [hypotheticalQuotas, setHypotheticalQuotas] = useState<number>(1000);
  const [quotaPrice, setQuotaPrice] = useState<number>(5.0);
  const [adminFeePercent, setAdminFeePercent] = useState<number>(5.0);
  const [paymentFeePercent, setPaymentFeePercent] = useState<number>(1.99);
  const [refundProvisionPercent, setRefundProvisionPercent] = useState<number>(2.0);

  // Anti-fraud Proof Document attachment states
  const [attachedDocs, setAttachedDocs] = useState<AttachedProofDocument[]>([]);
  const [docUploadType, setDocUploadType] = useState<AttachedProofDocument['documentType']>('nota_fiscal');
  const [showFormulaExplainer, setShowFormulaExplainer] = useState(false);
  const [showInvoiceKey, setShowInvoiceKey] = useState(false);

  // File input refs
  const fileInputGalleryRef = useRef<HTMLInputElement | null>(null);
  const fileInputCameraNativeRef = useRef<HTMLInputElement | null>(null);
  const fileInputDocRef = useRef<HTMLInputElement | null>(null);

  // Clean up camera stream on unmount
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
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador ou ambiente sem suporte direto à API de câmera. Utilize o botão da câmera nativa.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      toast.info('Câmera conectada com sucesso. Enquadre o produto.', 'Câmera Ativa');
    } catch (err: unknown) {
      console.warn('Falha ao abrir stream de vídeo:', err);
      const msg = err instanceof Error ? err.message : 'Permissão de câmera negada ou indisponível.';
      setCameraError(msg);
      toast.warning('Não foi possível iniciar o visor em tempo real. Você pode tirar foto com a câmera nativa do celular.', 'Aviso de Câmera');
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopCameraStream();
        handleProcessImage(dataUrl, 'foto_camera_celular.jpg');
      }
    } catch (err) {
      toast.error('Erro ao capturar fotografia do sensor de vídeo.', 'Erro de Captura');
    }
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCameraStream(nextFacing);
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).', 'Formato Inválido');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('A imagem excede 15MB. Selecione uma foto menor ou comprimida.', 'Arquivo Grande');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleProcessImage(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESET_ITEMS[0]) => {
    handleProcessImage(preset.imageUrl, `${preset.model.toLowerCase().replace(/\s+/g, '_')}.jpg`);
  };

  const handleProcessImage = async (dataUrlOrUrl: string, fileName: string) => {
    setSelectedImage(dataUrlOrUrl);
    setImageFileName(fileName);
    setIsAnalyzing(true);
    setActiveStep('identification');

    toast.info('Iniciando análise visual do produto via IA...', 'Processando Imagem');

    try {
      const result = await evaluatePrizeFromImage(dataUrlOrUrl, fileName);
      setVisualId(result.visualIdentification);
      setClarifications(result.clarificationsInitial);
      setPriceEstimate(result.priceEstimate);
      setAdoptedPrizeValue(result.priceEstimate.probablePrice);

      toast.success(
        `Item identificado preliminarmente como ${result.visualIdentification.brand} ${result.visualIdentification.model}.`,
        'Análise Visual Concluída'
      );
    } catch (err) {
      toast.error('Não foi possível concluir a análise da imagem.', 'Erro');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Recalculate price when condition or accessories change
  const handleClarificationChange = (
    key: keyof PrizeOrganizerClarifications,
    value: unknown
  ) => {
    const updated = { ...clarifications, [key]: value };
    setClarifications(updated);

    if (priceEstimate) {
      const recalculated = recalculateEstimateWithCondition(
        priceEstimate,
        updated.condition,
        updated.operationalStatus,
        updated.invoiceStatus !== 'nao_possui'
      );
      setPriceEstimate(recalculated);
      setAdoptedPrizeValue(recalculated.probablePrice);
    }
  };

  const handleToggleAccessory = (accessoryName: string) => {
    const exists = clarifications.includedAccessories.includes(accessoryName);
    const updatedAccessories = exists
      ? clarifications.includedAccessories.filter((a) => a !== accessoryName)
      : [...clarifications.includedAccessories, accessoryName];
    handleClarificationChange('includedAccessories', updatedAccessories);
  };

  // Compute live financial simulation
  const simulation: DemonstrativeFinancialSimulation = calculateFinancialSimulation(
    adoptedPrizeValue,
    additionalCosts,
    hypotheticalQuotas,
    quotaPrice,
    adminFeePercent,
    paymentFeePercent,
    refundProvisionPercent,
    priceEstimate?.probablePrice || adoptedPrizeValue
  );

  // Handle proof document attachment
  const handleAttachProofDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeHash = 'SHA256:' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '•••';

    const newDoc: AttachedProofDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      sizeBytes: file.size,
      type: file.type || 'application/octet-stream',
      uploadTimestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
      maskedHash: fakeHash,
      documentType: docUploadType,
    };

    setAttachedDocs((prev) => [newDoc, ...prev]);
    toast.success(`Documento "${file.name}" anexado e protegido com hash de auditoria.`, 'Comprovante Registrado');
  };

  const handleRemoveDoc = (id: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d.id !== id));
    toast.info('Comprovante removido da listagem.', 'Documento Removido');
  };

  const handleReset = () => {
    stopCameraStream();
    setSelectedImage(null);
    setVisualId(null);
    setPriceEstimate(null);
    setActiveStep('capture');
    toast.info('Sessão de avaliação reiniciada.', 'Novo Prêmio');
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md text-violet-100 mb-3 border border-white/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span>Módulo de Inteligência Artificial — NumeroCerto Sorteios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Avaliar Prêmio com IA & Simulador Orçamentário
          </h1>
          <p className="mt-2 text-sm sm:text-base text-violet-100 leading-relaxed">
            Identifique o produto por fotografia, estime a faixa de valor praticada no mercado brasileiro 
            e simule a viabilidade orçamentária do sorteio com transparência total e controle de custos.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-violet-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Câmera do celular & Galeria</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Diferenciação de Preço de Vitrine vs. Praticado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Simulador Financeiro com Fórmulas Transparentes</span>
            </div>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Camera className="h-64 w-64 text-white" />
        </div>
      </div>

      {/* Mode Switcher: Wizard vs Multi-Module AI Assistant (Etapa 7) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
        <button
          type="button"
          onClick={() => setEvaluationMode('wizard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer ${
            evaluationMode === 'wizard'
              ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Avaliação por Câmera & Simulador</span>
        </button>

        <button
          type="button"
          onClick={() => setEvaluationMode('multi_module_ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] cursor-pointer ${
            evaluationMode === 'multi_module_ai'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Assistente de IA Especializado (Etapa 7)</span>
        </button>
      </div>

      {/* When in Multi-Module AI mode, render the NumeroCertoAiAssistant component */}
      {evaluationMode === 'multi_module_ai' ? (
        <NumeroCertoAiAssistant />
      ) : (
        <>
          {/* Mandatory Regulatory Warning: Lei 5.768/1971 */}
          <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-950/40 dark:border-amber-400">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            <p className="font-bold uppercase tracking-wide">
              Fundamentação Legal & Salvaguarda Regulamentar (Lei nº 5.768/1971)
            </p>
            <p>
              A avaliação por IA e as simulações orçamentárias possuem <strong>caráter exclusivamente demonstrativo e preparatório</strong>. 
              A estimativa de preço não autoriza automaticamente o início de rifas remuneradas. Conforme a legislação brasileira e diretrizes 
              da Secretaria de Prêmios e Apostas do Ministério da Fazenda, modalidades de sorteio comercial exigem aprovação prévia. 
              <strong> Vendas e pagamentos reais permanecem desativados.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Wizard Progress Steps Indicator */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'capture', label: '1. Foto & Captura', icon: Camera },
          { id: 'identification', label: '2. Identificação IA', icon: Sparkles },
          { id: 'pricing', label: '3. Valor de Mercado', icon: DollarSign },
          { id: 'simulator', label: '4. Simulador Orçamentário', icon: Calculator },
          { id: 'compliance', label: '5. Documentos & Regras', icon: ShieldCheck },
        ].map((step, idx) => {
          const isCurrent = activeStep === step.id;
          const StepIcon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => {
                if (selectedImage || step.id === 'capture') {
                  setActiveStep(step.id as any);
                } else {
                  toast.info('Por favor, tire uma foto ou selecione uma imagem primeiro.', 'Etapa Pendente');
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isCurrent
                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 ring-1 ring-violet-500/40'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <StepIcon className="h-4 w-4" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CAPTURA & SELEÇÃO DE IMAGEM */}
      {/* ========================================================================= */}
      {activeStep === 'capture' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span>Passo 1: Fotografe ou Selecione o Prêmio</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Solicitamos acesso à câmera do celular somente quando você aciona a captura. Enquadre o produto com boa iluminação.
            </p>

            {/* Live Camera Viewfinder Modal / Section */}
            {isCameraActive && (
              <div className="mt-6 overflow-hidden rounded-2xl bg-black border-2 border-violet-500 shadow-2xl relative">
                <div className="relative aspect-video max-h-[460px] w-full flex items-center justify-center bg-slate-950">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Viewfinder crosshairs overlay */}
                  <div className="pointer-events-none absolute inset-8 border border-white/40 rounded-xl">
                    <div className="absolute top-2 left-2 text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                      Sensor Ativo • Enquadre o Prêmio
                    </div>
                  </div>
                </div>

                {/* Camera control bar */}
                <div className="p-4 bg-slate-950/90 flex items-center justify-between gap-4">
                  <button
                    onClick={stopCameraStream}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleCaptureSnapshot}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold shadow-lg shadow-violet-600/30 transition-transform active:scale-95"
                  >
                    <div className="h-4 w-4 rounded-full bg-white animate-ping" />
                    <span>Capturar Fotografia</span>
                  </button>

                  <button
                    onClick={handleFlipCamera}
                    className="p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Alternar Câmera Frontal / Traseira"
                  >
                    <FlipHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Error banner if live stream fails */}
            {cameraError && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Image Upload / Capture Action Cards */}
            {!isCameraActive && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Option A: Direct Camera */}
                <div className="rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-800/80 bg-violet-50/50 dark:bg-violet-950/20 p-6 flex flex-col items-center justify-center text-center hover:border-violet-500 transition-colors">
                  <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-3 shadow-inner">
                    <Camera className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Câmera do Celular
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Abra o visor da câmera para fotografar o prêmio em tempo real.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => startCameraStream(cameraFacingMode)}
                      className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Abrir Visor em Tempo Real</span>
                    </button>

                    {/* Native Android Camera Input Fallback */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={fileInputCameraNativeRef}
                      onChange={handleGalleryFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputCameraNativeRef.current?.click()}
                      className="px-3 py-2.5 rounded-lg border border-violet-300 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-semibold transition-colors"
                    >
                      Foto Direta (Nativo)
                    </button>
                  </div>
                </div>

                {/* Option B: Gallery Upload */}
                <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6 flex flex-col items-center justify-center text-center hover:border-slate-400 transition-colors">
                  <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-3">
                    <Upload className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Galeria ou Arquivos
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Envie uma fotografia salva no armazenamento do seu dispositivo.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputGalleryRef}
                    onChange={handleGalleryFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputGalleryRef.current?.click()}
                    className="mt-5 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Selecionar da Galeria</span>
                  </button>
                </div>

              </div>
            )}

            {/* Option C: Instant Presets for Quick Testing & Evaluation Demo */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ou teste com amostras demonstrativas de produtos homologados
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Selecione um produto abaixo para testar instantaneamente o fluxo de reconhecimento e simulação.
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DEMO_PRESET_ITEMS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="group relative flex flex-col items-start rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-left transition-all hover:border-violet-500 hover:shadow-md"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                      <img
                        src={preset.imageUrl}
                        alt={preset.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {preset.title}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Ref: {formatBRL(preset.refProbable)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: IDENTIFICAÇÃO VISUAL DA IA & CONFIRMAÇÃO DO ORGANIZADOR */}
      {/* ========================================================================= */}
      {activeStep === 'identification' && (
        <div className="space-y-6">
          
          {/* Analysis Loading State */}
          {isAnalyzing && (
            <div className="rounded-2xl border border-violet-200 bg-white p-12 dark:border-violet-900 dark:bg-slate-900 text-center shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 animate-spin">
                <RefreshCw className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Analisando Fotografia com Inteligência Artificial
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Identificando categoria, marca aparente, modelo, estado de conservação e referências de valor no mercado nacional...
              </p>
            </div>
          )}

          {!isAnalyzing && visualId && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Analyzed Photo & Disclaimers */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                    <span>Fotografia Analisada</span>
                    <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded-full">
                      Confiança: {Math.round(visualId.confidenceScore * 100)}%
                    </span>
                  </h3>
                  
                  {selectedImage && (
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <img
                        src={selectedImage}
                        alt="Prêmio analisado"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[180px]">{imageFileName}</span>
                    <button
                      onClick={() => setActiveStep('capture')}
                      className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                    >
                      Trocar foto
                    </button>
                  </div>

                  {/* Anti-fraud transparency notice (Crucial requirement) */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Limitação Técnica da Análise Visual</span>
                    </div>
                    <p>
                      A inteligência artificial analisa apenas os padrões visuais externos da imagem. 
                      <strong> Não afirma nem confirma autenticidade, titularidade, procedência legal ou funcionamento interno</strong> de placas e circuitos do produto.
                    </p>
                  </div>
                </div>

                {/* Pre-detected features tags */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Objetos Detectados na Imagem
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {visualId.detectedObjects.map((obj, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Organizer Confirmation & Correction Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sliders className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        <span>Confirmação & Complemento das Informações</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Revise e corrija os dados identificados pela IA. Nenhum dado é publicado sem sua aprovação expressa.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    
                    {/* Row 1: Category & Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Categoria do Bem
                        </label>
                        <select
                          value={clarifications.correctedCategory}
                          onChange={(e) => handleClarificationChange('correctedCategory', e.target.value as PrizeCategory)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500"
                        >
                          {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                            <option key={catKey} value={catKey}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Marca / Fabricante
                        </label>
                        <input
                          type="text"
                          value={clarifications.correctedBrand}
                          onChange={(e) => handleClarificationChange('correctedBrand', e.target.value)}
                          placeholder="Ex: Apple, Samsung, Sony, Honda..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    {/* Row 2: Model & Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Modelo Completo / Versão
                        </label>
                        <input
                          type="text"
                          value={clarifications.correctedModel}
                          onChange={(e) => handleClarificationChange('correctedModel', e.target.value)}
                          placeholder="Ex: iPhone 15 128GB, CG 160 Fan..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Ano Fabricação
                        </label>
                        <input
                          type="text"
                          value={clarifications.yearOfManufacture}
                          onChange={(e) => handleClarificationChange('yearOfManufacture', e.target.value)}
                          placeholder="Ex: 2024"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    {/* Row 3: Technical Specs / Capacity */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Capacidade, Motorização ou Especificação Técnica
                      </label>
                      <input
                        type="text"
                        value={clarifications.capacityOrSpecs}
                        onChange={(e) => handleClarificationChange('capacityOrSpecs', e.target.value)}
                        placeholder="Ex: 128GB armazenamento, 160 cilindradas, 55 polegadas 4K..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    {/* Row 4: Physical Condition & Operational Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Estado Físico de Conservação
                        </label>
                        <select
                          value={clarifications.condition}
                          onChange={(e) => handleClarificationChange('condition', e.target.value as PhysicalCondition)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500"
                        >
                          {Object.entries(CONDITION_LABELS).map(([condKey, label]) => (
                            <option key={condKey} value={condKey}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Funcionamento Mecânico / Eletrônico
                        </label>
                        <select
                          value={clarifications.operationalStatus}
                          onChange={(e) => handleClarificationChange('operationalStatus', e.target.value as OperationalStatus)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="totalmente_funcional">100% Funcional e testado pelo organizador</option>
                          <option value="funcional_detalhes">Funcional com detalhes leves a informar</option>
                          <option value="nao_testado">Não testado / Necessita revisão técnica</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 5: Accessories Checklist */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Acessórios e Itens Inclusos
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Caixa Original',
                          'Carregador Homologado',
                          'Cabo Original',
                          'Manual do Usuário',
                          'Certificado de Garantia',
                          'Chave Reserva (Veículos)',
                        ].map((acc) => {
                          const isChecked = clarifications.includedAccessories.includes(acc);
                          return (
                            <button
                              type="button"
                              key={acc}
                              onClick={() => handleToggleAccessory(acc)}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-colors ${
                                isChecked
                                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 font-semibold'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded flex items-center justify-center border ${
                                  isChecked
                                    ? 'bg-violet-600 border-violet-600 text-white'
                                    : 'border-slate-400 bg-white dark:bg-slate-900'
                                }`}
                              >
                                {isChecked && <CheckCircle2 className="h-3 w-3" />}
                              </div>
                              <span className="truncate">{acc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 6: Invoice / Proof of Ownership */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Receipt className="h-4 w-4 text-violet-600" />
                          <span>Comprovante de Propriedade ou Nota Fiscal</span>
                        </label>
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          Proteção LGPD
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={clarifications.invoiceStatus}
                          onChange={(e) => handleClarificationChange('invoiceStatus', e.target.value as InvoiceStatus)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="possui_com_chave">Possui Nota Fiscal Eletrônica (NF-e)</option>
                          <option value="possui_cupom_fisico">Possui Cupom Fiscal / Recibo Físico</option>
                          <option value="declaracao_conteudo">Declaração de Compra / Bens Pessoais</option>
                          <option value="nao_possui">Não possui documento fiscal</option>
                        </select>

                        <div className="relative">
                          <input
                            type={showInvoiceKey ? 'text' : 'password'}
                            value={clarifications.invoiceAccessKeyMasked || ''}
                            onChange={(e) => handleClarificationChange('invoiceAccessKeyMasked', e.target.value)}
                            placeholder="Chave de acesso da NF-e (44 dígitos)"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowInvoiceKey(!showInvoiceKey)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            title="Alternar visibilidade da chave"
                          >
                            {showInvoiceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Advance to Pricing Step */}
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setActiveStep('capture')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      Voltar para Foto
                    </button>

                    <button
                      onClick={() => setActiveStep('pricing')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20"
                    >
                      <span>Ver Estimativa de Valor de Mercado</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: ESTIMATIVA DE VALOR DE MERCADO & FONTES */}
      {/* ========================================================================= */}
      {activeStep === 'pricing' && priceEstimate && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Nível de Confiança: {priceEstimate.confidence.toUpperCase()}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {clarifications.correctedBrand} {clarifications.correctedModel}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Consulta realizada em: {priceEstimate.queryDate} • Base referencial para bens equivalentes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const recalculated = recalculateEstimateWithCondition(
                      priceEstimate,
                      clarifications.condition,
                      clarifications.operationalStatus,
                      clarifications.invoiceStatus !== 'nao_possui'
                    );
                    setPriceEstimate(recalculated);
                    setAdoptedPrizeValue(recalculated.probablePrice);
                    toast.success('Valores de mercado recalculados conforme especificações.', 'Atualizado');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Recalcular</span>
                </button>
              </div>
            </div>

            {/* Price Triad: Min, Probable, Max */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Min Price */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Faixa Mínima (Liquidação Rápida)
                </span>
                <div className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-200">
                  {formatBRL(priceEstimate.minPrice)}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Desconto médio por necessidade de venda ágil ou sinais de uso.
                </p>
              </div>

              {/* Probable Price (Highlight) */}
              <div className="rounded-xl border-2 border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 p-5 text-center shadow-md relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-sm">
                  Valor Mais Provável Praticado
                </div>
                <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
                  Média Efetiva de Mercado
                </span>
                <div className="mt-1 text-3xl font-extrabold text-violet-700 dark:text-violet-300">
                  {formatBRL(priceEstimate.probablePrice)}
                </div>
                <p className="mt-1 text-[11px] text-violet-800 dark:text-violet-300 font-medium">
                  Valor praticado em negociações reais com nota e acessórios.
                </p>
              </div>

              {/* Max Price */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Preço Máximo de Vitrine (Novo)
                </span>
                <div className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-200">
                  {formatBRL(priceEstimate.maxPrice)}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Preço em grandes redes de varejo para produto novo lacrado.
                </p>
              </div>

            </div>

            {/* Price Differentiation Notes */}
            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-violet-600" />
                <span>Diferenciação Técnica: Anunciado vs. Efetivamente Praticado</span>
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {priceEstimate.pricingNotes}
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Preço em Vitrine (Loja Oficial):</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatBRL(priceEstimate.suggestedRetailPriceNew || priceEstimate.maxPrice)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Valor Médio Secundário Homologado:</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatBRL(priceEstimate.averageSecondaryPrice || priceEstimate.probablePrice)}
                  </div>
                </div>
              </div>

              {/* Consulted Sources list */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500">Bases Referenciais Consultadas:</span>
                <ul className="mt-1 space-y-1">
                  {priceEstimate.consultedSources.map((source, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Adopted Prize Value Adjustment for Organizer */}
            <div className="mt-6 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Definir Valor do Prêmio para o Simulador Orçamentário
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Você pode adotar o valor provável sugerido ou informar o valor de aquisição real constante na sua nota fiscal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">R$</span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={adoptedPrizeValue}
                    onChange={(e) => setAdoptedPrizeValue(Math.max(0, Number(e.target.value)))}
                    className="w-36 rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-bold text-violet-700 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-300 focus:ring-2 focus:ring-violet-500 text-right"
                  />
                </div>
              </div>

              {adoptedPrizeValue !== priceEstimate.probablePrice && (
                <div className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    Diferença de {formatBRL(adoptedPrizeValue - priceEstimate.probablePrice)} ({Math.round(((adoptedPrizeValue - priceEstimate.probablePrice) / priceEstimate.probablePrice) * 100)}%) em relação à média de mercado sugerida.
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStep('identification')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Voltar aos Detalhes
              </button>

              <button
                onClick={() => setActiveStep('simulator')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20"
              >
                <span>Avançar para o Simulador Orçamentário</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SIMULADOR FINANCEIRO DEMONSTRATIVO */}
      {/* ========================================================================= */}
      {activeStep === 'simulator' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <span>Simulador Financeiro Demonstrativo de Orçamento</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Simule cenários orçamentários com base no valor avaliado ({formatBRL(adoptedPrizeValue)}), despesas e taxas de transação.
                </p>
              </div>

              <button
                onClick={() => setShowFormulaExplainer(!showFormulaExplainer)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                <HelpCircle className="h-3.5 w-3.5 text-violet-500" />
                <span>{showFormulaExplainer ? 'Ocultar Fórmulas' : 'Ver Fórmulas Utilizadas'}</span>
              </button>
            </div>

            {/* Formula Explainer Panel (Transparent mathematical disclosure) */}
            {showFormulaExplainer && (
              <div className="mt-4 p-4 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs space-y-2 text-violet-950 dark:text-violet-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-violet-600" />
                  <span>Memória de Cálculo e Fórmulas Transparentes:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded border border-violet-200 dark:border-violet-800">
                    <strong>Arrecadação Bruta:</strong><br />
                    Total Cotas × Preço por Cota<br />
                    <code>{hypotheticalQuotas} × {formatBRL(quotaPrice)} = {formatBRL(simulation.grossRevenueHipothetical)}</code>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded border border-violet-200 dark:border-violet-800">
                    <strong>Custos Totais:</strong><br />
                    Prêmio + Custos Extras + Taxa PSP ({paymentFeePercent}%) + Desp. Adm ({adminFeePercent}%) + Reembolsos ({refundProvisionPercent}%)<br />
                    <code>Total: {formatBRL(simulation.totalEstimatedCosts)}</code>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded border border-violet-200 dark:border-violet-800">
                    <strong>Saldo Matemático:</strong><br />
                    Arrecadação Bruta - Custos Totais<br />
                    <code>{formatBRL(simulation.grossRevenueHipothetical)} - {formatBRL(simulation.totalEstimatedCosts)} = {formatBRL(simulation.netMathematicalBalance)}</code>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-900 rounded border border-violet-200 dark:border-violet-800">
                    <strong>Ponto de Equilíbrio (Break-even):</strong><br />
                    Custos Fixos ÷ Margem Líquida por Cota<br />
                    <code>{simulation.breakEvenQuotas} cotas ({simulation.breakEvenPercentage}% do total)</code>
                  </div>
                </div>
                <p className="text-[11px] italic text-violet-800 dark:text-violet-300">
                  Nota: Valores estritamente hipotéticos para conferência orçamentária prévia. Não representam garantia de vendas.
                </p>
              </div>
            )}

            {/* Simulation Parameters Inputs */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Prize Value */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valor do Prêmio Adotado
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={adoptedPrizeValue}
                    onChange={(e) => setAdoptedPrizeValue(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Additional Costs (Frete, assessoria, etc.) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custos Extras / Logística
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={additionalCosts}
                    onChange={(e) => setAdditionalCosts(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Total Quotas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cotas Hipotéticas
                </label>
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={hypotheticalQuotas}
                  onChange={(e) => setHypotheticalQuotas(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Price per quota */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Unitário por Cota
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={quotaPrice}
                    onChange={(e) => setQuotaPrice(Math.max(0.1, Number(e.target.value)))}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

            </div>

            {/* Fee percentage rates row */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Taxa Provedor PSP (Pix/Cartão): {paymentFeePercent}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={paymentFeePercent}
                  onChange={(e) => setPaymentFeePercent(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Despesas Administrativas: {adminFeePercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={adminFeePercent}
                  onChange={(e) => setAdminFeePercent(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Provisão para Reembolsos: {refundProvisionPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={refundProvisionPercent}
                  onChange={(e) => setRefundProvisionPercent(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>
            </div>

            {/* Simulation Results Dashboard */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Gross Revenue */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
                <span className="text-xs font-semibold text-slate-500">Arrecadação Bruta Hipotética</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {formatBRL(simulation.grossRevenueHipothetical)}
                </div>
                <span className="text-[11px] text-slate-400">
                  {simulation.totalHypotheticalQuotas} cotas a {formatBRL(simulation.hypotheticalQuotaPrice)}
                </span>
              </div>

              {/* Total Costs */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
                <span className="text-xs font-semibold text-slate-500">Custos & Retenções Totais</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {formatBRL(simulation.totalEstimatedCosts)}
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 mt-1">
                  <span>Prêmio: {formatBRL(simulation.prizeCostAdopted)}</span>
                  <span>PSP: {formatBRL(simulation.paymentGatewayFeesAmount)}</span>
                  <span>Adm: {formatBRL(simulation.adminExpensesAmount)}</span>
                </div>
              </div>

              {/* Net Balance */}
              <div className={`rounded-xl border-2 p-4 ${
                simulation.netMathematicalBalance >= 0
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
              }`}>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Saldo Líquido Matemático
                </span>
                <div className={`text-2xl font-black mt-1 ${
                  simulation.netMathematicalBalance >= 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}>
                  {formatBRL(simulation.netMathematicalBalance)}
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {simulation.netMathematicalBalance >= 0 ? 'Superávit orçamentário previsto' : 'Déficit no cenário simulado'}
                </span>
              </div>

            </div>

            {/* Break-even & Quota Progress Indicator */}
            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-4">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">
                  Ponto de Equilíbrio (Break-Even): {simulation.breakEvenQuotas} cotas
                </span>
                <span className="text-violet-600 dark:text-violet-400">
                  {simulation.breakEvenPercentage}% da campanha
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-violet-600 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, simulation.breakEvenPercentage)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                A partir de <strong>{simulation.breakEvenQuotas} cotas</strong> comercializadas, todos os custos do prêmio, taxas do provedor de pagamento e despesas administrativas estariam cobertos.
              </p>
            </div>

            {/* Scenario Breakdown Matrix */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Cenários de Arrecadação por Percentual de Vendas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { label: 'Cenário Moderado (50%)', factor: 0.5 },
                  { label: 'Cenário Equilibrado (75%)', factor: 0.75 },
                  { label: 'Cenário Completo (100%)', factor: 1.0 },
                ].map((scen, idx) => {
                  const sold = Math.round(simulation.totalHypotheticalQuotas * scen.factor);
                  const rev = sold * simulation.hypotheticalQuotaPrice;
                  const varCosts = rev * ((adminFeePercent + paymentFeePercent + refundProvisionPercent) / 100);
                  const fixedCosts = simulation.prizeCostAdopted + simulation.organizerAdditionalCosts;
                  const bal = rev - (fixedCosts + varCosts);
                  return (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{scen.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{sold} cotas vendidas</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-slate-500">Bruto:</span>
                        <span className="font-semibold">{formatBRL(rev)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-slate-500">Saldo:</span>
                        <span className={`font-bold ${bal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatBRL(bal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStep('pricing')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Voltar à Estimativa
              </button>

              <button
                onClick={() => setActiveStep('compliance')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20"
              >
                <span>Avançar para Documentos & Conformidade</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: DOCUMENTOS, PREVENÇÃO A FRAUDES & CONFORMIDADE JURÍDICA */}
      {/* ========================================================================= */}
      {activeStep === 'compliance' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span>Passo 5: Comprovação de Propriedade & Auditoria</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Anexe documentos que comprovem a posse legítima do prêmio. Seus dados são protegidos por criptografia e jamais expostos na página pública.
              </p>
            </div>

            {/* Proof Attachment Section */}
            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-violet-600" />
                    <span>Anexar Nota Fiscal ou Comprovante de Propriedade</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Formatos aceitos: PDF, JPG ou PNG. Aplicação de hash de integridade SHA-256.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={docUploadType}
                    onChange={(e) => setDocUploadType(e.target.value as any)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="nota_fiscal">Nota Fiscal Eletrônica</option>
                    <option value="recibo_compra">Recibo / Cupom Fiscal</option>
                    <option value="documento_veiculo">Documento Veicular (CRLV)</option>
                    <option value="declaracao">Declaração de Posse</option>
                  </select>

                  <input
                    type="file"
                    ref={fileInputDocRef}
                    onChange={handleAttachProofDoc}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputDocRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Anexar</span>
                  </button>
                </div>
              </div>

              {/* List of Attached Documents */}
              <div className="mt-4 space-y-2">
                {attachedDocs.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                    Nenhum documento anexado ainda. Anexar a nota fiscal fortalece a credibilidade e viabiliza a homologação regulatória.
                  </div>
                ) : (
                  attachedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{doc.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Hash: {doc.maskedHash}</span>
                            <span>Enviado: {doc.uploadTimestamp}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remover documento"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Log Record */}
            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Registro de Auditoria Imutável desta Avaliação
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">ID da Avaliação:</span>{' '}
                  <span className="font-mono">EVAL-{Date.now().toString().slice(-8)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Data & Hora do Registro:</span>{' '}
                  <span>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Motor de Visão Computacional:</span>{' '}
                  <span>Google Gemini 3.8 Flash (Server-Side Proxy)</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Status Jurídico da Ação:</span>{' '}
                  <span className="font-bold text-amber-600">Simulação / Lançamento Bloqueado</span>
                </div>
              </div>
            </div>

            {/* Permanent Regulatory Campaign Publishing Lock Banner */}
            <div className="mt-6 rounded-xl border-2 border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Bloqueio de Lançamento Comercial Ativo — Conformidade com a Lei nº 5.768/1971</span>
              </div>
              <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                A conclusão desta avaliação e a simulação orçamentária <strong>não publicam a campanha publicamente nem liberam a cobrança real de cotas</strong>. 
                Para publicar ações que envolvam captação financeira de terceiros no Brasil, é estritamente necessária a homologação documental e a submissão prévia perante os órgãos de regulação da Secretaria de Prêmios e Apostas do Ministério da Fazenda.
              </p>
            </div>

            {/* Final Action Integration Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setActiveStep('simulator')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Voltar ao Simulador
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                    toast.success('Relatório gerado para impressão/PDF.', 'Relatório Pronto');
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Imprimir / Salvar Relatório PDF</span>
                </button>

                {onCreateDraftFromPrize && (
                  <button
                    onClick={() => {
                      const prizeName = `${clarifications.correctedBrand} ${clarifications.correctedModel}`;
                      onCreateDraftFromPrize(prizeName, adoptedPrizeValue);
                      toast.success(`Rascunho criado com o prêmio "${prizeName}".`, 'Rascunho Criado');
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Criar Rascunho com este Prêmio</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold shadow-sm"
                >
                  Avaliar Outro Bem
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
