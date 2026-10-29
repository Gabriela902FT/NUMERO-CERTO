/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, options?: { type?: ToastType; title?: string; duration?: number }) => void;
  dismissToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: { type?: ToastType; title?: string; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const type = options?.type || 'success';
      const duration = options?.duration ?? 4000;
      const title = options?.title;

      const newToast: ToastItem = { id, message, type, title, duration };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 toasts to avoid clutter

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const toast = {
    success: (message: string, title?: string) => showToast(message, { type: 'success', title }),
    info: (message: string, title?: string) => showToast(message, { type: 'info', title }),
    warning: (message: string, title?: string) => showToast(message, { type: 'warning', title }),
    error: (message: string, title?: string) => showToast(message, { type: 'error', title }),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Visual Toast Container rendered on top of UI
interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-96 pointer-events-none"
    >
      {toasts.map((item) => {
        const isSuccess = item.type === 'success';
        const isWarning = item.type === 'warning';
        const isError = item.type === 'error';
        const isInfo = item.type === 'info';

        let borderClass = 'border-emerald-500/40 dark:border-emerald-500/50';
        let bgIconClass = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400';
        let titleColor = 'text-emerald-950 dark:text-emerald-100';

        if (isInfo) {
          borderClass = 'border-violet-500/40 dark:border-violet-500/50';
          bgIconClass = 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400';
          titleColor = 'text-violet-950 dark:text-violet-100';
        } else if (isWarning) {
          borderClass = 'border-amber-500/40 dark:border-amber-500/50';
          bgIconClass = 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400';
          titleColor = 'text-amber-950 dark:text-amber-100';
        } else if (isError) {
          borderClass = 'border-rose-500/40 dark:border-rose-500/50';
          bgIconClass = 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400';
          titleColor = 'text-rose-950 dark:text-rose-100';
        }

        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border shadow-xl shadow-slate-900/10 dark:shadow-black/40 transition-all duration-300 transform translate-y-0 opacity-100 ${borderClass}`}
          >
            {/* Type Icon */}
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${bgIconClass}`}>
              {isSuccess && <CheckCircle2 className="h-5 w-5" />}
              {isInfo && <Info className="h-5 w-5" />}
              {isWarning && <AlertTriangle className="h-5 w-5" />}
              {isError && <AlertCircle className="h-5 w-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5 space-y-0.5 min-w-0">
              {item.title && (
                <h4 className={`text-xs font-bold tracking-tight ${titleColor}`}>
                  {item.title}
                </h4>
              )}
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                {item.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
