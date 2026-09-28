import React, { useState, useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { Product, Category } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Layers, Sparkles, Smartphone, Plus, Search, Edit3, Trash2, 
  AlertTriangle, DollarSign, Package, Check, X, ShieldCheck 
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const EstoqueView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, quickStockAdjust } = useSales();

  // Filters
  const [selectedCat, setSelectedCat] = useState<'all' | Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('perfume');
  const [formBrand, setFormBrand] = useState('');
  const [formModelOrVolume, setFormModelOrVolume] = useState('');
  const [formImeiOrBarcode, setFormImeiOrBarcode] = useState('');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSalePrice, setFormSalePrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(1);
  const [formMinStock, setFormMinStock] = useState<number>(1);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Open modal for new product
  const handleOpenNew = (category: Category = 'perfume') => {
    setEditingProduct(null);
    setFormCategory(category);
    setFormName('');
    setFormBrand('');
    setFormModelOrVolume(category === 'perfume' ? '100ml EDP' : '128GB');
    setFormImeiOrBarcode('');
    setFormCostPrice(0);
    setFormSalePrice(0);
    setFormStock(1);
    setFormMinStock(1);
    setFormImageUrl('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormCategory(prod.category);
    setFormName(prod.name);
    setFormBrand(prod.brand);
    setFormModelOrVolume(prod.modelOrVolume);
    setFormImeiOrBarcode(prod.imeiOrBarcode || '');
    setFormCostPrice(prod.costPrice);
    setFormSalePrice(prod.salePrice);
    setFormStock(prod.stock);
    setFormMinStock(prod.minStock);
    setFormImageUrl(prod.imageUrl || '');
    setFormNotes(prod.notes || '');
    setIsModalOpen(true);
  };

  // Submit product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBrand.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        brand: formBrand.trim(),
        modelOrVolume: formModelOrVolume.trim(),
        imeiOrBarcode: formImeiOrBarcode.trim() || undefined,
        costPrice: Number(formCostPrice) || 0,
        salePrice: Number(formSalePrice) || 0,
        stock: Number(formStock) || 0,
        minStock: Number(formMinStock) || 1,
        imageUrl: formImageUrl.trim() || undefined,
        notes: formNotes.trim() || undefined
      });
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        brand: formBrand.trim(),
        modelOrVolume: formModelOrVolume.trim(),
        imeiOrBarcode: formImeiOrBarcode.trim() || undefined,
        costPrice: Number(formCostPrice) || 0,
        salePrice: Number(formSalePrice) || 0,
        stock: Number(formStock) || 0,
        minStock: Number(formMinStock) || 1,
        imageUrl: formImageUrl.trim() || undefined,
        notes: formNotes.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCat === 'all' || p.category === selectedCat;
      const matchLow = !onlyLowStock || (p.stock <= p.minStock);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.imeiOrBarcode && p.imeiOrBarcode.toLowerCase().includes(q)) ||
        p.modelOrVolume.toLowerCase().includes(q);

      return matchCat && matchLow && matchSearch;
    });
  }, [products, selectedCat, onlyLowStock, searchQuery]);

  // Inventory Totals
  const inventoryStats = useMemo(() => {
    let totalItems = 0;
    let totalCost = 0;
    let totalSaleValue = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      totalItems += p.stock;
      totalCost += p.costPrice * p.stock;
      totalSaleValue += p.salePrice * p.stock;
      if (p.stock <= p.minStock) lowStockCount++;
    });

    const potentialProfit = totalSaleValue - totalCost;

    return { totalItems, totalCost, totalSaleValue, potentialProfit, lowStockCount };
  }, [products]);

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total em Estoque</span>
            <Package className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-neutral-100 tabular-nums">
            {inventoryStats.totalItems} unidades
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {products.length} produtos cadastrados
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Valor a Preço de Custo</span>
            <DollarSign className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-neutral-200 tabular-nums">
            {formatCurrency(inventoryStats.totalCost)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Capital investido em mercadorias
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Potencial de Venda</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {formatCurrency(inventoryStats.totalSaleValue)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Lucro potencial: {formatCurrency(inventoryStats.potentialProfit)}
          </div>
        </div>

        <div className={`rounded-xl border p-4 shadow-sm ${
          inventoryStats.lowStockCount > 0 
            ? 'border-amber-500/40 bg-amber-950/20' 
            : 'border-neutral-800 bg-neutral-900/60'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={inventoryStats.lowStockCount > 0 ? 'text-amber-300 font-medium' : 'text-neutral-400'}>
              Alerta de Reposição
            </span>
            <AlertTriangle className={`h-4 w-4 ${inventoryStats.lowStockCount > 0 ? 'text-amber-400' : 'text-neutral-500'}`} />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-400 tabular-nums">
            {inventoryStats.lowStockCount} produtos
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Estoque igual ou abaixo do mínimo
          </div>
        </div>

      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome, marca, volume, modelo ou IMEI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 shrink-0">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedCat === 'all'
                ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedCat('celular')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedCat === 'celular'
                ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="h-3 w-3" />
            <span>Celulares</span>
          </button>
          <button
            onClick={() => setSelectedCat('perfume')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedCat === 'perfume'
                ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Perfumes</span>
          </button>
          <button
            onClick={() => setSelectedCat('acessorio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedCat === 'acessorio'
                ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Acessórios
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyLowStock(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              onlyLowStock
                ? 'border-red-500 bg-red-500/20 text-red-300'
                : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Estoque Baixo</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenNew('celular')}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-red-500 hover:to-red-600 transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>+ Novo Produto</span>
          </button>
        </div>

      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[11px] font-semibold uppercase text-neutral-400">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Identificador / IMEI</th>
                <th className="px-4 py-3 text-right">Preço de Custo</th>
                <th className="px-4 py-3 text-right">Preço de Venda</th>
                <th className="px-4 py-3 text-right">Margem</th>
                <th className="px-4 py-3 text-center">Qtd. Estoque</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredProducts.map((p) => {
                const margin = p.salePrice - p.costPrice;
                const marginPercent = p.costPrice > 0 ? (margin / p.costPrice) * 100 : 0;
                const isLow = p.stock <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                    {/* Product Name & Brand */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : p.category === 'perfume' ? (
                            <Sparkles className="h-4 w-4 text-amber-500/50" />
                          ) : (
                            <Smartphone className="h-4 w-4 text-blue-500/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-neutral-100 truncate max-w-xs">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {p.brand} · {p.modelOrVolume}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="capitalize text-neutral-300">
                        {p.category === 'perfume' && 'Perfume'}
                        {p.category === 'celular' && 'Celular'}
                        {p.category === 'acessorio' && 'Acessório'}
                      </span>
                    </td>

                    {/* IMEI / Barcode */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.imeiOrBarcode ? (
                        <span className="font-mono text-[11px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                          {p.imeiOrBarcode}
                        </span>
                      ) : (
                        <span className="text-neutral-600">-</span>
                      )}
                    </td>

                    {/* Cost Price */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-neutral-400 whitespace-nowrap">
                      {formatCurrency(p.costPrice)}
                    </td>

                    {/* Sale Price */}
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-red-400 whitespace-nowrap">
                      {formatCurrency(p.salePrice)}
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-400 whitespace-nowrap">
                      +{formatCurrency(margin)}
                      <span className="text-[10px] text-neutral-500 block">
                        ({marginPercent.toFixed(0)}%)
                      </span>
                    </td>

                    {/* Stock + Steppers */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1">
                        <button
                          title="Diminuir estoque"
                          onClick={() => quickStockAdjust(p.id, -1)}
                          className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        >
                          -
                        </button>
                        <span className={`w-8 text-center font-mono font-bold tabular-nums ${
                          isLow ? 'text-amber-400' : 'text-neutral-100'
                        }`}>
                          {p.stock}
                        </span>
                        <button
                          title="Aumentar estoque"
                          onClick={() => quickStockAdjust(p.id, 1)}
                          className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                      {isLow && (
                        <div className="text-[10px] text-amber-400 mt-0.5">
                          Mín: {p.minStock}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Editar dados do produto"
                          onClick={() => handleOpenEdit(p)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Excluir produto"
                          onClick={() => setProductToDelete(p)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhum produto encontrado no estoque com os filtros selecionados.
          </div>
        )}
      </div>

      {/* Product Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-400" />
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-5 space-y-4 text-xs">
              
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="font-medium text-neutral-300">Categoria do Produto</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('perfume');
                      if (!formModelOrVolume) setFormModelOrVolume('100ml EDP');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-colors ${
                      formCategory === 'perfume'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Perfume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('celular');
                      if (!formModelOrVolume) setFormModelOrVolume('128GB');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-colors ${
                      formCategory === 'celular'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Celular</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('acessorio')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-colors ${
                      formCategory === 'acessorio'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>Acessório</span>
                  </button>
                </div>
              </div>

              {/* Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-300">Marca / Fabricante *</label>
                  <input
                    type="text"
                    required
                    placeholder={formCategory === 'perfume' ? 'Ex: Dior, Chanel' : 'Ex: Apple, Xiaomi, Samsung'}
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-300">
                    {formCategory === 'perfume' ? 'Volume / Concentração' : 'Modelo / Memória / Cor'}
                  </label>
                  <input
                    type="text"
                    placeholder={formCategory === 'perfume' ? 'Ex: 100ml EDP' : 'Ex: 128GB Titânio Preto'}
                    value={formModelOrVolume}
                    onChange={(e) => setFormModelOrVolume(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-300">Nome Completo do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder={formCategory === 'perfume' ? 'Ex: Sauvage Eau de Parfum' : 'Ex: iPhone 15 Pro'}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* IMEI / Lote */}
              <div className="space-y-1">
                <label className="font-medium text-neutral-300">
                  {formCategory === 'celular' ? 'IMEI / Serial (Garantia do Aparelho)' : 'Lote / Código de Barras'}
                </label>
                <input
                  type="text"
                  placeholder={formCategory === 'celular' ? 'Ex: 354892110984512' : 'Ex: BATCH-2026-X'}
                  value={formImeiOrBarcode}
                  onChange={(e) => setFormImeiOrBarcode(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Prices & Stocks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-300">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formCostPrice || ''}
                    onChange={(e) => setFormCostPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-300">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formSalePrice || ''}
                    onChange={(e) => setFormSalePrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-300">Qtd. em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-300">Estoque Mínimo de Alerta</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-300">URL da Imagem (Opcional)</label>
                <input
                  type="text"
                  placeholder="https://... ou caminho de imagem"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-300">Observações adicionais</label>
                <input
                  type="text"
                  placeholder="Ex: Selo Adipec, garantia Apple até 2027, etc."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 font-medium text-neutral-400 hover:text-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-neutral-950 hover:bg-amber-400 transition-colors"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar no Estoque'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão do Produto */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Excluir Produto do Estoque"
        message="Tem certeza que deseja excluir permanentemente este produto do estoque? Esta ação não pode ser desfeita."
        itemDetails={productToDelete ? `${productToDelete.name} (${productToDelete.brand}) · Estoque: ${productToDelete.stock} un. · Preço: ${formatCurrency(productToDelete.salePrice)}` : undefined}
        confirmText="Excluir Produto"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />

    </div>
  );
};
