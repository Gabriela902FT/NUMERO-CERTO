/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  OrganizerFinancialProfile, 
  PaymentMethodConfig, 
  FinancialTransaction, 
  PixKeyType, 
  BankAccountType, 
  PaymentMethodType 
} from '../types';
import { 
  DEFAULT_FINANCIAL_PROFILE, 
  DEFAULT_PAYMENT_METHODS, 
  INITIAL_FINANCIAL_TRANSACTIONS, 
  computeFinancialReconciliation 
} from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { 
  Wallet, 
  CreditCard, 
  QrCode, 
  Building, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock, 
  RefreshCw, 
  Layers, 
  Info, 
  FileText,
  DollarSign,
  Smartphone,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const FINANCIAL_STORAGE_KEY = 'numerocerto_financial_profile_v1';
const TRANSACTIONS_STORAGE_KEY = 'numerocerto_transactions_v1';
const METHODS_STORAGE_KEY = 'numerocerto_payment_methods_v1';

export const OrganizerFinancialSection: React.FC = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'dados_bancarios' | 'recebimentos' | 'conciliacao' | 'arquitetura'>('dados_bancarios');

  // Financial Profile state
  const [profile, setProfile] = useState<OrganizerFinancialProfile>(() => {
    try {
      const saved = localStorage.getItem(FINANCIAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_FINANCIAL_PROFILE;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_FINANCIAL_TRANSACTIONS;
  });

  // Payment Methods Config state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(() => {
    try {
      const saved = localStorage.getItem(METHODS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_PAYMENT_METHODS;
  });

  // Filter state for transactions
  const [txFilterMethod, setTxFilterMethod] = useState<'all' | PaymentMethodType>('all');
  const [txFilterStatus, setTxFilterStatus] = useState<'all' | 'liquidado' | 'aprovado' | 'reembolsado'>('all');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FINANCIAL_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(METHODS_STORAGE_KEY, JSON.stringify(paymentMethods));
    } catch {
      // Ignore
    }
  }, [paymentMethods]);

  const reconciliation = computeFinancialReconciliation(transactions);

  // Masking helpers
  const maskDocument = (doc: string) => {
    if (!profile.isMaskedInUI) return doc;
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) {
      return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
    }
    if (clean.length === 14) {
      return `${clean.slice(0, 2)}.***.***/${clean.slice(8, 12)}-**`;
    }
    return '***.***.***-**';
  };

  const maskBankInfo = (val: string) => {
    if (!profile.isMaskedInUI || val.length <= 4) return val;
    return `***${val.slice(-4)}`;
  };

  const maskPixKey = (key: string, type: PixKeyType) => {
    if (!profile.isMaskedInUI) return key;
    if (type === 'cpf_cnpj') return maskDocument(key);
    if (type === 'email') {
      const parts = key.split('@');
      if (parts.length === 2) return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    }
    if (type === 'phone') {
      return `(***) *****-${key.slice(-4)}`;
    }
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  // Profile update handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.holderNameOrCorporate || !profile.holderDocument || !profile.pixKey || !profile.accountNumber) {
      toast.error('Preencha os campos bancários essenciais.', 'Validação');
      return;
    }
    const updated: OrganizerFinancialProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);
    toast.success('Dados financeiros e chave Pix atualizados com sucesso no dispositivo!', 'Dados Salvos');
  };

  // Payment method toggle
  const handleToggleMethod = (methodId: PaymentMethodType) => {
    setPaymentMethods((prev) =>
      prev.map((m) => (m.id === methodId ? { ...m, isEnabled: !m.isEnabled } : m))
    );
    toast.info('Preferência do método de pagamento atualizada.', 'Métodos de Recebimento');
  };

  // Transaction Actions (Demonstrative)
  const handleSimulatePayment = (method: PaymentMethodType) => {
    const gross = 30.0;
    let fee = 0.3; // 0.99% Pix
    let initialStatus: FinancialTransaction['status'] = 'liquidado';
    let settledAt: string | undefined = new Date().toISOString();

    if (method === 'credit_card' || method === 'google_pay') {
      fee = 1.30; // 2.99% + 0.40
      initialStatus = 'aprovado'; // Cartão fica APROVADO, pendente de liquidação D+30!
      settledAt = undefined;
    } else if (method === 'debit_card') {
      fee = 0.54;
      initialStatus = 'liquidado';
      settledAt = new Date().toISOString();
    }

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      chargeId: `ch_${method}_${Math.floor(1000 + Math.random() * 9000)}`,
      ticketNumbers: [Math.floor(1 + Math.random() * 999)],
      buyerNameMasked: `Participante Demo (***.${Math.floor(100 + Math.random() * 899)}-**)`,
      method,
      amountGross: gross,
      providerFee: fee,
      amountNet: gross - fee,
      status: initialStatus,
      createdAt: new Date().toLocaleString('pt-BR'),
      settledAt: settledAt ? new Date().toLocaleString('pt-BR') : undefined,
      endToEndId: method === 'pix' ? `E${Math.random().toString(36).substring(2, 18).toUpperCase()}` : undefined,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (initialStatus === 'liquidado') {
      toast.success(
        `Cobrança de R$ 30,00 via ${method.toUpperCase()} recebida e liquidada na conta vinculada (D+0)!`,
        'Pagamento Liquidado'
      );
    } else {
      toast.info(
        `Cobrança de R$ 30,00 via ${method.toUpperCase()} aprovada! O valor está pendente de liquidação bancária (D+30).`,
        'Pagamento Aprovado'
      );
    }
  };

  const handleSettlePendingTx = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId && t.status === 'aprovado') {
          return {
            ...t,
            status: 'liquidado',
            settledAt: new Date().toLocaleString('pt-BR'),
          };
        }
        return t;
      })
    );
    toast.success('Transação liquidada com sucesso! O valor agora consta como Efetivamente Recebido.', 'Liquidação Bancária');
  };

  const handleRefundTx = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId && t.status !== 'reembolsado') {
          return {
            ...t,
            status: 'reembolsado',
            refundedAt: new Date().toLocaleString('pt-BR'),
          };
        }
        return t;
      })
    );
    toast.warning('Estorno demonstrativo processado com sucesso.', 'Reembolso Efetuado');
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (txFilterMethod !== 'all' && tx.method !== txFilterMethod) return false;
    if (txFilterStatus !== 'all' && tx.status !== txFilterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 pt-2">
      
      {/* Sub-navigation tabs inside Organizer */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto text-xs font-semibold border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('dados_bancarios')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
            activeTab === 'dados_bancarios'
              ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Dados Financeiros & Pix</span>
        </button>

        <button
          onClick={() => setActiveTab('recebimentos')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
            activeTab === 'recebimentos'
              ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span>Métodos de Recebimento</span>
        </button>

        <button
          onClick={() => setActiveTab('conciliacao')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
            activeTab === 'conciliacao'
              ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Extrato & Conciliação</span>
        </button>

        <button
          onClick={() => setActiveTab('arquitetura')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
            activeTab === 'arquitetura'
              ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Arquitetura Segura & Regras</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ABA 1: DADOS FINANCEIROS & PIX */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dados_bancarios' && (
        <div className="space-y-6">
          
          {/* Privacy & Masking Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60">
            <div className="flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">
                  Controle de Acesso Privado e Mascaramento
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Estes dados são estritamente confidenciais e nunca serão exibidos nas páginas públicas da campanha.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setProfile((p) => ({ ...p, isMaskedInUI: !p.isMaskedInUI }))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 min-h-[36px] self-start sm:self-auto"
            >
              {profile.isMaskedInUI ? (
                <>
                  <Eye className="h-4 w-4 text-slate-500" />
                  <span>Revelar Dados na Tela</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-slate-500" />
                  <span>Ocultar / Mascarar Dados</span>
                </>
              )}
            </button>
          </div>

          {/* Status Indicators: Verificação Cadastral e Habilitação de Recebimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Estado da Verificação Cadastral */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Verificação Cadastral Financeira
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Aprovado (Demonstrativo)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dados validados no ambiente de testes. Em produção real, este estado depende da validação de documentos de constituição e titularidade bancária pelo PSP.
              </p>
            </div>

            {/* Estado da Habilitação para Receber Pagamentos */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Habilitação de Recebimento
                </span>
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  <Clock className="h-4 w-4" /> Habilitado em Demonstração
                </span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                Transações reais bloqueadas até homologação bancária e formalização jurídica da campanha. Operações operam em modo de simulação técnica segura.
              </p>
            </div>

          </div>

          {/* Form: Dados Bancários & Pix */}
          <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Conta de Destino dos Repasses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  A conta informada receberá os repasses líquidos das cotas após a liquidação pelo provedor.
                </p>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                Última atualização: {new Date(profile.updatedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nome Completo ou Razão Social do Titular *
                </label>
                <input
                  type="text"
                  required
                  value={profile.holderNameOrCorporate}
                  onChange={(e) => setProfile({ ...profile, holderNameOrCorporate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  CPF ou CNPJ do Titular *
                </label>
                <input
                  type="text"
                  required
                  value={profile.isMaskedInUI ? maskDocument(profile.holderDocument) : profile.holderDocument}
                  onChange={(e) => setProfile({ ...profile, holderDocument: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nome do Titular da Conta Bancária (Beneficiário Autorizado) *
                </label>
                <input
                  type="text"
                  required
                  value={profile.accountBeneficiaryName}
                  onChange={(e) => setProfile({ ...profile, accountBeneficiaryName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Deve coincidir obrigatoriamente com o CPF/CNPJ cadastrado para evitar rejeição na conciliação bancária do provedor.
                </p>
              </div>

              {/* Pix Configuration */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tipo de Chave Pix *
                </label>
                <select
                  value={profile.pixKeyType}
                  onChange={(e) => setProfile({ ...profile, pixKeyType: e.target.value as PixKeyType })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                >
                  <option value="cpf_cnpj">CPF ou CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Chave Pix para Recebimento *
                </label>
                <input
                  type="text"
                  required
                  value={profile.isMaskedInUI ? maskPixKey(profile.pixKey, profile.pixKeyType) : profile.pixKey}
                  onChange={(e) => setProfile({ ...profile, pixKey: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              {/* Bank Details */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Instituição Financeira (Banco) *
                </label>
                <input
                  type="text"
                  required
                  value={profile.bankName}
                  onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                  placeholder="Ex: Banco do Brasil, Caixa, Bradesco, Itaú, Nubank..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tipo de Conta
                </label>
                <select
                  value={profile.accountType}
                  onChange={(e) => setProfile({ ...profile, accountType: e.target.value as BankAccountType })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                >
                  <option value="corrente">Conta Corrente</option>
                  <option value="poupanca">Conta Poupança</option>
                  <option value="pagamento">Conta de Pagamento</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Agência (com dígito se houver)
                </label>
                <input
                  type="text"
                  value={profile.isMaskedInUI ? maskBankInfo(profile.agency) : profile.agency}
                  onChange={(e) => setProfile({ ...profile, agency: e.target.value })}
                  placeholder="1234-5"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Número da Conta (com dígito) *
                </label>
                <input
                  type="text"
                  required
                  value={profile.isMaskedInUI ? maskBankInfo(profile.accountNumber) : profile.accountNumber}
                  onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                  placeholder="98765-4"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[44px]"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Salvar Dados Financeiros</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ABA 2: CONFIGURAÇÃO DE RECEBIMENTOS & PROVEDORES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'recebimentos' && (
        <div className="space-y-6">
          
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Métodos de Pagamento Oferecidos aos Compradores
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Habilite ou desabilite os métodos disponíveis para os participantes adquirirem cotas da sua campanha.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {paymentMethods.map((method) => {
                const isPix = method.id === 'pix';
                const isCard = method.id === 'credit_card';
                const isDebit = method.id === 'debit_card';
                const isGPay = method.id === 'google_pay';

                return (
                  <div
                    key={method.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0">
                            {isPix && <QrCode className="h-5 w-5" />}
                            {isCard && <CreditCard className="h-5 w-5" />}
                            {isDebit && <Wallet className="h-5 w-5" />}
                            {isGPay && <Smartphone className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {method.name}
                            </h4>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {method.status === 'ativo_demonstrativo' ? 'Homologação Simulada' : 'Pendente'}
                            </span>
                          </div>
                        </div>

                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleMethod(method.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            method.isEnabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              method.isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {method.description}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white dark:bg-slate-900 p-3 space-y-1 text-xs border border-slate-200/80 dark:border-slate-800">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Liquidação:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{method.settlementTerms}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Tarifa Externa do PSP:</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">{method.providerFeeRate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platform Zero-Fee Note (Requirement 6) */}
            <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 p-4 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Isenção de Tarifas da Plataforma NumeroCerto (Regra Comercial)
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-900/90 dark:text-emerald-300/90">
                O <strong>NumeroCerto não cobra comissões nem taxas do organizador</strong> durante os períodos de teste e validação. As tarifas discriminadas acima referem-se exclusivamente aos custos operacionais cobrados pelos adquirentes e processadores de pagamento (PSP) cadastrados.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ABA 3: EXTRATO & CONCILIAÇÃO FINANCEIRA */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'conciliacao' && (
        <div className="space-y-6">
          
          {/* 4 Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Pagamentos Aprovados */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pagamentos Aprovados (Bruto)
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                R$ {reconciliation.approvedGrossTotal.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">
                Total bruto autorizado pelos compradores.
              </p>
            </div>

            {/* KPI 2: Pendentes de Liquidação */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Pendentes de Liquidação
              </span>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 font-mono tabular-nums">
                R$ {reconciliation.pendingSettlementTotal.toFixed(2)}
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Aprovados no cartão, aguardando repasse do provedor.
              </p>
            </div>

            {/* KPI 3: Efetivamente Recebidos / Liquidados */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Efetivamente Recebido (Líquido)
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                R$ {reconciliation.settledReceivedTotal.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                Depositado e disponível na conta bancária vinculada.
              </p>
            </div>

            {/* KPI 4: Tarifas do Provedor */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Taxas Retidas pelo Provedor
              </span>
              <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                R$ {reconciliation.providerFeesTotal.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">
                Custos de processamento bancário externos.
              </p>
            </div>

          </div>

          {/* Golden Rule Banner: Requirement 2 */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800/80 border border-slate-700 flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-300">
                Regra de Integridade: Não antecipar recebimento antes da liquidação bancária
              </p>
              <p className="text-slate-300 leading-relaxed">
                Um pagamento com cartão de crédito aprovado é classificado como <strong>Pendente de Liquidação</strong> e só migra para <strong>Efetivamente Recebido</strong> quando o dinheiro é creditado na conta bancária do organizador (D+30 ou D+14). O Pix é liquidado em D+0.
              </p>
            </div>
          </div>

          {/* Demonstrative Simulation Trigger Strip */}
          <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  Simulador de Transações de Teste (Sandbox)
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Acione transações fictícias para testar o comportamento do extrato e o fluxo de liquidação.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePayment('pix')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors min-h-[36px]"
                >
                  + Simular Pix (D+0)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePayment('credit_card')}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors min-h-[36px]"
                >
                  + Simular Cartão (Pendente D+30)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePayment('google_pay')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors min-h-[36px]"
                >
                  + Simular Google Pay
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table & Filters */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Extrato Detalhado de Transações ({filteredTransactions.length})
              </h4>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={txFilterMethod}
                  onChange={(e) => setTxFilterMethod(e.target.value as any)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todos os métodos</option>
                  <option value="pix">Apenas Pix</option>
                  <option value="credit_card">Apenas Cartão</option>
                  <option value="google_pay">Apenas Google Pay</option>
                  <option value="debit_card">Apenas Débito</option>
                </select>

                <select
                  value={txFilterStatus}
                  onChange={(e) => setTxFilterStatus(e.target.value as any)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todos os status</option>
                  <option value="liquidado">Liquidados</option>
                  <option value="aprovado">Aprovados (Pendentes)</option>
                  <option value="reembolsado">Reembolsados</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans">
                    <th className="pb-2">Data / ID</th>
                    <th className="pb-2">Comprador</th>
                    <th className="pb-2">Método</th>
                    <th className="pb-2">Valor Bruto</th>
                    <th className="pb-2">Taxa PSP</th>
                    <th className="pb-2">Valor Líquido</th>
                    <th className="pb-2">Situação</th>
                    <th className="pb-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTransactions.map((tx) => {
                    const isLiquidado = tx.status === 'liquidado';
                    const isAprovado = tx.status === 'aprovado';
                    const isReembolsado = tx.status === 'reembolsado';

                    return (
                      <tr key={tx.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5">
                          <span className="block font-sans text-[11px] text-slate-900 dark:text-white font-medium">{tx.createdAt}</span>
                          <span className="text-[10px] text-slate-400">{tx.chargeId}</span>
                        </td>
                        <td className="py-2.5 font-sans">
                          <span className="block">{tx.buyerNameMasked}</span>
                          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-mono">
                            Cota(s): {tx.ticketNumbers.map(n => n.toString().padStart(3, '0')).join(', ')}
                          </span>
                        </td>
                        <td className="py-2.5 uppercase font-sans font-bold text-[10px]">
                          {tx.method === 'credit_card' ? 'Cartão Crédito' : tx.method === 'google_pay' ? 'Google Pay' : tx.method}
                        </td>
                        <td className="py-2.5 font-bold tabular-nums">
                          R$ {tx.amountGross.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-amber-600 dark:text-amber-400 tabular-nums">
                          - R$ {tx.providerFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          R$ {tx.amountNet.toFixed(2)}
                        </td>
                        <td className="py-2.5">
                          {isLiquidado && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-sans text-[10px] font-bold">
                              Liquidado
                            </span>
                          )}
                          {isAprovado && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-sans text-[10px] font-bold">
                              Pendente D+30
                            </span>
                          )}
                          {isReembolsado && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans text-[10px] font-bold line-through">
                              Reembolsado
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          {isAprovado && (
                            <button
                              type="button"
                              onClick={() => handleSettlePendingTx(tx.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 rounded-md transition-colors"
                              title="Simular confirmação de liquidação bancária"
                            >
                              Liquidar
                            </button>
                          )}
                          {!isReembolsado && isLiquidado && (
                            <button
                              type="button"
                              onClick={() => handleRefundTx(tx.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-md transition-colors"
                              title="Simular estorno/reembolso"
                            >
                              Estornar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ABA 4: ARQUITETURA SEGURA & REGRAS COMERCIAIS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'arquitetura' && (
        <div className="space-y-6">
          
          {/* Section: Os 5 Estágios do Pix */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Pilar Regulatório
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Os 5 Estágios Fundamentais do Pix do Organizador
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                A mera posse de uma chave Pix não confere habilitação operacional automática. A arquitetura obedece a um pipeline rigoroso de conformidade:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Chave Cadastrada
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organizador informa a chave (CPF/CNPJ, e-mail, telefone ou EVP).
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Conta Validada
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Provedor bancário checa DICT e titularidade do documento antes de autorizar.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Cobrança Criada
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Backend emite cobrança Pix dinâmica com payload assinado (sem QR Code falso).
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Pagamento Confirmado
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Webhook assinado via mTLS comunica a autorização financeira com idempotência.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                  5
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Valor Liquidado
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Recursos transferidos para a conta do beneficiário autorizado com endToEndId.
                </p>
              </div>

            </div>
          </div>

          {/* Section: Arquitetura Desacoplada e Cartão de Crédito */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Por que o organizador não cadastra cartão */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
                <CreditCard className="h-5 w-5" />
                <span>Recebimento com Cartão sem Cadastro de Cartão</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                O organizador <strong>nunca precisa cadastrar cartão de crédito para receber valores</strong>. O fluxo opera sob modelo de liquidação bancária direta: o participante paga com seu cartão tokenizado e a adquirente liquida o montante líquido diretamente na conta corrente/Pix do beneficiário homologado.
              </p>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-[11px] text-slate-500 space-y-1">
                <span className="font-semibold block text-slate-700 dark:text-slate-200">Segurança PCI-DSS:</span>
                O NumeroCerto nunca armazena números de cartão ou código CVV no aplicativo.
              </div>
            </div>

            {/* Checklist de Dependências Externas Pendentes */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>Dependências Externas para Ativação Real</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>Enquadramento Jurídico</strong>: Autorização prévia junto à SECAP/SPA ou órgão competente (Lei nº 5.768/1971).
                </li>
                <li>
                  <strong>Contrato com PSP/Gateway</strong>: Homologação de conta de split/marketplace junto a instituição autorizada pelo Banco Central.
                </li>
                <li>
                  <strong>Webhooks & Certificado mTLS</strong>: Configuração de endpoint seguro de backend para validação das notificações de pagamento.
                </li>
                <li>
                  <strong>Chaves de API Seguras</strong>: Gerenciamento restrito de credenciais em cofre de chaves (Secret Manager), sem expor chaves no cliente.
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
