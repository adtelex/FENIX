import React, { useState, useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { Customer, Sale, Installment } from '../types';
import { formatCurrency, formatDate, formatPhoneDisplay, cleanPhone, isOverdue } from '../utils/formatters';
import { Users, UserPlus, Search, Phone, MessageSquare, Edit3, Trash2, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { CobrancaModal } from './CobrancaModal';
import { BaixaParcelaModal } from './BaixaParcelaModal';
import { ReceiptModal } from './ReceiptModal';
import { ConfirmModal } from './ConfirmModal';

export const ClientesView: React.FC = () => {
  const { customers, sales, allInstallments, addCustomer, updateCustomer, deleteCustomer, settings } = useSales();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Customer Statement Modal
  const [selectedCustForStatement, setSelectedCustForStatement] = useState<Customer | null>(null);
  const [cobrancaTarget, setCobrancaTarget] = useState<Installment | null>(null);
  const [baixaTarget, setBaixaTarget] = useState<Installment | null>(null);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // Calculations per customer
  const customerStatsMap = useMemo(() => {
    const map = new Map<string, {
      totalSpent: number;
      pendingFiado: number;
      overdueFiado: number;
      salesCount: number;
    }>();

    customers.forEach(c => {
      map.set(c.id, { totalSpent: 0, pendingFiado: 0, overdueFiado: 0, salesCount: 0 });
    });

    sales.forEach(sale => {
      if (sale.customerId && map.has(sale.customerId)) {
        const stats = map.get(sale.customerId)!;
        if (sale.status !== 'cancelada') {
          stats.totalSpent += sale.total;
          stats.salesCount += 1;
        }
      }
    });

    allInstallments.forEach(inst => {
      if (inst.status !== 'pago' && map.has(inst.customerId)) {
        const stats = map.get(inst.customerId)!;
        const isLate = inst.status === 'atrasado' || isOverdue(inst.dueDate);
        stats.pendingFiado += inst.amount;
        if (isLate) {
          stats.overdueFiado += inst.amount;
        }
      }
    });

    return map;
  }, [customers, sales, allInstallments]);

  const handleOpenNew = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormCpf('');
    setFormAddress('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phone || '');
    setFormCpf(c.cpf || '');
    setFormAddress(c.address || '');
    setFormNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formName.trim(),
        phone: formPhone.trim(),
        cpf: formCpf.trim() || undefined,
        address: formAddress.trim() || undefined,
        notes: formNotes.trim() || undefined
      });
    } else {
      addCustomer({
        name: formName.trim(),
        phone: formPhone.trim(),
        cpf: formCpf.trim() || undefined,
        address: formAddress.trim() || undefined,
        notes: formNotes.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.cpf && c.cpf.includes(q))
      );
    });
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome do cliente, telefone ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-red-500 hover:to-red-600 transition-all whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Cadastrar Cliente</span>
        </button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(c => {
          const stats = customerStatsMap.get(c.id) || { totalSpent: 0, pendingFiado: 0, overdueFiado: 0, salesCount: 0 };
          const hasDebt = stats.pendingFiado > 0;
          const isOverdueClient = stats.overdueFiado > 0;

          return (
            <div
              key={c.id}
              className={`rounded-xl border bg-neutral-900/60 p-4 transition-all ${
                isOverdueClient
                  ? 'border-red-500/30'
                  : hasDebt
                  ? 'border-amber-500/30'
                  : 'border-neutral-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">
                    {c.name}
                  </h3>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {c.phone ? formatPhoneDisplay(c.phone) : 'Sem telefone cadastrado'}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1 text-neutral-400 hover:text-neutral-200"
                    title="Editar dados"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCustomerToDelete(c)}
                    className="p-1 text-neutral-500 hover:text-red-400"
                    title="Excluir cliente"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* CPF / Address */}
              {(c.cpf || c.address) && (
                <div className="mt-2 text-[11px] text-neutral-500 space-y-0.5 border-t border-neutral-800/80 pt-2">
                  {c.cpf && <div>CPF: <span className="font-mono text-neutral-300">{c.cpf}</span></div>}
                  {c.address && <div className="truncate">Endereço: {c.address}</div>}
                </div>
              )}

              {/* Debt & Spending Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500">Total Comprado</span>
                  <div className="font-mono font-bold text-neutral-200 tabular-nums">
                    {formatCurrency(stats.totalSpent)}
                  </div>
                  <span className="text-[10px] text-neutral-500">{stats.salesCount} compras</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500">Saldo Devedor (Fiado)</span>
                  <div className={`font-mono font-bold tabular-nums ${
                    isOverdueClient
                      ? 'text-red-400'
                      : hasDebt
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {formatCurrency(stats.pendingFiado)}
                  </div>
                  {isOverdueClient && (
                    <span className="text-[10px] text-red-400 font-medium">Possui atraso!</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-800/80">
                <button
                  onClick={() => setSelectedCustForStatement(c)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:underline"
                >
                  <FileText className="h-3 w-3" />
                  <span>Ver Carnê / Histórico</span>
                </button>

                {c.phone && (
                  <a
                    href={`https://wa.me/${cleanPhone(c.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/40"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="p-8 text-center text-xs text-neutral-500 rounded-xl border border-neutral-800 bg-neutral-900/40">
          Nenhum cliente encontrado.
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-400" />
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">WhatsApp / Telefone (com DDD) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 11988887777"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">CPF (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formCpf}
                  onChange={(e) => setFormCpf(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Endereço Residencial (Opcional)</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro, cidade"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Observações / Notas</label>
                <input
                  type="text"
                  placeholder="Ex: Prefere pagar todo dia 10, etc."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-2 text-neutral-400 hover:text-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-neutral-950 hover:bg-amber-400 transition-colors"
                >
                  {editingCustomer ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Statement & Carnê Modal */}
      {selectedCustForStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">
                  Carnê & Extrato de {selectedCustForStatement.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  {selectedCustForStatement.phone ? formatPhoneDisplay(selectedCustForStatement.phone) : 'Sem telefone'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustForStatement(null)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs">
              
              {/* Installments for this client */}
              <div>
                <h4 className="font-semibold text-neutral-200 mb-2">Parcelas do Fiado:</h4>
                {allInstallments.filter(i => i.customerId === selectedCustForStatement.id).length === 0 ? (
                  <p className="text-neutral-500">Este cliente não possui parcelas no fiado.</p>
                ) : (
                  <div className="space-y-2">
                    {allInstallments.filter(i => i.customerId === selectedCustForStatement.id).map(inst => {
                      const isLate = inst.status === 'atrasado' || (inst.status === 'pendente' && isOverdue(inst.dueDate));
                      const isPaid = inst.status === 'pago';

                      return (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-2.5"
                        >
                          <div>
                            <div className="font-medium text-neutral-200">
                              Parcela {inst.installmentNumber}/{inst.totalInstallments} · {formatCurrency(inst.amount)}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              Vencimento: {formatDate(inst.dueDate)} {isPaid ? `(Pago via ${inst.paidVia})` : ''}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <span className="flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                Quitado
                              </span>
                            ) : isLate ? (
                              <span className="flex items-center gap-1 rounded bg-red-950/60 border border-red-500/30 px-2 py-0.5 text-[10px] text-red-300 font-semibold">
                                <AlertCircle className="h-3 w-3" />
                                Atrasado
                              </span>
                            ) : (
                              <span className="rounded bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-300">
                                Pendente
                              </span>
                            )}

                            {!isPaid && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => setCobrancaTarget(inst)}
                                  className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-900"
                                >
                                  Cobrar WhatsApp
                                </button>
                                <button
                                  onClick={() => setBaixaTarget(inst)}
                                  className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                                >
                                  Receber
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Purchases history */}
              <div className="pt-3 border-t border-neutral-800">
                <h4 className="font-semibold text-neutral-200 mb-2">Histórico de Compras:</h4>
                <div className="space-y-2">
                  {sales.filter(s => s.customerId === selectedCustForStatement.id).map(sale => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-2.5"
                    >
                      <div>
                        <div className="font-medium text-neutral-200">
                          Venda #{sale.id.slice(-6)} · {formatDate(sale.date)}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {sale.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-amber-400 tabular-nums">
                          {formatCurrency(sale.total)}
                        </span>
                        <button
                          onClick={() => setReceiptSale(sale)}
                          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-[11px] text-neutral-300 hover:bg-neutral-700"
                        >
                          Ver Recibo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="border-t border-neutral-800 bg-neutral-900/90 px-5 py-3 flex justify-end">
              <button
                onClick={() => setSelectedCustForStatement(null)}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Auxiliary Modals */}
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

      {/* Modal de Confirmação de Exclusão do Cliente */}
      <ConfirmModal
        isOpen={Boolean(customerToDelete)}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir o cadastro deste cliente?"
        itemDetails={customerToDelete ? `${customerToDelete.name} ${customerToDelete.phone ? `(${formatPhoneDisplay(customerToDelete.phone)})` : ''}` : undefined}
        confirmText="Excluir Cliente"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id, true);
            setCustomerToDelete(null);
          }
        }}
        onCancel={() => setCustomerToDelete(null)}
      />

    </div>
  );
};
