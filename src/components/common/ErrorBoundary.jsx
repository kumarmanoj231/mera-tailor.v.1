import React from "react";
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Safe console logging for diagnostics
    console.error("[MeraTailor ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.handleReset,
        });
      }

      const errorMessage = this.state.error?.message || "An unexpected error occurred.";
      const isReact300 = errorMessage.includes("300") || errorMessage.includes("fewer hooks than expected");

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4">
              <ShieldAlert size={28} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              {isReact300
                ? "The application encountered a component lifecycle synchronization issue. We have captured this state."
                : "An unexpected error interrupted this page. Please try refreshing or return to the main dashboard."}
            </p>

            {process.env.NODE_ENV !== "production" && (
              <div className="mb-6 text-left rounded-xl bg-stone-50 p-3.5 border border-stone-200 overflow-x-auto text-xs text-rose-800 font-mono">
                <p className="font-bold mb-1">{errorMessage}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[11px] leading-snug whitespace-pre-wrap text-stone-600">
                    {this.state.errorInfo.componentStack.slice(0, 500)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8f2338] px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#781c2e] transition"
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <Home size={16} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
