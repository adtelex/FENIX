import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Sale, Installment, StoreSettings, PaymentMethod, SaleItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_SALES, INITIAL_SETTINGS } from '../data/initialData';
import { isOverdue } from '../utils/formatters';

interface SalesContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  settings: StoreSettings;
  allInstallments: Installment[];
  
  // Actions
  createSale: (params: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentDetails: {
      cardInstallments?: number;
      downPayment?: number;
      fiadoInstallmentsCount?: number;
      intervalDays?: number;
      firstDueDate?: string;
      notes?: string;
    };
  }) => Sale;

  payInstallment: (installmentId: string, paymentData: {
    paidAmount: number;
    paidVia: 'dinheiro' | 'pix' | 'cartao';
    paidAt?: string;
    notes?: string;
  }) => void;

  cancelSale: (saleId: string) => void;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  quickStockAdjust: (id: string, delta: number) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string, removeSalesAndInstallments?: boolean) => void;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetDemoData: () => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
}

const SalesContext = createContext<SalesContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'gestao_vendas_products_v1',
  CUSTOMERS: 'gestao_vendas_customers_v1',
  SALES: 'gestao_vendas_sales_v1',
  SETTINGS: 'gestao_vendas_settings_v1',
};

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      const loaded: Sale[] = saved ? JSON.parse(saved) : INITIAL_SALES;
      // Recalculate overdue status for pending installments
      return loaded.map(s => {
        if (!s.installments) return s;
        return {
          ...s,
          installments: s.installments.map(inst => {
            if (inst.status === 'pendente' && isOverdue(inst.dueDate)) {
              return { ...inst, status: 'atrasado' };
            }
            return inst;
          })
        };
      });
    } catch {
      return INITIAL_SALES;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName === 'Elite Vendas - Perfumes & Celulares' || parsed.storeName === 'Elite Vendas') {
          return INITIAL_SETTINGS;
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to save sales', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Derive all installments flat list
  const allInstallments = sales.flatMap(s => s.installments || []).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Add Sale implementation
  const createSale = (params: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentDetails: {
      cardInstallments?: number;
      downPayment?: number;
      fiadoInstallmentsCount?: number;
      intervalDays?: number;
      firstDueDate?: string;
      notes?: string;
    };
  }): Sale => {
    const saleId = `sale-${Date.now()}`;
    const costTotal = params.items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
    const profit = params.total - costTotal;

    let installments: Installment[] | undefined = undefined;
    let saleStatus: Sale['status'] = 'concluida';

    if (params.paymentMethod === 'fiado_parcelado') {
      saleStatus = 'fiado_aberto';
      const downPayment = params.paymentDetails.downPayment || 0;
      const amountToFinance = Math.max(0, params.total - downPayment);
      const count = Math.max(1, params.paymentDetails.fiadoInstallmentsCount || 1);
      const interval = params.paymentDetails.intervalDays || 30;

      // Base date
      const baseDueDate = params.paymentDetails.firstDueDate 
        ? new Date(params.paymentDetails.firstDueDate + 'T12:00:00')
        : new Date(Date.now() + interval * 86400000);

      const baseAmountPerInstallment = Math.floor((amountToFinance / count) * 100) / 100;
      const remainder = Math.round((amountToFinance - (baseAmountPerInstallment * count)) * 100) / 100;

      installments = Array.from({ length: count }).map((_, index) => {
        const instNum = index + 1;
        const currentDueDate = new Date(baseDueDate);
        currentDueDate.setDate(currentDueDate.getDate() + (index * interval));
        const dueDateStr = currentDueDate.toISOString().split('T')[0];

        // First installment absorbs remainder
        const currentAmount = index === 0 ? Number((baseAmountPerInstallment + remainder).toFixed(2)) : baseAmountPerInstallment;

        return {
          id: `inst-${Date.now()}-${instNum}`,
          saleId,
          customerId: params.customerId || `guest-${Date.now()}`,
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          installmentNumber: instNum,
          totalInstallments: count,
          amount: currentAmount,
          dueDate: dueDateStr,
          status: isOverdue(dueDateStr) ? 'atrasado' : 'pendente'
        };
      });
    }

    const newSale: Sale = {
      id: saleId,
      date: new Date().toISOString(),
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      items: params.items,
      subtotal: params.subtotal,
      discount: params.discount,
      total: params.total,
      costTotal,
      profit,
      paymentMethod: params.paymentMethod,
      paymentDetails: params.paymentDetails,
      installments,
      status: saleStatus
    };

    // Decrement stock for sold products
    setProducts(prev => {
      const stockMap = new Map<string, number>();
      params.items.forEach(it => {
        stockMap.set(it.productId, (stockMap.get(it.productId) || 0) + it.quantity);
      });

      return prev.map(p => {
        const qtySold = stockMap.get(p.id);
        if (qtySold) {
          return {
            ...p,
            stock: Math.max(0, p.stock - qtySold)
          };
        }
        return p;
      });
    });

    setSales(prev => [newSale, ...prev]);

    return newSale;
  };

  // Pay an installment
  const payInstallment = (installmentId: string, paymentData: {
    paidAmount: number;
    paidVia: 'dinheiro' | 'pix' | 'cartao';
    paidAt?: string;
    notes?: string;
  }) => {
    setSales(prevSales => {
      return prevSales.map(sale => {
        if (!sale.installments) return sale;
        const hasTarget = sale.installments.some(inst => inst.id === installmentId);
        if (!hasTarget) return sale;

        const updatedInstallments = sale.installments.map(inst => {
          if (inst.id === installmentId) {
            return {
              ...inst,
              status: 'pago' as const,
              paidAt: paymentData.paidAt || new Date().toISOString(),
              paidAmount: paymentData.paidAmount,
              paidVia: paymentData.paidVia,
              notes: paymentData.notes || inst.notes
            };
          }
          return inst;
        });

        // Check if all installments are now paid
        const allPaid = updatedInstallments.every(inst => inst.status === 'pago');
        const newSaleStatus = allPaid ? 'fiado_quitado' : 'fiado_aberto';

        return {
          ...sale,
          installments: updatedInstallments,
          status: newSaleStatus
        };
      });
    });
  };

  // Cancel sale and restore stock
  const cancelSale = (saleId: string) => {
    const saleToCancel = sales.find(s => s.id === saleId);
    if (!saleToCancel || saleToCancel.status === 'cancelada') return;

    // Restore stock
    setProducts(prev => {
      const stockRestoreMap = new Map<string, number>();
      saleToCancel.items.forEach(it => {
        stockRestoreMap.set(it.productId, (stockRestoreMap.get(it.productId) || 0) + it.quantity);
      });

      return prev.map(p => {
        const restoreQty = stockRestoreMap.get(p.id);
        if (restoreQty) {
          return { ...p, stock: p.stock + restoreQty };
        }
        return p;
      });
    });

    // Mark sale as cancelada
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'cancelada' } : s));
  };

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const quickStockAdjust = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    }));
  };

  // Customers CRUD
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCustomer = (id: string, removeSalesAndInstallments: boolean = true) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    if (removeSalesAndInstallments) {
      setSales(prev => prev.filter(s => s.customerId !== id));
    }
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(INITIAL_SALES);
    setSettings(INITIAL_SETTINGS);
  };

  const exportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      customers,
      sales,
      settings
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-vendas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products && parsed.customers && parsed.sales) {
        setProducts(parsed.products);
        setCustomers(parsed.customers);
        setSales(parsed.sales);
        if (parsed.settings) setSettings(parsed.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <SalesContext.Provider
      value={{
        products,
        customers,
        sales,
        settings,
        allInstallments,
        createSale,
        payInstallment,
        cancelSale,
        addProduct,
        updateProduct,
        deleteProduct,
        quickStockAdjust,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        updateSettings,
        resetDemoData,
        exportBackup,
        importBackup
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
