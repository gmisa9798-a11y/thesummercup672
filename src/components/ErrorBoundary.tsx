import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  // @ts-ignore
  public props: ErrorBoundaryProps;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      let displayMessage = "Щось пішло не так. Перезавантажте сторінку.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.operationType) {
          displayMessage = `Помилка бази даних (${parsed.operationType}): ${parsed.error}`;
        }
      } catch (e) {
        if (this.state.error?.message) displayMessage = this.state.error.message;
      }

      return (
        <div className="min-h-screen bg-pitch flex items-center justify-center p-6">
          <div className="glass-morphism rounded-3xl p-10 max-w-lg w-full text-center space-y-6 text-white">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold brand-font uppercase tracking-tighter">Помилка завантаження</h2>
            <p className="text-white/40 text-sm leading-relaxed">{displayMessage}</p>
            <button 
              onClick={this.handleReload}
              className="flex items-center gap-2 mx-auto bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest"
            >
              <RefreshCcw className="w-4 h-4" /> Повернутися на головну
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
