import { Product, Customer, Sale, StoreSettings } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Fênix Multimarcas',
  ownerName: 'Cesar Maia',
  phone: '11998765432',
  pixKey: '11998765432',
  pixKeyType: 'Telefone',
  address: 'Fênix Multimarcas · Org Cesar Maia · Sempre com você!'
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Lucas Ferreira da Silva',
    phone: '11988776655',
    cpf: '342.981.208-11',
    address: 'Rua das Flores, 240, Bairro Jardim',
    notes: 'Cliente fiel da Fênix, compra celulares e perfumes no fiado',
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'cust-2',
    name: 'Juliana Mendes Santos',
    phone: '11977665544',
    cpf: '451.890.112-90',
    address: 'Av. Paulista, 1500, Apto 82',
    notes: 'Compra perfumes importados e acessórios',
    createdAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'cust-3',
    name: 'Carlos Eduardo Souza',
    phone: '11966554433',
    cpf: '219.443.876-05',
    address: 'Rua Amazonas, 98',
    notes: 'Comprou Redmi Note no carnê parcelado',
    createdAt: '2026-09-01T16:00:00.000Z'
  },
  {
    id: 'cust-4',
    name: 'Camila Rocha Lima',
    phone: '11955443322',
    cpf: '512.671.932-84',
    address: 'Travessa Bela Vista, 45',
    notes: 'Aviso de vencimento de parcela pendente',
    createdAt: '2026-09-10T11:20:00.000Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-p1',
    name: 'Sauvage Dior Eau de Parfum',
    category: 'perfume',
    brand: 'Dior',
    modelOrVolume: '100ml EDP',
    imeiOrBarcode: 'DIOR-SV-7890',
    costPrice: 480.00,
    salePrice: 790.00,
    stock: 5,
    minStock: 2,
    imageUrl: '/images/perfume_sauvage_luxury_1790556045370.jpg',
    notes: 'Original lacrado com selo de procedência',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'prod-p2',
    name: 'Good Girl Carolina Herrera',
    category: 'perfume',
    brand: 'Carolina Herrera',
    modelOrVolume: '80ml EDP',
    imeiOrBarcode: 'CH-GG-4432',
    costPrice: 420.00,
    salePrice: 680.00,
    stock: 4,
    minStock: 2,
    imageUrl: '/images/perfume_good_girl_elegance_1790556054207.jpg',
    notes: 'Frasco sapatinho clássico original',
    createdAt: '2026-08-05T12:00:00.000Z'
  },
  {
    id: 'prod-p3',
    name: '212 VIP Black Men',
    category: 'perfume',
    brand: 'Carolina Herrera',
    modelOrVolume: '100ml EDP',
    imeiOrBarcode: 'CH-212VB-102',
    costPrice: 390.00,
    salePrice: 620.00,
    stock: 2,
    minStock: 2,
    notes: 'Aroma oriental marcante noturno',
    createdAt: '2026-08-10T09:00:00.000Z'
  },
  {
    id: 'prod-p4',
    name: 'Acqua Di Giò Giorgio Armani',
    category: 'perfume',
    brand: 'Giorgio Armani',
    modelOrVolume: '125ml Parfum',
    imeiOrBarcode: 'GA-ADG-998',
    costPrice: 460.00,
    salePrice: 750.00,
    stock: 3,
    minStock: 1,
    notes: 'Frescor sofisticado aquático',
    createdAt: '2026-08-15T15:00:00.000Z'
  },
  {
    id: 'prod-c1',
    name: 'iPhone 15 Pro 128GB Titânio',
    category: 'celular',
    brand: 'Apple',
    modelOrVolume: '128GB Titânio Natural',
    imeiOrBarcode: '354892110984512',
    costPrice: 5100.00,
    salePrice: 6290.00,
    stock: 3,
    minStock: 1,
    imageUrl: '/images/smartphone_flagship_titanium_1790556062831.jpg',
    notes: 'Lacrado com 1 ano de garantia oficial Apple',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'prod-c2',
    name: 'Xiaomi Redmi Note 13 Pro 5G',
    category: 'celular',
    brand: 'Xiaomi',
    modelOrVolume: '256GB / 8GB RAM Midnight Black',
    imeiOrBarcode: '864019054321908',
    costPrice: 1450.00,
    salePrice: 1980.00,
    stock: 6,
    minStock: 2,
    imageUrl: '/images/smartphone_pro_camera_1790556072102.jpg',
    notes: 'Câmera de 200MP e carregador 67W incluso',
    createdAt: '2026-08-02T11:00:00.000Z'
  },
  {
    id: 'prod-c3',
    name: 'Samsung Galaxy S24 256GB',
    category: 'celular',
    brand: 'Samsung',
    modelOrVolume: '256GB Cinza Ônix',
    imeiOrBarcode: '359012384756201',
    costPrice: 3400.00,
    salePrice: 4290.00,
    stock: 2,
    minStock: 1,
    notes: 'Galaxy AI nativo e display dinâmico AMOLED',
    createdAt: '2026-08-12T14:00:00.000Z'
  },
  {
    id: 'prod-a1',
    name: 'Carregador Turbo 20W USB-C',
    category: 'acessorio',
    brand: 'Apple',
    modelOrVolume: '20W Fonte Rápida',
    imeiOrBarcode: '7891234567890',
    costPrice: 45.00,
    salePrice: 99.00,
    stock: 15,
    minStock: 5,
    notes: 'Homologado Anatel',
    createdAt: '2026-08-05T09:00:00.000Z'
  },
  {
    id: 'prod-a2',
    name: 'Fone Bluetooth Sem Fio TWS',
    category: 'acessorio',
    brand: 'QCY / Xiaomi',
    modelOrVolume: 'Cancelamento Ruído ENC',
    imeiOrBarcode: '7899876543210',
    costPrice: 65.00,
    salePrice: 149.00,
    stock: 8,
    minStock: 3,
    notes: 'Autonomia de 28 horas com case',
    createdAt: '2026-08-08T16:00:00.000Z'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    date: '2026-09-15T14:30:00.000Z',
    customerId: 'cust-1',
    customerName: 'Lucas Ferreira da Silva',
    customerPhone: '11988776655',
    items: [
      {
        productId: 'prod-p1',
        productName: 'Sauvage Dior Eau de Parfum',
        brand: 'Dior',
        category: 'perfume',
        unitCost: 480.00,
        unitPrice: 790.00,
        quantity: 1,
        totalPrice: 790.00,
        imeiOrBarcode: 'DIOR-SV-7890'
      }
    ],
    subtotal: 790.00,
    discount: 40.00,
    total: 750.00,
    costTotal: 480.00,
    profit: 270.00,
    paymentMethod: 'a_vista_pix',
    paymentDetails: {
      notes: 'Pago no Pix na retirada'
    },
    status: 'concluida'
  },
  {
    id: 'sale-102',
    date: '2026-09-18T16:00:00.000Z',
    customerId: 'cust-2',
    customerName: 'Juliana Mendes Santos',
    customerPhone: '11977665544',
    items: [
      {
        productId: 'prod-p2',
        productName: 'Good Girl Carolina Herrera',
        brand: 'Carolina Herrera',
        category: 'perfume',
        unitCost: 420.00,
        unitPrice: 680.00,
        quantity: 1,
        totalPrice: 680.00,
        imeiOrBarcode: 'CH-GG-4432'
      },
      {
        productId: 'prod-a1',
        productName: 'Carregador Turbo 20W USB-C',
        brand: 'Apple',
        category: 'acessorio',
        unitCost: 45.00,
        unitPrice: 99.00,
        quantity: 1,
        totalPrice: 99.00,
        imeiOrBarcode: '7891234567890'
      }
    ],
    subtotal: 779.00,
    discount: 29.00,
    total: 750.00,
    costTotal: 465.00,
    profit: 285.00,
    paymentMethod: 'cartao_credito',
    paymentDetails: {
      cardInstallments: 3,
      notes: 'Parcelado em 3x no cartão de crédito'
    },
    status: 'concluida'
  },
  {
    id: 'sale-103',
    date: '2026-08-25T11:00:00.000Z',
    customerId: 'cust-3',
    customerName: 'Carlos Eduardo Souza',
    customerPhone: '11966554433',
    items: [
      {
        productId: 'prod-c2',
        productName: 'Xiaomi Redmi Note 13 Pro 5G',
        brand: 'Xiaomi',
        category: 'celular',
        unitCost: 1450.00,
        unitPrice: 1980.00,
        quantity: 1,
        totalPrice: 1980.00,
        imeiOrBarcode: '864019054321908'
      },
      {
        productId: 'prod-a2',
        productName: 'Fone Bluetooth Sem Fio TWS',
        brand: 'QCY / Xiaomi',
        category: 'acessorio',
        unitCost: 65.00,
        unitPrice: 149.00,
        quantity: 1,
        totalPrice: 149.00,
        imeiOrBarcode: '7899876543210'
      }
    ],
    subtotal: 2129.00,
    discount: 129.00,
    total: 2000.00,
    costTotal: 1515.00,
    profit: 485.00,
    paymentMethod: 'fiado_parcelado',
    paymentDetails: {
      downPayment: 500.00,
      fiadoInstallmentsCount: 3,
      intervalDays: 30,
      firstDueDate: '2026-09-25',
      notes: 'Entrada de 500 no Pix + 3x de 500 no carnê Fênix'
    },
    installments: [
      {
        id: 'inst-103-1',
        saleId: 'sale-103',
        customerId: 'cust-3',
        customerName: 'Carlos Eduardo Souza',
        customerPhone: '11966554433',
        installmentNumber: 1,
        totalInstallments: 3,
        amount: 500.00,
        dueDate: '2026-09-25',
        status: 'pago',
        paidAt: '2026-09-25T14:10:00.000Z',
        paidAmount: 500.00,
        paidVia: 'pix',
        notes: 'Pago no Pix no dia do vencimento'
      },
      {
        id: 'inst-103-2',
        saleId: 'sale-103',
        customerId: 'cust-3',
        customerName: 'Carlos Eduardo Souza',
        customerPhone: '11966554433',
        installmentNumber: 2,
        totalInstallments: 3,
        amount: 500.00,
        dueDate: '2026-10-25',
        status: 'pendente'
      },
      {
        id: 'inst-103-3',
        saleId: 'sale-103',
        customerId: 'cust-3',
        customerName: 'Carlos Eduardo Souza',
        customerPhone: '11966554433',
        installmentNumber: 3,
        totalInstallments: 3,
        amount: 500.00,
        dueDate: '2026-11-25',
        status: 'pendente'
      }
    ],
    status: 'fiado_aberto'
  },
  {
    id: 'sale-104',
    date: '2026-08-20T17:15:00.000Z',
    customerId: 'cust-4',
    customerName: 'Camila Rocha Lima',
    customerPhone: '11955443322',
    items: [
      {
        productId: 'prod-p3',
        productName: '212 VIP Black Men',
        brand: 'Carolina Herrera',
        category: 'perfume',
        unitCost: 390.00,
        unitPrice: 620.00,
        quantity: 1,
        totalPrice: 620.00,
        imeiOrBarcode: 'CH-212VB-102'
      }
    ],
    subtotal: 620.00,
    discount: 20.00,
    total: 600.00,
    costTotal: 390.00,
    profit: 210.00,
    paymentMethod: 'fiado_parcelado',
    paymentDetails: {
      downPayment: 0,
      fiadoInstallmentsCount: 2,
      intervalDays: 30,
      firstDueDate: '2026-09-20',
      notes: 'Fiado 2x de 300 sem entrada'
    },
    installments: [
      {
        id: 'inst-104-1',
        saleId: 'sale-104',
        customerId: 'cust-4',
        customerName: 'Camila Rocha Lima',
        customerPhone: '11955443322',
        installmentNumber: 1,
        totalInstallments: 2,
        amount: 300.00,
        dueDate: '2026-09-20',
        status: 'atrasado',
        notes: 'Vencida dia 20/09'
      },
      {
        id: 'inst-104-2',
        saleId: 'sale-104',
        customerId: 'cust-4',
        customerName: 'Camila Rocha Lima',
        customerPhone: '11955443322',
        installmentNumber: 2,
        totalInstallments: 2,
        amount: 300.00,
        dueDate: '2026-10-20',
        status: 'pendente'
      }
    ],
    status: 'fiado_aberto'
  }
];
