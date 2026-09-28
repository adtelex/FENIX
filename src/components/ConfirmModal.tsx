import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemDetails?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemDetails,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/40 bg-neutral-900 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4 bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-100">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs">
          <p className="text-neutral-300 leading-relaxed">
            {message}
          </p>

          {itemDetails && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-neutral-200 font-medium">
              {itemDetails}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 bg-neutral-950/80 px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 font-medium text-neutral-400 hover:text-neutral-200 transition-colors text-xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all shadow-sm active:scale-[0.98] ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-neutral-700 hover:bg-neutral-600'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
