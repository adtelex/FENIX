import React, { useState, useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { Installment, Sale } from '../types';
import { formatCurrency, formatDate, formatPhoneDisplay, isOverdue } from '../utils/formatters';
import { 
  CreditCard, AlertCircle, CheckCircle2, Clock, Search, MessageSquare, 
  DollarSign, FileText, ArrowUpRight, Filter, Calendar, UserX, Trash2, X
} from 'lucide-react';
import { CobrancaModal } from './CobrancaModal';
import { BaixaParcelaModal } from './BaixaParcelaModal';
import { ReceiptModal } from './ReceiptModal';
import { ExcluirClienteFiadoModal } from './ExcluirClienteFiadoModal';

export const FiadoView: React.FC = () => {
  const { sales, allInstallments, settings } = useSales();

  // State for filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'atrasado' | 'hoje' | 'pendente' | 'pago'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [cobrancaTarget, setCobrancaTarget] = useState<Installment | null>(null);
  const [baixaTarget, setBaixaTarget] = useState<Installment | null>(null);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string; phone?: string } | null>(null);
  const [isSelectCustomerToDeleteOpen, setIsSelectCustomerToDeleteOpen] = useState(false);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute metrics
  const metrics = useMemo(() => {
    let totalAReceber = 0;
    let totalEmAtraso = 0;
    let totalRecebido = 0;
    let countAtrasadas = 0;
    let countPendentes = 0;

    allInstallments.forEach(inst => {
      if (inst.status === 'pago') {
        totalRecebido += inst.paidAmount || inst.amount;
      } else {
        totalAReceber += inst.amount;
        if (inst.status === 'atrasado' || isOverdue(inst.dueDate)) {
          totalEmAtraso += inst.amount;
          countAtrasadas++;
        } else {
          countPendentes++;
        }
      }
    });

    return {
      totalAReceber,
      totalEmAtraso,
      totalRecebido,
      countAtrasadas,
      countPendentes,
      totalCount: allInstallments.length
    };
  }, [allInstallments]);

  // Filtered installments
  const filteredInstallments = useMemo(() => {
    return allInstallments.filter(inst => {
      // Status filter
      if (statusFilter === 'atrasado') {
        const isLate = inst.status === 'atrasado' || (inst.status === 'pendente' && isOverdue(inst.dueDate));
        if (!isLate) return false;
      } else if (statusFilter === 'hoje') {
        if (inst.dueDate !== todayStr || inst.status === 'pago') return false;
      } else if (statusFilter === 'pendente') {
        if (inst.status !== 'pendente') return false;
      } else if (statusFilter === 'pago') {
        if (inst.status !== 'pago') return false;
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        inst.customerName.toLowerCase().includes(q) ||
        (inst.customerPhone && inst.customerPhone.includes(q)) ||
        inst.saleId.toLowerCase().includes(q)
      );
    });
  }, [allInstallments, statusFilter, searchQuery, todayStr]);

  // Map sale details for quick preview
  const salesMap = useMemo(() => {
    const map = new Map<string, Sale>();
    sales.forEach(s => map.set(s.id, s));
    return map;
  }, [sales]);

  // Unique debtors list for management
  const debtorsList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; phone?: string; totalDebt: number; count: number }>();
    allInstallments.forEach(inst => {
      if (!map.has(inst.customerId)) {
        map.set(inst.customerId, {
          id: inst.customerId,
          name: inst.customerName,
          phone: inst.customerPhone,
          totalDebt: 0,
          count: 0
        });
      }
      const entry = map.get(inst.customerId)!;
      entry.count += 1;
      if (inst.status !== 'pago') {
        entry.totalDebt += inst.amount;
      }
    });
    return Array.from(map.values());
  }, [allInstallments]);

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total a Receber */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total a Receber (Carnê Fênix)</span>
            <Clock className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-neutral-100 tabular-nums">
            {formatCurrency(metrics.totalAReceber)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {metrics.countPendentes} parcelas pendentes
          </div>
        </div>

        {/* Em Atraso (Alerta) */}
        <div className={`rounded-xl border p-4 shadow-sm ${
          metrics.totalEmAtraso > 0 
            ? 'border-red-500/40 bg-red-950/20' 
            : 'border-neutral-800 bg-neutral-900/60'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={metrics.totalEmAtraso > 0 ? 'text-red-300 font-medium' : 'text-neutral-400'}>
              Total em Atraso (Vencidas)
            </span>
            <AlertCircle className={`h-4 w-4 ${metrics.totalEmAtraso > 0 ? 'text-red-400' : 'text-neutral-500'}`} />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-red-400 tabular-nums">
            {formatCurrency(metrics.totalEmAtraso)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {metrics.countAtrasadas} cobranças pendentes
          </div>
        </div>

        {/* Já Recebido */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Recebido do Fiado</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {formatCurrency(metrics.totalRecebido)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Parcelas liquidadas no sistema
          </div>
        </div>

        {/* Chave Pix configurada */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Cobrança via Pix</span>
            <span className="text-[10px] text-red-400 font-mono">{settings.pixKeyType}</span>
          </div>
          <div className="mt-2 font-mono text-sm font-bold text-neutral-200 truncate select-all">
            {settings.pixKey || 'Não configurada'}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 truncate">
            Favorecido: {settings.ownerName}
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou ID da venda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 overflow-x-auto shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todas ({allInstallments.length})
          </button>
          
          <button
            onClick={() => setStatusFilter('atrasado')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'atrasado'
                ? 'bg-red-950 text-red-300 border border-red-500/40 shadow-xs'
                : 'text-red-400 hover:text-red-300'
            }`}
          >
            <AlertCircle className="h-3 w-3" />
            <span>Em Atraso ({metrics.countAtrasadas})</span>
          </button>

          <button
            onClick={() => setStatusFilter('hoje')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'hoje'
                ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Vencem Hoje
          </button>

          <button
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'pendente'
                ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            A Vencer ({metrics.countPendentes})
          </button>

          <button
            onClick={() => setStatusFilter('pago')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'pago'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Quitadas
          </button>
        </div>

        {/* Action: Excluir Cliente Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setIsSelectCustomerToDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-900/40 transition-colors whitespace-nowrap shadow-xs"
            title="Excluir um cliente e suas parcelas do Fiado"
          >
            <UserX className="h-3.5 w-3.5 text-red-400" />
            <span>Excluir Cliente</span>
          </button>
        </div>

      </div>

      {/* Installments Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[11px] font-semibold uppercase text-neutral-400">
              <tr>
                <th className="px-4 py-3">Cliente / Contato</th>
                <th className="px-4 py-3">Produto(s) da Compra</th>
                <th className="px-4 py-3">Parcela</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredInstallments.map((inst) => {
                const parentSale = salesMap.get(inst.saleId);
                const isLate = inst.status === 'atrasado' || (inst.status === 'pendente' && isOverdue(inst.dueDate));
                const isPaid = inst.status === 'pago';

                return (
                  <tr 
                    key={inst.id} 
                    className="hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-neutral-100 truncate">
                            {inst.customerName}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {inst.customerPhone ? formatPhoneDisplay(inst.customerPhone) : 'Sem WhatsApp'}
                          </div>
                        </div>
                        <button
                          title={`Excluir cliente ${inst.customerName} do Fiado`}
                          onClick={() => setCustomerToDelete({
                            id: inst.customerId,
                            name: inst.customerName,
                            phone: inst.customerPhone
                          })}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Products */}
                    <td className="px-4 py-3.5 max-w-xs">
                      {parentSale ? (
                        <div>
                          <div className="truncate font-medium text-neutral-200">
                            {parentSale.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                          </div>
                          <button
                            onClick={() => setReceiptSale(parentSale)}
                            className="flex items-center gap-1 text-[10px] text-red-400 hover:underline mt-0.5"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Venda #{parentSale.id.slice(-6)} ({formatDate(parentSale.date)})</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-neutral-500">Venda original</span>
                      )}
                    </td>

                    {/* Installment X of Y */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-medium text-neutral-200">
                        {inst.installmentNumber} / {inst.totalInstallments}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono tabular-nums text-neutral-200">
                        {formatDate(inst.dueDate)}
                      </div>
                      <div className={`text-[10px] ${
                        isPaid 
                          ? 'text-emerald-400' 
                          : isLate 
                          ? 'text-red-400 font-semibold' 
                          : 'text-neutral-500'
                      }`}>
                        {isPaid 
                          ? `Pago em ${formatDate(inst.paidAt || '')}`
                          : isLate 
                          ? 'Vencida!' 
                          : 'A vencer'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-red-400 tabular-nums">
                        {formatCurrency(inst.amount)}
                      </div>
                      {isPaid && inst.paidVia && (
                        <div className="text-[10px] uppercase text-neutral-500">
                          via {inst.paidVia}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Quitado
                        </span>
                      ) : isLate ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-950/60 border border-red-500/30 px-2 py-0.5 text-[11px] font-semibold text-red-300">
                          <AlertCircle className="h-3 w-3" />
                          Atrasado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                          <Clock className="h-3 w-3" />
                          Pendente
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* WhatsApp Collection Button */}
                        {!isPaid && (
                          <button
                            title="Cobrar no WhatsApp com Chave Pix"
                            onClick={() => setCobrancaTarget(inst)}
                            className="flex items-center gap-1 rounded-lg border border-emerald-600/40 bg-emerald-950/30 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/40 hover:text-emerald-200 transition-colors"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Cobrar</span>
                          </button>
                        )}

                        {/* Receber / Dar Baixa */}
                        {!isPaid ? (
                          <button
                            title="Dar baixa no pagamento da parcela"
                            onClick={() => setBaixaTarget(inst)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Receber</span>
                          </button>
                        ) : (
                          parentSale && (
                            <button
                              onClick={() => setReceiptSale(parentSale)}
                              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-[11px] text-neutral-300 hover:bg-neutral-700"
                            >
                              Ver Recibo
                            </button>
                          )
                        )}

                        {/* Excluir Cliente */}
                        <button
                          title={`Excluir cliente ${inst.customerName} e suas parcelas`}
                          onClick={() => setCustomerToDelete({
                            id: inst.customerId,
                            name: inst.customerName,
                            phone: inst.customerPhone
                          })}
                          className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2 py-1.5 text-[11px] text-neutral-400 hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                        >
                          <UserX className="h-3.5 w-3.5 text-red-400/80" />
                          <span className="hidden xl:inline">Excluir</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInstallments.length === 0 && (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhuma parcela de fiado encontrada com os filtros atuais.
          </div>
        )}
      </div>

      {/* Modals */}
      <CobrancaModal
        installment={cobrancaTarget}
        settings={settings}
        onClose={() => setCobrancaTarget(null)}
      />

      <BaixaParcelaModal
        installment={baixaTarget}
        onClose={() => setBaixaTarget(null)}
      />

      <ReceiptModal
        sale={receiptSale}
        settings={settings}
        onClose={() => setReceiptSale(null)}
      />

      {/* Excluir Cliente Confirmation Modal */}
      <ExcluirClienteFiadoModal
        customer={customerToDelete}
        onClose={() => setCustomerToDelete(null)}
      />

      {/* Selector modal to choose debtor to delete */}
      {isSelectCustomerToDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-neutral-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4 bg-red-950/20">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-bold text-neutral-100">
                  Excluir Cliente do Fiado
                </h3>
              </div>
              <button
                onClick={() => setIsSelectCustomerToDeleteOpen(false)}
                className="text-neutral-400 hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-4 space-y-2 text-xs">
              <p className="text-[11px] text-neutral-400 mb-2">
                Selecione o cliente que deseja remover do cadastro e do controle de fiado:
              </p>
              {debtorsList.length === 0 ? (
                <p className="text-center text-neutral-500 py-6">
                  Nenhum cliente com débitos ou parcelas de fiado registradas.
                </p>
              ) : (
                debtorsList.map(debtor => (
                  <div
                    key={debtor.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950 hover:border-red-500/40 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-neutral-200">{debtor.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        {debtor.phone ? formatPhoneDisplay(debtor.phone) : 'Sem WhatsApp'} · {debtor.count} {debtor.count === 1 ? 'parcela' : 'parcelas'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-red-400 tabular-nums">
                        {formatCurrency(debtor.totalDebt)}
                      </span>
                      <button
                        onClick={() => {
                          setIsSelectCustomerToDeleteOpen(false);
                          setCustomerToDelete({
                            id: debtor.id,
                            name: debtor.name,
                            phone: debtor.phone
                          });
                        }}
                        className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-500 transition-colors shadow-xs"
                      >
                        <UserX className="h-3 w-3" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-neutral-800 bg-neutral-950/60 p-3 flex justify-end">
              <button
                onClick={() => setIsSelectCustomerToDeleteOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
