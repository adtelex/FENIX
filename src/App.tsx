import React, { useState, useMemo } from 'react';
import { SalesProvider, useSales } from './context/SalesContext';
import { Navbar, TabType } from './components/Navbar';
import { PDVView } from './components/PDVView';
import { FiadoView } from './components/FiadoView';
import { EstoqueView } from './components/EstoqueView';
import { ClientesView } from './components/ClientesView';
import { RelatoriosView } from './components/RelatoriosView';
import { SettingsModal } from './components/SettingsModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Sale } from './types';
import { isOverdue } from './utils/formatters';

const AppContent: React.FC = () => {
  const { allInstallments, products, settings } = useSales();

  const [currentTab, setCurrentTab] = useState<TabType>('pdv');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [recentCompletedSale, setRecentCompletedSale] = useState<Sale | null>(null);

  // Overdue count calculation
  const overdueCount = useMemo(() => {
    return allInstallments.filter(inst => 
      inst.status === 'atrasado' || (inst.status === 'pendente' && isOverdue(inst.dueDate))
    ).length;
  }, [allInstallments]);

  // Low stock count calculation
  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock <= p.minStock).length;
  }, [products]);

  const handleSaleCompleted = (sale: Sale) => {
    setRecentCompletedSale(sale);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        settings={settings}
        overdueCount={overdueCount}
        lowStockCount={lowStockCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        {currentTab === 'pdv' && (
          <PDVView
            onSaleCompleted={handleSaleCompleted}
            onNavigateToFiado={() => setCurrentTab('fiado')}
          />
        )}

        {currentTab === 'fiado' && <FiadoView />}

        {currentTab === 'estoque' && <EstoqueView />}

        {currentTab === 'clientes' && <ClientesView />}

        {currentTab === 'relatorios' && <RelatoriosView />}
      </main>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {recentCompletedSale && (
        <ReceiptModal
          sale={recentCompletedSale}
          settings={settings}
          onClose={() => setRecentCompletedSale(null)}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <SalesProvider>
      <AppContent />
    </SalesProvider>
  );
}
