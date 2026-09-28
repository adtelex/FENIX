import React, { useState } from 'react';
import { Installment } from '../types';
import { useSales } from '../context/SalesContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CheckCircle2, DollarSign, X } from 'lucide-react';

interface BaixaParcelaModalProps {
  installment: Installment | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BaixaParcelaModal: React.FC<BaixaParcelaModalProps> = ({ installment, onClose, onSuccess }) => {
  const { payInstallment } = useSales();

  if (!installment) return null;

  const [paidAmount, setPaidAmount] = useState<number>(installment.amount);
  const [paidVia, setPaidVia] = useState<'dinheiro' | 'pix' | 'cartao'>('pix');
  const [paidAtDate, setPaidAtDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    payInstallment(installment.id, {
      paidAmount: Number(paidAmount) || installment.amount,
      paidVia,
      paidAt: `${paidAtDate}T12:00:00.000Z`,
      notes
    });
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                Receber Parcela (Dar Baixa)
              </h2>
              <p className="text-xs text-neutral-400">
                Parcela {installment.installmentNumber} de {installment.totalInstallments}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Summary */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-neutral-400">Cliente:</span>
              <span className="font-semibold text-neutral-200">{installment.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Vencimento Original:</span>
              <span className="text-neutral-300">{formatDate(installment.dueDate)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-800 pt-1.5">
              <span className="text-neutral-400">Valor da Parcela:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {formatCurrency(installment.amount)}
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-1.5">
            <label className="text-neutral-300 font-medium">Valor Recebido (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-neutral-500 font-mono">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2 pl-9 pr-3 font-mono font-semibold text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-300 font-medium">Forma de Pagamento Recebida</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaidVia('pix')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  paidVia === 'pix'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Pix
              </button>
              <button
                type="button"
                onClick={() => setPaidVia('dinheiro')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  paidVia === 'dinheiro'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Dinheiro
              </button>
              <button
                type="button"
                onClick={() => setPaidVia('cartao')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  paidVia === 'cartao'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Cartão
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-300 font-medium">Data do Recebimento</label>
            <input
              type="date"
              required
              value={paidAtDate}
              onChange={(e) => setPaidAtDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-300 font-medium">Observação (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Pagamento adiantado com desconto ou troco"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-medium text-neutral-400 hover:text-neutral-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmar Recebimento
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
