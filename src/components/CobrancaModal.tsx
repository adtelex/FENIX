import React, { useState } from 'react';
import { Installment, StoreSettings } from '../types';
import { generateWhatsAppPaymentMessage, getWhatsAppLink, formatCurrency, formatDate, formatPhoneDisplay } from '../utils/formatters';
import { MessageSquare, Copy, Check, ExternalLink, X, AlertCircle } from 'lucide-react';

interface CobrancaModalProps {
  installment: Installment | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const CobrancaModal: React.FC<CobrancaModalProps> = ({ installment, settings, onClose }) => {
  if (!installment) return null;

  const [message, setMessage] = useState(() => 
    generateWhatsAppPaymentMessage(installment, settings)
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!installment.customerPhone) {
      alert('Este cliente não possui telefone cadastrado.');
      return;
    }
    const url = getWhatsAppLink(installment.customerPhone, message);
    window.open(url, '_blank');
  };

  const isOverdue = installment.status === 'atrasado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                Lembrete de Cobrança WhatsApp
              </h2>
              <p className="text-xs text-neutral-400">
                {installment.customerName} · Parcela {installment.installmentNumber}/{installment.totalInstallments}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5 text-sm">
          {/* Status banner */}
          <div className={`flex items-start gap-3 rounded-lg border p-3 ${
            isOverdue 
              ? 'border-red-500/30 bg-red-950/20 text-red-300' 
              : 'border-amber-500/30 bg-amber-950/20 text-amber-300'
          }`}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="text-xs space-y-1">
              <div className="font-semibold">
                {isOverdue ? 'Parcela Vencida (Em Atraso)' : 'Parcela a Vencer'}
              </div>
              <div className="text-neutral-300">
                Valor: <span className="font-bold tabular-nums text-white">{formatCurrency(installment.amount)}</span> · Vencimento: <span className="font-medium text-white">{formatDate(installment.dueDate)}</span>
              </div>
              {installment.customerPhone && (
                <div className="text-neutral-400">
                  WhatsApp: {formatPhoneDisplay(installment.customerPhone)}
                </div>
              )}
            </div>
          </div>

          {/* Editable WhatsApp Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Mensagem Personalizada:</span>
              <button
                type="button"
                onClick={() => setMessage(generateWhatsAppPaymentMessage(installment, settings))}
                className="text-amber-400 hover:underline"
              >
                Restaurar modelo padrão
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 font-mono text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Pix Key Info */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 text-xs">
            <span className="text-neutral-400">Chave Pix configurada: </span>
            <span className="font-mono font-medium text-neutral-200">{settings.pixKey}</span>
            <span className="text-neutral-500"> ({settings.pixKeyType})</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/90 px-5 py-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Enviar pelo WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
