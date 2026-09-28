export type Category = 'perfume' | 'celular' | 'acessorio';

export type PaymentMethod = 
  | 'a_vista_dinheiro' 
  | 'a_vista_pix' 
  | 'cartao_debito' 
  | 'cartao_credito' 
  | 'fiado_parcelado';

export interface Product {
  id: string;
  name: string;
  category: Category;
  brand: string;
  modelOrVolume: string; // ex: "100ml EDP" ou "128GB Titânio"
  imeiOrBarcode?: string; // IMEI do celular ou código/lote do perfume
  costPrice: number; // Preço de Custo
  salePrice: number; // Preço de Venda
  stock: number; // Quantidade em estoque
  minStock: number; // Estoque mínimo para alerta
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string; // WhatsApp
  cpf?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  brand: string;
  category: Category;
  unitCost: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imeiOrBarcode?: string;
}

export type InstallmentStatus = 'pendente' | 'pago' | 'atrasado';

export interface Installment {
  id: string;
  saleId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  installmentNumber: number; // ex: 1, 2, 3
  totalInstallments: number; // ex: 3
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: InstallmentStatus;
  paidAt?: string;
  paidAmount?: number;
  paidVia?: 'dinheiro' | 'pix' | 'cartao';
  notes?: string;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  costTotal: number;
  profit: number;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    cardInstallments?: number;
    downPayment?: number; // Entrada paga na hora (se fiado)
    fiadoInstallmentsCount?: number;
    intervalDays?: number; // 30 dias (mensal) ou 15 dias (quinzenal)
    firstDueDate?: string;
    notes?: string;
  };
  installments?: Installment[];
  status: 'concluida' | 'fiado_aberto' | 'fiado_quitado' | 'cancelada';
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  phone: string; // WhatsApp da loja
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'Telefone' | 'E-mail' | 'Aleatória';
  address: string;
}
