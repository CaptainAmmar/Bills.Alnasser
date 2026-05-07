import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">عذراً، حدث خطأ ما</h2>
                    <p className="text-gray-500 text-sm">{this.state.error?.message || 'حدث خطأ غير متوقع في النظام'}</p>
                </div>
                <button 
                    onClick={() => {
                        window.location.href = '/dashboard';
                    }}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    <Home size={20} />
                    العودة للرئيسية
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
