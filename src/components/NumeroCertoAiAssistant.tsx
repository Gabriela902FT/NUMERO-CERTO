/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  RefreshCw, 
  Upload, 
  X, 
  HelpCircle, 
  FileCheck2, 
  CheckCircle2, 
  Calculator, 
  Scale, 
  Eye, 
  Clock, 
  Lock,
  Camera,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export type AiModuleType = 'prize_vision' | 'rules_safety' | 'finance' | 'transparency';

interface AiApiResponse {
  requestId: string;
  module: AiModuleType;
  answer: string;
  mode: 'gemini' | 'demo-fallback';
  warning: string;
}

const MODULE_DEFINITIONS: Record<AiModuleType, { title: string; subtitle: string; icon: any; placeholder: string; samplePrompts: string[] }> = {
  prize_vision: {
    title: 'Análise de Prêmio por Imagem',
    subtitle: 'Identificação visual, leitura de atributos observáveis e levantamento de divergências.',
    icon: Eye,
    placeholder: 'Descreva o item anunciado (ex: Smartphone 128GB preto seminovo) e adicione uma foto se desejar...',
    samplePrompts: [
      'Analisar compatibilidade entre iPhone 15 Pro 128GB Titânio Natural e foto da caixa lacrada.',
      'Verificar se características visuais de uma motocicleta Honda CG 160 Fan coincidem com o ano 2024.',
      'Identificar se a foto de videogame PlayStation 5 apresenta acessórios padrão (controle DualSense e cabos).'
    ]
  },
  rules_safety: {
    title: 'Regras, Conformidade & Segurança',
    subtitle: 'Detecção de campos faltantes, contradições no regulamento e salvaguardas legais.',
    icon: ShieldCheck,
    placeholder: 'Cole trechos do regulamento ou descreva a dinâmica da ação para análise de segurança...',
    samplePrompts: [
      'Ação beneficente com 1000 bilhetes a R$ 5,00 atrelada à Loteria Federal. Quais salvaguardas essenciais faltam?',
      'Se o participante não pagar o Pix em 15 minutos, como proceder com a liberação transparente do bilhete?',
      'Quais são os limites legais para uma associação de bairro sortear uma cesta de produtos artesanais?'
    ]
  },
  finance: {
    title: 'Análise Financeira & Cotas',
    subtitle: 'Simulação matemática de viabilidade, ponto de equilíbrio, taxas de intermediação e saldo.',
    icon: Calculator,
    placeholder: 'Informe quantidade de cotas, valor unitário, custo do prêmio e taxas previstas...',
    samplePrompts: [
      'Simular 1000 cotas a R$ 10,00, prêmio de R$ 3.500, despesa de R$ 300 e tarifa de pagamento de 1,99%.',
      'Qual o ponto de equilíbrio mínimo se o prêmio custar R$ 8.000 e forem emitidas 2.000 cotas a R$ 8,00?',
      'Como provisionar devidamente eventuais cancelamentos de compras de cotas feitas com cartão?'
    ]
  },
  transparency: {
    title: 'Transparência, Auditoria & Trilha',
    subtitle: 'Recomendações de preservação de evidências, logs invioláveis e apuração independente.',
    icon: Scale,
    placeholder: 'Pergunte sobre requisitos de auditoria, preservação de dados e transparência pública...',
    samplePrompts: [
      'Quais registros devem ser congelados e preservados no momento da extração da Loteria Federal?',
      'Como comprovar a integridade dos bilhetes vendidos sem expor os dados pessoais dos participantes?',
      'Qual a periodicidade recomendada para emissão de relatório público de cotas reservadas e pagas?'
    ]
  }
};

export const NumeroCertoAiAssistant: React.FC = () => {
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState<AiModuleType>('rules_safety');
  const [questionText, setQuestionText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; preview: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AiApiResponse | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const nativeCameraInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraStream = async (facing: 'environment' | 'user') => {
    stopCameraStream();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador sem suporte direto a WebRTC. Acionando a câmera do celular...');
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
      toast.info('Visor de câmera ativado. Enquadre o produto ou comprovante.', 'Câmera Aberta');
    } catch {
      nativeCameraInputRef.current?.click();
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const cleanBase64 = dataUrl.replace(/^data:[^,]+,/, '');
        setAttachedImage({
          base64: cleanBase64,
          mimeType: 'image/jpeg',
          preview: dataUrl,
          name: 'foto_camera_celular.jpg',
        });
        stopCameraStream();
        toast.success('Fotografia capturada diretamente da câmera do celular!', 'Foto Registrada');
      }
    } catch {
      toast.error('Erro ao processar captura de vídeo.', 'Falha');
    }
  };

  const handleNativeCameraPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const cleanBase64 = resultStr.replace(/^data:[^,]+,/, '');
      setAttachedImage({
        base64: cleanBase64,
        mimeType: file.type || 'image/jpeg',
        preview: resultStr,
        name: file.name || 'foto_camera.jpg'
      });
      toast.success('Foto da câmera recebida com sucesso!', 'Foto Carregada');
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Formato não suportado. Utilize JPEG, PNG ou WebP.', 'Arquivo Inválido');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('O tamanho máximo permitido para imagem no backend é de 3 MB.', 'Imagem Muito Grande');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const cleanBase64 = resultStr.replace(/^data:[^,]+,/, '');
      setAttachedImage({
        base64: cleanBase64,
        mimeType: file.type,
        preview: resultStr,
        name: file.name
      });
      toast.info(`Imagem "${file.name}" anexada da galeria.`, 'Imagem Carregada');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  const handleSelectSample = (sample: string) => {
    setQuestionText(sample);
  };

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim() || questionText.trim().length < 2) {
      toast.error('Digite uma pergunta com ao menos 2 caracteres.', 'Consulta Vazia');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        module: activeModule,
        question: questionText.trim(),
      };

      if (attachedImage) {
        payload.image = {
          mimeType: attachedImage.mimeType,
          base64: attachedImage.base64
        };
      }

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro do servidor (status ${res.status})`);
      }

      const data: AiApiResponse = await res.json();
      setLastResponse(data);
      toast.success('Análise de IA concluída conforme as diretrizes do sistema!', 'Resposta Pronta');
    } catch (err: unknown) {
      console.error('Falha na consulta AI:', err);
      toast.error(err instanceof Error ? err.message : 'Falha na conexão com o assistente.', 'Erro na Análise');
    } finally {
      setIsLoading(false);
    }
  };

  const currentModConfig = MODULE_DEFINITIONS[activeModule];
  const ModIcon = currentModConfig.icon;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>NumeroCerto AI — Assistente de Conformidade</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold uppercase">
                Etapa 7
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Análise baseada nos contratos de API do sistema para validação de prêmio, regras, finanças e auditoria.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <Lock className="h-3.5 w-3.5 text-emerald-500" />
          <span>Diretrizes Invioláveis Ativas</span>
        </div>
      </div>

      {/* Module Switcher Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {(Object.keys(MODULE_DEFINITIONS) as AiModuleType[]).map((modKey) => {
          const mod = MODULE_DEFINITIONS[modKey];
          const Icon = mod.icon;
          const isSelected = activeModule === modKey;

          return (
            <button
              key={modKey}
              type="button"
              onClick={() => {
                setActiveModule(modKey);
                setLastResponse(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all min-h-[58px] cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'border-violet-500 bg-violet-50/80 dark:bg-violet-950/50 text-violet-900 dark:text-violet-200 ring-2 ring-violet-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${isSelected ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold block truncate">{mod.title}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{mod.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Module Overview */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <ModIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <span>{currentModConfig.title}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {currentModConfig.subtitle}
        </p>

        {/* Sample queries pills */}
        <div className="pt-2 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Exemplos Prontos de Consulta:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentModConfig.samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Query Form */}
      <form onSubmit={handleSendQuery} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Descrição ou Pergunta para Análise *</span>
            <span className="text-[10px] font-mono text-slate-400 font-normal">
              {questionText.length}/6000 caracteres
            </span>
          </label>
          <textarea
            required
            rows={4}
            maxLength={6000}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={currentModConfig.placeholder}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 leading-relaxed"
          />
        </div>

        {/* Hidden inputs for direct native camera capture and gallery upload */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCameraPhoto}
          className="hidden"
        />

        {/* Live Camera Viewfinder Overlay (if active) */}
        {isCameraActive && (
          <div className="rounded-2xl overflow-hidden border-2 border-violet-500 bg-black p-3 space-y-2 flex flex-col items-center animate-in fade-in">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full max-h-64 object-cover rounded-xl"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Camera className="h-4 w-4" />
                <span>Capturar Foto Agora</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = cameraFacing === 'environment' ? 'user' : 'environment';
                  setCameraFacing(next);
                  startCameraStream(next);
                }}
                className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
                title="Girar Câmera"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={stopCameraStream}
                className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Camera and Photography Controls */}
        <div className="p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {attachedImage ? (
                <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                  <img src={attachedImage.preview} alt="Anexo" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 p-0.5 bg-black/70 text-white rounded-bl"
                    title="Remover"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <Camera className="h-5 w-5" />
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {attachedImage ? attachedImage.name : 'Fotografia para Avaliação com IA'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {attachedImage ? `${attachedImage.mimeType} · Foto pronta para análise visual` : 'Tire uma foto do produto com a câmera do celular'}
                </span>
              </div>
            </div>

            {attachedImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Remover Foto
              </button>
            )}
          </div>

          {/* Action buttons prioritizing mobile camera */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[40px]"
            >
              <Camera className="h-4 w-4" />
              <span>Tirar Foto (Câmera)</span>
            </button>

            <button
              type="button"
              onClick={() => startCameraStream(cameraFacing)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[40px]"
            >
              <Eye className="h-4 w-4 text-violet-500" />
              <span>Visor em Tempo Real</span>
            </button>

            <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[40px]">
              <Upload className="h-4 w-4 text-slate-400" />
              <span>Foto da Galeria</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || !questionText.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px] cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processando Análise...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Enviar para Análise ({currentModConfig.title})</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Response Display */}
      {lastResponse && (
        <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-7 space-y-4 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-200/60 dark:border-violet-900/40 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Resultado da Análise Técnica ({lastResponse.module})
              </h4>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Modo: {lastResponse.mode}
              </span>
              <span>ID: {lastResponse.requestId.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Formatted Answer Body */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-white/70 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {lastResponse.answer}
          </div>

          {/* Mandatory Warning Notice from Contract */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Aviso Obrigatório de Transparência:</span>
              <p>{lastResponse.warning}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
