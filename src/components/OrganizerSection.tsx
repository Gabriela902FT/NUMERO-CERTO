/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OrganizerProfile } from '../types';
import { 
  Building2, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  HelpCircle,
  Wallet,
  UserCheck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { FinancialDashboard } from './FinancialDashboard';

export const OrganizerSection: React.FC = () => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'cadastral' | 'financeiro'>('financeiro');
  const [entityType, setEntityType] = useState<'pf' | 'pj'>('pf');
  const [profile, setProfile] = useState<OrganizerProfile>({
    entityType: 'pf',
    nameOrCorporate: '',
    document: '',
    street: '',
    cityState: '',
    zipCode: '',
    phone: '',
    email: '',
    registrationStatus: 'rascunho_local',
    identityStatus: 'nao_verificada',
    legalAuthorization: 'pendente_orgao_competente',
    termsAccepted: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sessionFeedbackMessage, setSessionFeedbackMessage] = useState<string>('');

  const handleDocumentChange = (val: string) => {
    // Only numbers
    const clean = val.replace(/\D/g, '');
    let formatted = clean;
    if (entityType === 'pf') {
      // CPF format: 000.000.000-00
      if (clean.length > 9) {
        formatted = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      } else if (clean.length > 6) {
        formatted = clean.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      } else if (clean.length > 3) {
        formatted = clean.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      }
    } else {
      // CNPJ format: 00.000.000/0001-00
      if (clean.length > 12) {
        formatted = clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
      } else if (clean.length > 8) {
        formatted = clean.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
      } else if (clean.length > 5) {
        formatted = clean.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
      } else if (clean.length > 2) {
        formatted = clean.replace(/(\d{2})(\d{1,3})/, '$1.$2');
      }
    }
    setProfile((prev) => ({ ...prev, document: formatted }));
  };

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    let formatted = clean;
    if (clean.length > 10) {
      formatted = clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (clean.length > 6) {
      formatted = clean.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else if (clean.length > 2) {
      formatted = clean.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    }
    setProfile((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.nameOrCorporate || !profile.document || !profile.phone) {
      toast.error('Por favor, preencha nome/razão social, documento e telefone.', 'Campos Obrigatórios');
      return;
    }
    const cleanDoc = profile.document.replace(/\D/g, '');
    const expectedDigits = profile.entityType === 'pf' ? 11 : 14;

    if (cleanDoc.length !== expectedDigits) {
      toast.error(
        profile.entityType === 'pf'
          ? 'Informe um CPF com 11 dígitos, sem pontuação.'
          : 'Informe um CNPJ com 14 dígitos, sem pontuação.',
        'Documento Inválido'
      );
      return;
    }

    setProfile((prev) => ({
      ...prev,
      registrationStatus: 'preenchido',
      termsAcceptedAt: new Date().toISOString(),
    }));
    setSessionFeedbackMessage('Campos conferidos nesta sessão. Nenhum dado foi enviado ou salvo. A identidade continua não verificada.');
    toast.success('Cadastro preenchido — identidade NÃO verificada.', 'Conferência Demonstrativa');
  };

  const handleClearSession = () => {
    setProfile({
      entityType: 'pf',
      nameOrCorporate: '',
      document: '',
      street: '',
      cityState: '',
      zipCode: '',
      phone: '',
      email: '',
      registrationStatus: 'rascunho_local',
      identityStatus: 'nao_verificada',
      legalAuthorization: 'pendente_orgao_competente',
      termsAccepted: false,
    });
    setSessionFeedbackMessage('Campos limpos desta sessão.');
    toast.info('Campos limpos desta sessão.', 'Sessão Reiniciada');
  };

  return (
    <div className="space-y-6 py-4 sm:py-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Perfil do Organizador & Gestão Financeira
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Ambiente de acesso privado. Configure sua conta bancária de recebimento, chave Pix, consulte liquidações e mantenha os dados da entidade atualizados.
            </p>
          </div>

          {/* Switcher: Financeiro vs Cadastral */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setCurrentView('financeiro')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                currentView === 'financeiro'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span>Dados Financeiros & Recebimentos</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('cadastral')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                currentView === 'cadastral'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Dados Cadastrais</span>
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Dados Financeiros & Recebimentos */}
      {currentView === 'financeiro' && <FinancialDashboard />}

      {/* View 2: Dados Cadastrais & Conformidade */}
      {currentView === 'cadastral' && (
        <div className="space-y-6">
          {/* Compliance Status Cards (Distinguishing Registered vs Verified vs Authorized) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Status 1: Dados do Cadastro */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              1. Status do Formulário
            </span>
            {profile.registrationStatus === 'preenchido' ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" /> Preenchido
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <Clock className="h-4 w-4" /> Em Elaboração
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {profile.registrationStatus === 'preenchido'
              ? 'Campos básicos preenchidos para teste demonstrativo da sessão.'
              : 'Preencha os campos abaixo para simular o perfil de organizador.'}
          </p>
        </div>

        {/* Status 2: Identidade Verificada */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              2. Identidade Verificada
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-bold">
              <AlertCircle className="h-4 w-4" /> Não Verificada
            </span>
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            Em conformidade com as diretrizes de transparência, a validação de CPF/CNPJ e biometria requer integração com bases oficiais homologadas (não ativa neste protótipo).
          </p>
        </div>

        {/* Status 3: Autorização Legal */}
        <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">
              3. Autorização Legal
            </span>
            <span className="inline-flex items-center gap-1 text-violet-700 dark:text-violet-400 text-xs font-bold">
              <Clock className="h-4 w-4" /> Pendente / Exigível
            </span>
          </div>
          <p className="text-xs text-violet-900/80 dark:text-violet-200/80 leading-relaxed">
            Qualquer distribuição pública com arrecadação financeira exige autorização prévia junto ao órgão competente (Lei Federal nº 5.768/1971).
          </p>
        </div>

      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-4 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>Dados do organizador atualizados na sessão com sucesso!</span>
        </div>
      )}

      {/* Main Registration Form */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Entity Switcher: PF vs PJ */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Tipo de Personalidade
          </label>
          <div className="grid grid-cols-2 max-w-md gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setEntityType('pf');
                setProfile((prev) => ({ ...prev, entityType: 'pf', document: '' }));
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
                entityType === 'pf'
                  ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Pessoa Física (PF)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEntityType('pj');
                setProfile((prev) => ({ ...prev, entityType: 'pj', document: '' }));
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
                entityType === 'pj'
                  ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Pessoa Jurídica / Entidade (PJ)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {entityType === 'pf' ? 'Nome Completo do Responsável *' : 'Razão Social / Nome da Entidade *'}
              </label>
              <input
                type="text"
                required
                placeholder={entityType === 'pf' ? 'Ex: Ana Cristina Oliveira' : 'Ex: Associação de Amigos do Bairro'}
                value={profile.nameOrCorporate}
                onChange={(e) => setProfile({ ...profile, nameOrCorporate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {entityType === 'pf' ? 'CPF (Simulado) *' : 'CNPJ (Simulado) *'}
              </label>
              <input
                type="text"
                required
                maxLength={entityType === 'pf' ? 14 : 18}
                placeholder={entityType === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'}
                value={profile.document}
                onChange={(e) => handleDocumentChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
              <span className="text-[11px] text-slate-400">
                Validação local de formato. Não insira documentos reais em ambientes de teste.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Telefone / WhatsApp *
              </label>
              <input
                type="text"
                required
                maxLength={15}
                placeholder="(00) 00000-0000"
                value={profile.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                E-mail (Opcional)
              </label>
              <input
                type="email"
                placeholder="contato@exemplo.com.br"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cidade / UF
              </label>
              <input
                type="text"
                placeholder="Ex: Belo Horizonte / MG"
                value={profile.cityState}
                onChange={(e) => setProfile({ ...profile, cityState: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Endereço Completo
              </label>
              <input
                type="text"
                placeholder="Rua, número, complemento e bairro"
                value={profile.street}
                onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

          </div>

          {/* LGPD & Privacy Box */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Lock className="h-4 w-4 text-emerald-500" />
              <span>Garantias de Privacidade e LGPD</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Estes dados cadastrais são estritamente <strong>privados</strong> e jamais serão exibidos em páginas públicas de bilhetes.</li>
              <li>Não é exigido número IMEI ou dados invasivos do seu aparelho celular.</li>
              <li>Finalidade exclusiva: identificação prévia para composição de rascunhos e futura homologação legal.</li>
            </ul>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={profile.termsAccepted}
                onChange={(e) => setProfile({ ...profile, termsAccepted: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
              />
              <span>
                Declaro ciência de que este cadastro é demonstrativo e que qualquer sorteio público requer autorização legal formal prévia.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClearSession}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
            >
              Limpar campos desta sessão
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Conferir campos (demonstração)</span>
            </button>
          </div>

          {sessionFeedbackMessage && (
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="font-semibold block mb-0.5">Resultado da conferência:</span>
              {sessionFeedbackMessage}
            </div>
          )}

        </form>
      </div>
    </div>
  )}
</div>
  );
};
