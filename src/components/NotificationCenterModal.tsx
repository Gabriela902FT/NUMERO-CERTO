/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AppNotification, 
  NotificationSettings, 
  ActiveSection 
} from '../types';
import { 
  getStoredNotifications, 
  saveStoredNotifications, 
  NOTIFICATION_SETTINGS_STORAGE_KEY 
} from '../services/purchaseStorage';
import { useToast } from '../context/ToastContext';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  AlertTriangle, 
  Trash2, 
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (section: ActiveSection) => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  transactionsEnabled: true,
  reservationsEnabled: true,
  drawsEnabled: true,
  securityAlertsEnabled: true,
};

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences'>('inbox');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (isOpen) {
      setNotifications(getStoredNotifications());
    }
  }, [isOpen]);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      toast.success('Preferências de notificação salvas!', 'Preferências');
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
    toast.info('Todas as notificações foram marcadas como lidas.', 'Notificações');
  };

  const handleClearAll = () => {
    setNotifications([]);
    saveStoredNotifications([]);
    toast.warning('Histórico de notificações limpo.', 'Histórico');
  };

  const handleNotificationClick = (notif: AppNotification) => {
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
    if (notif.linkSection && onNavigateSection) {
      onNavigateSection(notif.linkSection);
      onClose();
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Notificações & Avisos</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white font-mono">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lembretes transacionais e comunicados de transparência.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Caixa de Entrada ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'preferences'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Preferências</span>
            </button>
          </div>

          {activeTab === 'inbox' && notifications.length > 0 && (
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={handleMarkAllRead}
                className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
              >
                Ler todas
              </button>
              <span>·</span>
              <button
                onClick={handleClearAll}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          
          {activeTab === 'inbox' && (
            <>
              {notifications.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Bell className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Nenhuma notificação no momento
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Você receberá alertas quando fizer reservas de cotas, enviar comprovantes ou quando houver apuração.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      notif.read
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        : 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/60 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {notif.type === 'transaction' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : notif.type === 'reservation' ? (
                          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-violet-500 shrink-0" />
                        )}
                        <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-800 dark:text-slate-200' : 'text-violet-950 dark:text-white'}`}>
                          {notif.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                      {notif.message}
                    </p>

                    {notif.linkSection && (
                      <div className="pl-6 pt-1">
                        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                          <span>Acessar área correspondente</span>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Controle quais tipos de avisos você deseja receber. O NumeroCerto respeita as diretrizes de privacidade e nunca exibe dados confidenciais ou bancários em telas públicas.
              </div>

              <div className="space-y-3">
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Notificações Transacionais (Pix & Pagamento)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Alertas quando seu comprovante for conferido ou pagamento confirmado.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.transactionsEnabled}
                    onChange={(e) => saveSettings({ ...settings, transactionsEnabled: e.target.checked })}
                    className="h-4 w-4 mt-1 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Lembretes de Reserva Temporária
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Avisos antes que a reserva temporária de 15 minutos expire.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reservationsEnabled}
                    onChange={(e) => saveSettings({ ...settings, reservationsEnabled: e.target.checked })}
                    className="h-4 w-4 mt-1 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Avisos de Sorteio & Apuração
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Comunicados sobre datas de extração da Loteria Federal e resultados públicos.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.drawsEnabled}
                    onChange={(e) => saveSettings({ ...settings, drawsEnabled: e.target.checked })}
                    className="h-4 w-4 mt-1 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Alertas de Segurança & Auditoria
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Atualizações sobre conformidade legal, auditoria e salvaguardas da plataforma.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.securityAlertsEnabled}
                    onChange={(e) => saveSettings({ ...settings, securityAlertsEnabled: e.target.checked })}
                    className="h-4 w-4 mt-1 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
