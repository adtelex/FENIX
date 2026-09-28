import React, { useState, useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { Sale } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/formatters';
import { 
  BarChart3, DollarSign, TrendingUp, ShoppingBag, CreditCard, 
  Calendar, Search, FileText, Ban, CheckCircle2, Clock, Sparkles, Smartphone 
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { ConfirmModal } from './ConfirmModal';

export const RelatoriosView: React.FC = () => {
  const { sales, cancelSale, settings } = useSales();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);

  // Financial Metrics
  const metrics = useMemo(() => {
    let faturamento = 0;
    let custoTotal = 0;
    let lucroTotal = 0;
    let validSalesCount = 0;

    let totalPixDinheiro = 0;
    let totalCartao = 0;
    let totalFiado = 0;

    let faturamentoPerfumes = 0;
    let faturamentoCelulares = 0;
    let faturamentoAcessorios = 0;

    sales.forEach(s => {
      if (s.status === 'cancelada') return;

      faturamento += s.total;
      custoTotal += s.costTotal;
      lucroTotal += s.profit;
      validSalesCount++;

      // Payment method breakdown
      if (s.paymentMethod === 'a_vista_pix' || s.paymentMethod === 'a_vista_dinheiro') {
        totalPixDinheiro += s.total;
      } else if (s.paymentMethod === 'cartao_credito' || s.paymentMethod === 'cartao_debito') {
        totalCartao += s.total;
      } else if (s.paymentMethod === 'fiado_parcelado') {
        totalFiado += s.total;
      }

      // Categories breakdown
      s.items.forEach(it => {
        if (it.category === 'perfume') faturamentoPerfumes += it.totalPrice;
        else if (it.category === 'celular') faturamentoCelulares += it.totalPrice;
        else if (it.category === 'acessorio') faturamentoAcessorios += it.totalPrice;
      });
    });

    const ticketMedio = validSalesCount > 0 ? faturamento / validSalesCount : 0;
    const margemMedia = faturamento > 0 ? (lucroTotal / faturamento) * 100 : 0;

    return {
      faturamento,
      custoTotal,
      lucroTotal,
      ticketMedio,
      margemMedia,
      validSalesCount,
      totalPixDinheiro,
      totalCartao,
      totalFiado,
      faturamentoPerfumes,
      faturamentoCelulares,
      faturamentoAcessorios
    };
  }, [sales]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // Payment filter
      if (filterMethod !== 'all' && s.paymentMethod !== filterMethod) return false;

      // Search
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const itemsText = s.items.map(i => `${i.productName} ${i.brand}`).join(' ').toLowerCase();

      return (
        s.customerName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        itemsText.includes(q)
      );
    });
  }, [sales, filterMethod, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Faturamento Total Bruto</span>
            <DollarSign className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-neutral-100 tabular-nums">
            {formatCurrency(metrics.faturamento)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {metrics.validSalesCount} vendas ativas registradas
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Lucro Líquido Real</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {formatCurrency(metrics.lucroTotal)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Margem média de {metrics.margemMedia.toFixed(1)}% sobre as vendas
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Custo das Mercadorias</span>
            <ShoppingBag className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-neutral-300 tabular-nums">
            {formatCurrency(metrics.custoTotal)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Custo total de reposição dos produtos
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Ticket Médio por Venda</span>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-blue-400 tabular-nums">
            {formatCurrency(metrics.ticketMedio)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Média gasta por transação
          </div>
        </div>

      </div>

      {/* Breakdowns Row (Payment Methods & Categories) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Payment Methods */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-red-500" />
            Distribuição por Forma de Pagamento
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-300">À Vista (Pix e Dinheiro)</span>
              <span className="font-mono font-bold text-neutral-100 tabular-nums">
                {formatCurrency(metrics.totalPixDinheiro)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-300">Cartão de Crédito e Débito</span>
              <span className="font-mono font-bold text-neutral-100 tabular-nums">
                {formatCurrency(metrics.totalCartao)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <span>Carnê Fênix (Fiado)</span>
                <span className="text-[10px] text-red-400 font-medium">(A prazo)</span>
              </span>
              <span className="font-mono font-bold text-red-400 tabular-nums">
                {formatCurrency(metrics.totalFiado)}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-red-500" />
            Faturamento por Linha de Produto
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-red-400" />
                <span>Celulares & Smartphones</span>
              </span>
              <span className="font-mono font-bold text-red-400 tabular-nums">
                {formatCurrency(metrics.faturamentoCelulares)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-neutral-300" />
                <span>Perfumes Importados & Nacionais</span>
              </span>
              <span className="font-mono font-bold text-neutral-100 tabular-nums">
                {formatCurrency(metrics.faturamentoPerfumes)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-300">Acessórios (Carregadores, Fones)</span>
              <span className="font-mono font-bold text-neutral-200 tabular-nums">
                {formatCurrency(metrics.faturamentoAcessorios)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Sales History Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar nas vendas por cliente, ID ou produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400">Filtrar Pagamento:</label>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">Todas as Formas</option>
            <option value="a_vista_pix">À Vista (Pix)</option>
            <option value="a_vista_dinheiro">À Vista (Dinheiro)</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="fiado_parcelado">Fiado Parcelado</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[11px] font-semibold uppercase text-neutral-400">
              <tr>
                <th className="px-4 py-3">Venda / Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Produtos Adquiridos</th>
                <th className="px-4 py-3">Forma de Pagamento</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3 text-right">Lucro</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredSales.map((sale) => {
                const isCancelled = sale.status === 'cancelada';

                return (
                  <tr 
                    key={sale.id} 
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      isCancelled ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    {/* ID & Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-semibold text-neutral-100">
                        #{sale.id.slice(-6)}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {formatDateTime(sale.date)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-neutral-200">
                        {sale.customerName}
                      </div>
                      {sale.customerPhone && (
                        <div className="text-[11px] text-neutral-500">
                          {sale.customerPhone}
                        </div>
                      )}
                    </td>

                    {/* Products */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="truncate font-medium text-neutral-200">
                        {sale.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="capitalize text-neutral-300">
                        {sale.paymentMethod === 'a_vista_pix' && 'À Vista (Pix)'}
                        {sale.paymentMethod === 'a_vista_dinheiro' && 'À Vista (Dinheiro)'}
                        {sale.paymentMethod === 'cartao_debito' && 'Cartão de Débito'}
                        {sale.paymentMethod === 'cartao_credito' && `Cartão de Crédito (${sale.paymentDetails.cardInstallments || 1}x)`}
                        {sale.paymentMethod === 'fiado_parcelado' && `Fiado (${sale.installments?.length || 1}x)`}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-400 tabular-nums whitespace-nowrap">
                      {formatCurrency(sale.total)}
                    </td>

                    {/* Profit */}
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-emerald-400 whitespace-nowrap">
                      {isCancelled ? '-' : `+${formatCurrency(sale.profit)}`}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {sale.status === 'concluida' && (
                        <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          Concluída
                        </span>
                      )}
                      {sale.status === 'fiado_aberto' && (
                        <span className="rounded bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                          Fiado Aberto
                        </span>
                      )}
                      {sale.status === 'fiado_quitado' && (
                        <span className="rounded bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          Fiado Quitado
                        </span>
                      )}
                      {sale.status === 'cancelada' && (
                        <span className="rounded bg-neutral-800 text-neutral-400 px-2 py-0.5 text-[10px]">
                          Cancelada
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Visualizar Comprovante / Carnê"
                          onClick={() => setSelectedSaleForReceipt(sale)}
                          className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-[11px] text-neutral-300 hover:bg-neutral-700 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Recibo</span>
                        </button>

                        {!isCancelled && (
                          <button
                            title="Cancelar venda e estornar estoque"
                            onClick={() => setSaleToCancel(sale)}
                            className="rounded-lg p-1 text-neutral-500 hover:text-red-400 transition-colors"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhuma venda encontrada com os filtros atuais.
          </div>
        )}
      </div>

      <ReceiptModal
        sale={selectedSaleForReceipt}
        settings={settings}
        onClose={() => setSelectedSaleForReceipt(null)}
      />

      {/* Modal de Cancelamento de Venda */}
      <ConfirmModal
        isOpen={Boolean(saleToCancel)}
        title="Cancelar Venda"
        message="Deseja realmente cancelar esta venda? Os produtos vendidos serão estornados e retornarão automaticamente ao estoque da loja."
        itemDetails={saleToCancel ? `Venda #${saleToCancel.id.slice(-6)} · Cliente: ${saleToCancel.customerName} · Valor: ${formatCurrency(saleToCancel.total)}` : undefined}
        confirmText="Confirmar Cancelamento"
        cancelText="Voltar"
        isDestructive={true}
        onConfirm={() => {
          if (saleToCancel) {
            cancelSale(saleToCancel.id);
            setSaleToCancel(null);
          }
        }}
        onCancel={() => setSaleToCancel(null)}
      />

    </div>
  );
};
