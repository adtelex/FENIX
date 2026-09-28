import React from 'react';
import { Sale, StoreSettings } from '../types';
import { formatCurrency, formatDate, formatDateTime, formatPhoneDisplay } from '../utils/formatters';
import { Printer, X, Share2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, settings, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let msg = `*FÊNIX MULTIMARCAS - ORG CESAR MAIA*\n`;
    msg += `_Tecnologia · Qualidade · Confiança_\n`;
    msg += `--------------------------------\n`;
    msg += `*COMPROVANTE DE VENDA #${sale.id.slice(-6)}*\n`;
    msg += `Data: ${formatDateTime(sale.date)}\n`;
    msg += `Cliente: ${sale.customerName}\n`;
    msg += `--------------------------------\n`;
    msg += `*ITENS ADQUIRIDOS:*\n`;
    sale.items.forEach(it => {
      msg += `• ${it.quantity}x ${it.productName} (${it.brand}) - ${formatCurrency(it.totalPrice)}\n`;
      if (it.imeiOrBarcode) {
        msg += `  Serial/IMEI: ${it.imeiOrBarcode}\n`;
      }
    });
    msg += `--------------------------------\n`;
    msg += `Subtotal: ${formatCurrency(sale.subtotal)}\n`;
    if (sale.discount > 0) {
      msg += `Desconto: -${formatCurrency(sale.discount)}\n`;
    }
    msg += `*TOTAL A PAGAR: ${formatCurrency(sale.total)}*\n`;
    
    // Forma de pagamento
    const paymentLabels = {
      a_vista_dinheiro: 'À Vista (Dinheiro)',
      a_vista_pix: 'À Vista (Pix)',
      cartao_debito: 'Cartão de Débito',
      cartao_credito: `Cartão de Crédito (${sale.paymentDetails.cardInstallments || 1}x)`,
      fiado_parcelado: `Carnê Fênix Parcelado (${sale.installments?.length || 1}x)`
    };
    msg += `Forma de Pagamento: ${paymentLabels[sale.paymentMethod]}\n`;

    if (sale.paymentMethod === 'fiado_parcelado' && sale.installments) {
      msg += `\n*CARNÊ DE PARCELAS FÊNIX:*\n`;
      if (sale.paymentDetails.downPayment && sale.paymentDetails.downPayment > 0) {
        msg += `• Entrada: ${formatCurrency(sale.paymentDetails.downPayment)} (Pago)\n`;
      }
      sale.installments.forEach(inst => {
        const statusLabel = inst.status === 'pago' ? '✅ Pago' : '⏳ Pendente';
        msg += `• Parcela ${inst.installmentNumber}/${inst.totalInstallments}: ${formatCurrency(inst.amount)} | Venc: ${formatDate(inst.dueDate)} [${statusLabel}]\n`;
      });
      msg += `\n🔑 *Chave Pix para quitação:* ${settings.pixKey} (${settings.pixKeyType})\n`;
      msg += `*Favorecido:* ${settings.ownerName}\n`;
    }

    msg += `\n*FÊNIX MULTIMARCAS* - Sempre com você! ✨`;

    const encoded = encodeURIComponent(msg);
    const phone = sale.customerPhone ? sale.customerPhone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/55${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-red-500/30 bg-neutral-900 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
        
        {/* Modal Header */}
        <div className="no-print flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-1.5">
              <span>Recibo</span>
              <span className="text-red-500">#{sale.id.slice(-6)}</span>
            </h2>
            <span className="text-xs text-neutral-400">· Fênix Multimarcas</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="overflow-y-auto p-6 font-mono text-xs text-neutral-300">
          <div className="mx-auto max-w-sm rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-inner print:border-none print:bg-white print:p-0 print:text-black">
            
            {/* Store Header */}
            <div className="text-center pb-4 border-b border-dashed border-neutral-700 print:border-neutral-300">
              <h1 className="text-base font-black text-neutral-100 uppercase tracking-widest print:text-black">
                FÊNIX MULTIMARCAS
              </h1>
              <p className="text-[11px] font-bold text-red-400 print:text-neutral-700 tracking-wider">
                ORG CESAR MAIA
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 uppercase print:text-neutral-600">
                TECNOLOGIA · QUALIDADE · CONFIANÇA
              </p>
              <p className="text-[10px] text-neutral-400 print:text-neutral-600">
                {settings.address}
              </p>
              {settings.phone && (
                <p className="text-[11px] text-neutral-400 print:text-neutral-600">
                  WhatsApp: {formatPhoneDisplay(settings.phone)}
                </p>
              )}
              <p className="text-[9px] text-neutral-500 mt-1 uppercase italic print:text-neutral-500">
                "Sempre com você!" · Documento Não Fiscal
              </p>
            </div>

            {/* Sale Meta */}
            <div className="py-3 border-b border-dashed border-neutral-700 text-[11px] space-y-1 print:border-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400 print:text-neutral-600">Venda:</span>
                <span className="font-semibold text-neutral-200 print:text-black">#{sale.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 print:text-neutral-600">Data/Hora:</span>
                <span className="font-semibold text-neutral-200 print:text-black">{formatDateTime(sale.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 print:text-neutral-600">Cliente:</span>
                <span className="font-semibold text-neutral-200 print:text-black">{sale.customerName}</span>
              </div>
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-neutral-400 print:text-neutral-600">Telefone:</span>
                  <span className="text-neutral-300 print:text-black">{formatPhoneDisplay(sale.customerPhone)}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-neutral-700 space-y-2 print:border-neutral-300">
              <div className="text-[11px] font-semibold text-neutral-300 uppercase print:text-black">
                Produtos
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-neutral-200 print:text-black font-medium">
                    <span className="truncate pr-2">{item.quantity}x {item.productName}</span>
                    <span className="tabular-nums shrink-0">{formatCurrency(item.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 print:text-neutral-600">
                    <span>{item.brand} ({item.category})</span>
                    <span>{formatCurrency(item.unitPrice)} un.</span>
                  </div>
                  {item.imeiOrBarcode && (
                    <div className="text-[10px] text-red-400 print:text-neutral-700">
                      Serial/IMEI: {item.imeiOrBarcode}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-dashed border-neutral-700 text-[11px] space-y-1 print:border-neutral-300">
              <div className="flex justify-between text-neutral-400 print:text-neutral-600">
                <span>Subtotal:</span>
                <span className="tabular-nums">{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-400 print:text-emerald-700">
                  <span>Desconto:</span>
                  <span className="tabular-nums">-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-neutral-100 pt-1 border-t border-neutral-800 print:text-black print:border-neutral-200">
                <span>TOTAL:</span>
                <span className="tabular-nums text-red-400 print:text-black font-black">{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-300 pt-1 print:text-black">
                <span>Forma:</span>
                <span className="font-semibold uppercase">
                  {sale.paymentMethod === 'a_vista_dinheiro' && 'À Vista (Dinheiro)'}
                  {sale.paymentMethod === 'a_vista_pix' && 'À Vista (Pix)'}
                  {sale.paymentMethod === 'cartao_debito' && 'Cartão de Débito'}
                  {sale.paymentMethod === 'cartao_credito' && `Cartão de Crédito (${sale.paymentDetails.cardInstallments || 1}x)`}
                  {sale.paymentMethod === 'fiado_parcelado' && 'Carnê Fênix (Fiado Parcelado)'}
                </span>
              </div>
            </div>

            {/* Fiado Installments Carnê Section */}
            {sale.paymentMethod === 'fiado_parcelado' && sale.installments && (
              <div className="py-3 border-b border-dashed border-neutral-700 space-y-2 print:border-neutral-300">
                <div className="flex items-center justify-between text-[11px] font-bold text-red-400 uppercase print:text-black">
                  <span>Carnê de Pagamento Fênix</span>
                  <span>{sale.installments.length}x</span>
                </div>

                {sale.paymentDetails.downPayment && sale.paymentDetails.downPayment > 0 ? (
                  <div className="flex justify-between text-[11px] text-neutral-300 print:text-black bg-neutral-900/60 p-1.5 rounded print:bg-neutral-100">
                    <span>Entrada (Paga na hora):</span>
                    <span className="font-bold tabular-nums">{formatCurrency(sale.paymentDetails.downPayment)}</span>
                  </div>
                ) : null}

                <div className="space-y-1.5 pt-1">
                  {sale.installments.map(inst => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-900/40 px-2 py-1 text-[11px] print:border-neutral-300 print:bg-white"
                    >
                      <div className="flex items-center gap-1.5">
                        {inst.status === 'pago' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 print:text-emerald-700" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 print:bg-neutral-800" />
                        )}
                        <span className="font-medium text-neutral-200 print:text-black">
                          Parcela {inst.installmentNumber}/{inst.totalInstallments}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold tabular-nums text-neutral-100 print:text-black">
                          {formatCurrency(inst.amount)}
                        </div>
                        <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                          Venc: {formatDate(inst.dueDate)} {inst.status === 'pago' ? '(Pago)' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {settings.pixKey && (
                  <div className="mt-2 rounded bg-neutral-900 p-2 text-[10px] print:bg-neutral-100 print:text-black">
                    <p className="text-neutral-400 print:text-neutral-600">Chave Pix para quitação das parcelas:</p>
                    <p className="font-bold text-red-400 print:text-black select-all">{settings.pixKey} ({settings.pixKeyType})</p>
                    <p className="text-neutral-400 print:text-neutral-600">Favorecido: {settings.ownerName}</p>
                  </div>
                )}
              </div>
            )}

            {/* Signature field for Fiado */}
            {sale.paymentMethod === 'fiado_parcelado' && (
              <div className="pt-6 pb-2 text-center">
                <div className="border-t border-neutral-700 w-3/4 mx-auto pt-1 print:border-black">
                  <p className="text-[10px] text-neutral-400 print:text-black">
                    Assinatura do Cliente ({sale.customerName})
                  </p>
                  <p className="text-[9px] text-neutral-500 print:text-neutral-700">
                    Reconheço a dívida do carnê acima assumida
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 text-center text-[10px] text-neutral-500 print:text-neutral-600 space-y-0.5">
              <p className="font-semibold text-neutral-400 print:text-black">Fênix Multimarcas · Sempre com você!</p>
              <p>Garantia mediante apresentação deste comprovante.</p>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print border-t border-neutral-800 bg-neutral-900/90 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
