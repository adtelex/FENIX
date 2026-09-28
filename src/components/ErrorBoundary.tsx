import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-neutral-900 p-6 shadow-[0_0_30px_rgba(239,68,68,0.25)] text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-base font-bold text-neutral-100">
                Fênix Multimarcas
              </h1>
              <p className="text-xs text-neutral-400">
                Ocorreu uma falha inesperada ao carregar a aplicação.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="rounded-lg bg-neutral-950 p-3 text-left font-mono text-[11px] text-red-400 border border-neutral-800 break-words">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-xs font-bold text-white hover:from-red-500 hover:to-red-600 transition-all shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleResetData}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                title="Limpar cache do navegador e restaurar dados padrão"
              >
                <Trash2 className="h-3.5 w-3.5 text-neutral-400" />
                <span>Limpar Dados</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
