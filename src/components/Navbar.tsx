import React from 'react';
import { StoreSettings } from '../types';
import { ShoppingBag, CreditCard, Layers, Users, BarChart3, Settings } from 'lucide-react';
import { FenixBrandLogo } from './FenixBrandLogo';

export type TabType = 'pdv' | 'fiado' | 'estoque' | 'clientes' | 'relatorios';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  settings: StoreSettings;
  overdueCount: number;
  lowStockCount: number;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  overdueCount,
  lowStockCount,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-18">
        
        {/* Zone 1: Fênix Multimarcas Brand Lockup */}
        <div className="flex items-center">
          <button 
            onClick={() => onSelectTab('pdv')}
            className="flex items-center text-left focus:outline-none group text-decoration-none"
          >
            <FenixBrandLogo size="md" showTaglines={true} />
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('pdv')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'pdv'
                ? 'bg-neutral-900 text-red-400 font-semibold border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>PDV / Vender</span>
          </button>

          <button
            onClick={() => onSelectTab('fiado')}
            className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'fiado'
                ? 'bg-neutral-900 text-red-400 font-semibold border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Fiado & Parcelas</span>
            {overdueCount > 0 && (
              <span className="ml-1 rounded-full bg-red-950 text-red-400 border border-red-500/50 px-1.5 py-0.2 text-[10px] font-mono tabular-nums">
                {overdueCount} atraso{overdueCount > 1 ? 's' : ''}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('estoque')}
            className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'estoque'
                ? 'bg-neutral-900 text-red-400 font-semibold border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Estoque</span>
            {lowStockCount > 0 && (
              <span className="ml-1 rounded-full bg-orange-950 text-orange-400 border border-orange-500/40 px-1.5 py-0.2 text-[10px] font-mono tabular-nums">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('clientes')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'clientes'
                ? 'bg-neutral-900 text-red-400 font-semibold border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Clientes</span>
          </button>

          <button
            onClick={() => onSelectTab('relatorios')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'relatorios'
                ? 'bg-neutral-900 text-red-400 font-semibold border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Relatórios</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="Configurações da Loja & Backup"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-red-500/40 hover:text-neutral-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
