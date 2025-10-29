import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error);
    console.error('🔴 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-2xl w-full glass-card p-8 border-danger/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-danger">Erro no Sistema</h1>
                <p className="text-sm text-muted-foreground">Algo deu errado ao renderizar este componente</p>
              </div>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
              <p className="text-danger font-semibold mb-2">Erro:</p>
              <p className="text-foreground">{this.state.error?.toString()}</p>
            </div>

            {this.state.errorInfo && (
              <details className="bg-muted/20 p-4 rounded-lg mb-4">
                <summary className="cursor-pointer text-sm font-semibold text-muted-foreground mb-2">
                  Stack Trace (clique para expandir)
                </summary>
                <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                variant="outline"
              >
                Tentar Novamente
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="btn-primary-gradient"
              >
                Recarregar Página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}




