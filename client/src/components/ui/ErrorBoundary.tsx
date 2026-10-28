import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white hero-dot-grid">
          <div className="max-w-md w-full bg-white border border-[#D9D9D9] p-8 sm:p-10 text-center shadow-xs rounded-nothing">
            <div className="w-12 h-12 bg-red-50 text-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="font-dot text-2xl font-black text-[#0A0A0A] tracking-tight mb-2">
              SOMETHING WENT WRONG
            </h2>
            <p className="text-sm text-[#4A4A4A] mb-6 leading-relaxed">
              An unexpected system error occurred while rendering this interface. Your account data and escrow contracts remain completely safe.
            </p>
            <Button
              variant="orange"
              size="md"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={this.handleReset}
              className="w-full justify-center font-semibold"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
