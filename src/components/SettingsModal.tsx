import React, { useState, useRef } from 'react';
import { useSales } from '../context/SalesContext';
import { Settings, Download, Upload, RotateCcw, X, Check, Store, KeyRound, Phone, MapPin } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings, exportBackup, importBackup, resetDemoData } = useSales();

  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackup(content);
      if (success) {
        setImportStatus('Backup restaurado com sucesso!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Erro ao ler arquivo de backup. Formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Deseja realmente restaurar os dados de demonstração originais? As alterações atuais serão substituídas.')) {
      resetDemoData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                Configurações da Loja
              </h2>
              <p className="text-xs text-neutral-400">
                Dados da empresa, Chave Pix para cobrança e Backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <div className="overflow-y-auto p-5 space-y-6 text-xs">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Store className="h-3.5 w-3.5 text-red-500" />
                Nome da Loja
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-red-500 focus:outline-none"
                placeholder="Ex: Fênix Multimarcas"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-medium text-neutral-300">Nome do Vendedor / Titular</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-red-500 focus:outline-none"
                  placeholder="Ex: Cesar Maia"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-medium text-neutral-300">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  WhatsApp da Loja
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-red-500 focus:outline-none"
                  placeholder="Ex: 11999998888"
                />
              </div>
            </div>

            {/* Pix configuration */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                <KeyRound className="h-4 w-4" />
                <span>Chave Pix (Usada nas mensagens de cobrança e recibos)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1">
                  <label className="text-neutral-400">Tipo de Chave</label>
                  <select
                    value={formData.pixKeyType}
                    onChange={(e) => setFormData(prev => ({ ...prev, pixKeyType: e.target.value as any }))}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-neutral-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Telefone">Telefone</option>
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Aleatória">Aleatória</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-neutral-400">Chave Pix</label>
                  <input
                    type="text"
                    required
                    value={formData.pixKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-neutral-100 focus:border-red-500 focus:outline-none"
                    placeholder="Chave Pix para recebimento"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-medium text-neutral-300">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                Endereço / Localização
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 focus:border-red-500 focus:outline-none"
                placeholder="Fênix Multimarcas - Org Cesar Maia"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-emerald-400 font-medium">
                {savedSuccess && 'Alterações salvas com sucesso!'}
              </span>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-red-500 hover:to-red-600 transition-all"
              >
                <Check className="h-3.5 w-3.5" />
                Salvar Configurações
              </button>
            </div>
          </form>

          {/* Backup & System Controls */}
          <div className="border-t border-neutral-800 pt-4 space-y-3">
            <h3 className="font-semibold text-neutral-300">Gestão de Dados & Backup</h3>
            <p className="text-neutral-400 text-[11px]">
              Seus dados de vendas, estoque e fiado são armazenados localmente com total segurança e privacidade. Você pode baixar uma cópia ou restaurar a qualquer momento.
            </p>

            {importStatus && (
              <div className="rounded-lg bg-neutral-800 p-2.5 text-xs text-amber-300">
                {importStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={exportBackup}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-2.5 font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                Exportar Backup (JSON)
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-2.5 font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Upload className="h-3.5 w-3.5 text-emerald-400" />
                Restaurar Backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-red-400 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Restaurar dados de demonstração originais
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Confirmação para Restaurar Dados */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Restaurar Dados Originais"
        message="Deseja realmente restaurar os dados de demonstração originais da Fênix Multimarcas? Todas as alterações manuais atuais de vendas e produtos serão substituídas."
        confirmText="Restaurar Dados"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          resetDemoData();
          setIsResetConfirmOpen(false);
          onClose();
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

    </div>
  );
};
