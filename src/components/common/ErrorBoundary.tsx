import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/invoices';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-[#1A1D20]">
          <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE5DC] shadow-lg text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-black text-[#1A1D20]">Application Notice</h1>
              <p className="text-xs text-[#718292]">
                An unexpected interface state occurred. Click below to reload your session cleanly.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl text-[11px] font-mono text-left text-slate-700 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#1A1D20] border border-[#EAE5DC] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Invoices</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
