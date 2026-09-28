import React, { useState } from 'react';
import { Customer, Installment, Sale } from '../types';
import { useSales } from '../context/SalesContext';
import { formatCurrency, formatPhoneDisplay } from '../utils/formatters';
import { UserX, AlertTriangle, X, Trash2, CheckCircle2 } from 'lucide-react';

interface ExcluirClienteFiadoModalProps {
  customer: { id: string; name: string; phone?: string } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcluirClienteFiadoModal: React.FC<ExcluirClienteFiadoModalProps> = ({
  customer,
  onClose,
  onSuccess
}) => {
  const { sales, allInstallments, deleteCustomer, cancelSale } = useSales();
  const [restoreStock, setRestoreStock] = useState<boolean>(true);

  if (!customer) return null;

  // Find all installments and sales for this customer
  const customerInstallments = allInstallments.filter(i => i.customerId === customer.id);
  const customerSales = sales.filter(s => s.customerId === customer.id);

  const totalDebt = customerInstallments
    .filter(i => i.status !== 'pago')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingCount = customerInstallments.filter(i => i.status !== 'pago').length;

  const handleConfirmDelete = () => {
    // If restoreStock is requested, cancel each sale properly to restore products into inventory
    if (restoreStock) {
      customerSales.forEach(sale => {
        if (sale.status !== 'cancelada') {
          cancelSale(sale.id);
        }
      });
    }

    // Delete customer and their sales/installments records
    deleteCustomer(customer.id, true);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/40 bg-neutral-900 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4 bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
              <UserX className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100">
                Excluir Cliente do Fiado
              </h2>
              <p className="text-xs text-neutral-400">
                Remover cadastro e débitos vinculados
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

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Warning Banner */}
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <div className="space-y-1">
              <div className="font-semibold text-white">
                Atenção: Exclusão Permanente
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Você está prestes a excluir o cliente <strong className="text-white">{customer.name}</strong>. Esta ação removerá o cliente e suas parcelas do controle de Fiado.
              </p>
            </div>
          </div>

          {/* Customer Summary Box */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Cliente:</span>
              <span className="font-bold text-neutral-100">{customer.name}</span>
            </div>
            {customer.phone && (
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">WhatsApp/Telefone:</span>
                <span className="text-neutral-300">{formatPhoneDisplay(customer.phone)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-neutral-800/80 pt-2">
              <span className="text-neutral-400">Parcelas em Aberto:</span>
              <span className="font-mono font-bold text-neutral-200">
                {pendingCount} de {customerInstallments.length} parcelas
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Saldo Devedor a Cancelar:</span>
              <span className="font-mono font-bold text-red-400 tabular-nums text-sm">
                {formatCurrency(totalDebt)}
              </span>
            </div>
          </div>

          {/* Option: Restore Stock */}
          <label className="flex items-start gap-2.5 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 cursor-pointer hover:bg-neutral-950 transition-colors">
            <input
              type="checkbox"
              checked={restoreStock}
              onChange={(e) => setRestoreStock(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500"
            />
            <div className="space-y-0.5">
              <span className="font-medium text-neutral-200">
                Devolver produtos das compras ao estoque
              </span>
              <p className="text-[11px] text-neutral-400">
                Restorna automaticamente as unidades vendidas no fiado deste cliente de volta ao estoque da loja.
              </p>
            </div>
          </label>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 bg-neutral-950/80 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium text-neutral-400 hover:text-neutral-200 transition-colors text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500 transition-all active:scale-[0.98]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Confirmar Exclusão</span>
          </button>
        </div>

      </div>
    </div>
  );
};
