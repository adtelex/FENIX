import React, { useState, useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { Product, Category, PaymentMethod, SaleItem, Customer } from '../types';
import { formatCurrency, formatDate, cleanPhone } from '../utils/formatters';
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, UserCheck, UserPlus, 
  Smartphone, Sparkles, Check, AlertTriangle, CreditCard, Banknote, 
  QrCode, Calendar, ArrowRight, ShieldCheck, X, Flame, Gamepad2, Tablet
} from 'lucide-react';

interface PDVViewProps {
  onSaleCompleted: (sale: any) => void;
  onNavigateToFiado: () => void;
}

export const PDVView: React.FC<PDVViewProps> = ({ onSaleCompleted, onNavigateToFiado }) => {
  const { products, customers, createSale, addCustomer, settings } = useSales();

  // Catalog filters
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Quick customer modal
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCpf, setNewCustCpf] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('a_vista_pix');
  const [cardInstallments, setCardInstallments] = useState<number>(1);
  
  // Fiado parcelado state
  const [fiadoDownPayment, setFiadoDownPayment] = useState<number>(0);
  const [fiadoInstallmentsCount, setFiadoInstallmentsCount] = useState<number>(3);
  const [fiadoIntervalDays, setFiadoIntervalDays] = useState<number>(30);
  const [fiadoFirstDueDate, setFiadoFirstDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [fiadoNotes, setFiadoNotes] = useState<string>('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        (p.imeiOrBarcode && p.imeiOrBarcode.toLowerCase().includes(q)) ||
        (p.modelOrVolume && p.modelOrVolume.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - (discount || 0));
  }, [subtotal, discount]);

  // Fiado preview calculation
  const fiadoSimulation = useMemo(() => {
    if (paymentMethod !== 'fiado_parcelado') return null;
    const down = Math.min(fiadoDownPayment || 0, total);
    const remaining = Math.max(0, total - down);
    const count = Math.max(1, fiadoInstallmentsCount);
    const baseInst = Math.floor((remaining / count) * 100) / 100;
    const remainder = Math.round((remaining - (baseInst * count)) * 100) / 100;

    const baseDate = new Date(fiadoFirstDueDate + 'T12:00:00');
    const schedule = Array.from({ length: count }).map((_, idx) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (idx * fiadoIntervalDays));
      const amount = idx === 0 ? Number((baseInst + remainder).toFixed(2)) : baseInst;
      return {
        number: idx + 1,
        date: d.toISOString().split('T')[0],
        amount
      };
    });

    return {
      down,
      remaining,
      schedule
    };
  }, [paymentMethod, total, fiadoDownPayment, fiadoInstallmentsCount, fiadoIntervalDays, fiadoFirstDueDate]);

  // Cart Actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setFiadoDownPayment(0);
  };

  // Quick Customer Create
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      cpf: newCustCpf.trim()
    });
    setSelectedCustomerId(created.id);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustCpf('');
    setIsQuickCustomerOpen(false);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Complete Sale
  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'fiado_parcelado' && !selectedCustomerId && !selectedCustomer) {
      alert('Atenção: Para vender no Fiado Parcelado, é obrigatório selecionar ou cadastrar o Cliente para cobrança!');
      return;
    }

    const saleItems: SaleItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      brand: item.product.brand,
      category: item.product.category,
      unitCost: item.product.costPrice,
      unitPrice: item.product.salePrice,
      quantity: item.quantity,
      totalPrice: item.product.salePrice * item.quantity,
      imeiOrBarcode: item.product.imeiOrBarcode
    }));

    const newSale = createSale({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'Cliente Avulso (Balcão)',
      customerPhone: selectedCustomer?.phone,
      items: saleItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      paymentDetails: {
        cardInstallments: paymentMethod === 'cartao_credito' ? cardInstallments : undefined,
        downPayment: paymentMethod === 'fiado_parcelado' ? fiadoDownPayment : undefined,
        fiadoInstallmentsCount: paymentMethod === 'fiado_parcelado' ? fiadoInstallmentsCount : undefined,
        intervalDays: paymentMethod === 'fiado_parcelado' ? fiadoIntervalDays : undefined,
        firstDueDate: paymentMethod === 'fiado_parcelado' ? fiadoFirstDueDate : undefined,
        notes: paymentMethod === 'fiado_parcelado' ? fiadoNotes : undefined
      }
    });

    clearCart();
    onSaleCompleted(newSale);
  };

  return (
    <div className="space-y-5">

      {/* Brand Hero Banner for Fênix Multimarcas */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-neutral-950 p-4 sm:p-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/fenix_multimarcas_banner_1790557426564.jpg"
            alt="Fênix Multimarcas"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        {/* Content over banner */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-6 bg-red-600 rounded-full" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-red-400 uppercase">
                TECNOLOGIA · QUALIDADE · CONFIANÇA
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>FÊN</span>
              <span>I</span>
              <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">X</span>
              <span className="ml-1 text-neutral-300 font-extrabold">MULTIMARCAS</span>
            </h1>
            <p className="text-xs text-neutral-400">
              Org Cesar Maia · <span className="text-red-400/90 italic font-serif">Sempre com você!</span> · Perfumes, Celulares e Acessórios
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-3 py-2 text-right">
              <div className="text-[10px] text-neutral-400 uppercase font-medium">Chave Pix da Loja</div>
              <div className="font-mono text-xs font-bold text-red-400 select-all">{settings.pixKey}</div>
              <div className="text-[9px] text-neutral-500">Favorecido: {settings.ownerName}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Product Catalog (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            
            {/* Search box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar perfume, celular, marca, lote ou IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-red-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 shrink-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedCategory('celular')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedCategory === 'celular'
                    ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Smartphone className="h-3 w-3" />
                <span>Celulares</span>
              </button>
              <button
                onClick={() => setSelectedCategory('perfume')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedCategory === 'perfume'
                    ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>Perfumes</span>
              </button>
              <button
                onClick={() => setSelectedCategory('acessorio')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedCategory === 'acessorio'
                    ? 'bg-neutral-800 text-red-400 shadow-xs border border-red-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Acessórios
              </button>
            </div>

          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => {
              const inCart = cart.find(c => c.product.id === product.id);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-neutral-900/70 p-3 transition-all ${
                    isOutOfStock 
                      ? 'border-neutral-800 opacity-60' 
                      : 'border-neutral-800 hover:border-red-500/50 hover:bg-neutral-900 shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.12)]'
                  }`}
                >
                  <div>
                    {/* Image container */}
                    <div className="relative mb-2.5 aspect-4/3 w-full overflow-hidden rounded-lg bg-neutral-950 flex items-center justify-center border border-neutral-800/80">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback Icon */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-neutral-600 pointer-events-none">
                        {product.category === 'perfume' ? (
                          <Sparkles className="h-6 w-6 text-red-500/30" />
                        ) : (
                          <Smartphone className="h-6 w-6 text-red-500/30" />
                        )}
                      </div>

                      {/* Stock Alert Badge */}
                      <div className="absolute bottom-1.5 right-1.5">
                        {isOutOfStock ? (
                          <span className="rounded bg-neutral-950/90 border border-neutral-700 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
                            Esgotado
                          </span>
                        ) : isLowStock ? (
                          <span className="rounded bg-red-950/90 border border-red-500/40 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
                            {product.stock} restam
                          </span>
                        ) : (
                          <span className="rounded bg-neutral-900/90 border border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-300 tabular-nums">
                            Estoque: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider truncate">
                        {product.brand} · {product.modelOrVolume}
                      </div>
                      <h3 className="text-xs font-semibold text-neutral-100 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      {product.imeiOrBarcode && (
                        <p className="text-[10px] font-mono text-neutral-500 truncate">
                          ID: {product.imeiOrBarcode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price and Add Button */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-400">Preço de Venda</div>
                      <div className="text-sm font-bold font-mono text-red-400 tabular-nums">
                        {formatCurrency(product.salePrice)}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-all ${
                        isOutOfStock
                          ? 'cursor-not-allowed bg-neutral-800 text-neutral-500'
                          : inCart
                          ? 'bg-red-600 text-white font-semibold shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                          : 'bg-neutral-800 text-neutral-200 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>{inCart.quantity}x</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center">
              <p className="text-sm text-neutral-400">Nenhum produto encontrado para os filtros selecionados.</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-2 text-xs text-red-400 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}

        </div>

        {/* RIGHT: Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="sticky top-20 rounded-xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-md p-4 shadow-xl space-y-4">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-red-500" />
                <h2 className="text-sm font-semibold text-neutral-100">
                  Carrinho de Venda
                </h2>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-mono tabular-nums text-neutral-300">
                  {cart.reduce((s, it) => s + it.quantity, 0)} itens
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Customer Selection Zone */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-red-400" />
                  Cliente da Venda
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:underline"
                >
                  <UserPlus className="h-3 w-3" />
                  + Novo Cliente
                </button>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 focus:border-red-500 focus:outline-none"
              >
                <option value="">Cliente Avulso (Não identificado)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>

              {selectedCustomer && (
                <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80 flex items-center justify-between">
                  <span>WhatsApp: {selectedCustomer.phone || 'Não informado'}</span>
                  {selectedCustomer.cpf && <span>CPF: {selectedCustomer.cpf}</span>}
                </div>
              )}
            </div>

            {/* Cart Item List */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  Seu carrinho está vazio. Clique em um produto para adicionar.
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/60 p-2 text-xs"
                  >
                    <div className="flex-1 truncate pr-2">
                      <div className="font-semibold text-neutral-200 truncate">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {product.brand} · <span className="font-mono text-red-400">{formatCurrency(product.salePrice)}</span> un.
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateCartQuantity(product.id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-neutral-100 tabular-nums">
                        {quantity}
                      </span>
                      <button
                        disabled={quantity >= product.stock}
                        onClick={() => updateCartQuantity(product.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="ml-1 p-1 text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal, Discount & Total */}
            <div className="space-y-1.5 border-t border-neutral-800 pt-3 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex items-center justify-between text-neutral-400">
                <span>Desconto (R$):</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px]">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right font-mono text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm font-bold text-neutral-100">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-base text-red-400 tabular-nums drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 border-t border-neutral-800 pt-3">
              <label className="text-xs font-medium text-neutral-300">
                Forma de Pagamento
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('a_vista_pix')}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                    paymentMethod === 'a_vista_pix'
                      ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 font-semibold shadow-xs'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <QrCode className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>À Vista (Pix)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('a_vista_dinheiro')}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                    paymentMethod === 'a_vista_dinheiro'
                      ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 font-semibold shadow-xs'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Banknote className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>À Vista (Dinheiro)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_credito')}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                    paymentMethod === 'cartao_credito'
                      ? 'border-blue-500/80 bg-blue-500/10 text-blue-300 font-semibold shadow-xs'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <CreditCard className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>Cartão de Crédito</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('fiado_parcelado')}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                    paymentMethod === 'fiado_parcelado'
                      ? 'border-red-500 bg-red-500/10 text-red-300 font-semibold shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Calendar className="h-4 w-4 shrink-0 text-red-400" />
                  <span>Fiado Parcelado</span>
                </button>
              </div>

              {/* Credit Card options */}
              {paymentMethod === 'cartao_credito' && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Número de Parcelas:</span>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(parseInt(e.target.value) || 1)}
                      className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-200"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <option key={n} value={n}>
                          {n}x de {formatCurrency(total / n)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Fiado Parcelado Config & Simulation */}
              {paymentMethod === 'fiado_parcelado' && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/20 p-3 text-xs space-y-3">
                  <div className="flex items-center justify-between text-red-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-red-500" />
                      Carnê Fênix (Fiado Parcelado)
                    </span>
                    {!selectedCustomer && (
                      <span className="text-[10px] text-red-400 font-normal">
                        *Selecione o cliente acima
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-400">Entrada (R$):</label>
                      <input
                        type="number"
                        min="0"
                        max={total}
                        step="1"
                        value={fiadoDownPayment || ''}
                        onChange={(e) => setFiadoDownPayment(parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 font-mono text-neutral-100 focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400">Parcelas:</label>
                      <select
                        value={fiadoInstallmentsCount}
                        onChange={(e) => setFiadoInstallmentsCount(parseInt(e.target.value) || 1)}
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-neutral-100 focus:border-red-500 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                          <option key={n} value={n}>{n}x parcelas</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-400">Periodicidade:</label>
                      <select
                        value={fiadoIntervalDays}
                        onChange={(e) => setFiadoIntervalDays(parseInt(e.target.value) || 30)}
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-neutral-100 focus:border-red-500 focus:outline-none"
                      >
                        <option value="30">Mensal (a cada 30 dias)</option>
                        <option value="15">Quinzenal (a cada 15 dias)</option>
                        <option value="7">Semanal (a cada 7 dias)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400">1º Vencimento:</label>
                      <input
                        type="date"
                        value={fiadoFirstDueDate}
                        onChange={(e) => setFiadoFirstDueDate(e.target.value)}
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-neutral-100 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fiado Live Installment Schedule Preview */}
                  {fiadoSimulation && (
                    <div className="rounded border border-neutral-800 bg-neutral-950/80 p-2 space-y-1">
                      <div className="text-[10px] text-neutral-400 font-medium">
                        Simulação do Carnê Fênix:
                      </div>
                      {fiadoSimulation.down > 0 && (
                        <div className="flex justify-between text-[11px] text-emerald-400 font-medium">
                          <span>Entrada (hoje):</span>
                          <span className="font-mono tabular-nums">{formatCurrency(fiadoSimulation.down)}</span>
                        </div>
                      )}
                      <div className="space-y-0.5 pt-0.5">
                        {fiadoSimulation.schedule.map((inst) => (
                          <div key={inst.number} className="flex justify-between text-[10px] text-neutral-300">
                            <span>{inst.number}ª Parcela ({formatDate(inst.date)}):</span>
                            <span className="font-mono font-semibold tabular-nums text-red-400">
                              {formatCurrency(inst.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              disabled={cart.length === 0 || (paymentMethod === 'fiado_parcelado' && !selectedCustomerId)}
              onClick={handleFinalizeSale}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                cart.length === 0 || (paymentMethod === 'fiado_parcelado' && !selectedCustomerId)
                  ? 'cursor-not-allowed bg-neutral-800 text-neutral-500'
                  : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-[0.99]'
              }`}
            >
              <span>Finalizar Venda & Gerar Comprovante</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {paymentMethod === 'fiado_parcelado' && !selectedCustomerId && (
              <p className="text-[10px] text-red-400 text-center">
                ⚠️ Selecione um cliente cadastrado para liberar o carnê no Fiado.
              </p>
            )}

          </div>
        </div>

        {/* Quick Customer Modal */}
        {isQuickCustomerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-red-400" />
                  Cadastrar Cliente Rápido
                </h3>
                <button
                  onClick={() => setIsQuickCustomerOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 11988887777 (com DDD)"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">CPF (Opcional)</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newCustCpf}
                    onChange={(e) => setNewCustCpf(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsQuickCustomerOpen(false)}
                    className="rounded-lg px-3 py-2 text-neutral-400 hover:text-neutral-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 transition-colors shadow-sm"
                  >
                    Salvar e Selecionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
