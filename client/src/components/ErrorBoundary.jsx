import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="text-red-400 font-medium mb-2">
            ⚠️ Something went wrong
          </div>
          <div className="text-gray-400 text-sm">
            {this.props.fallbackMessage || 'An error occurred while rendering this content.'}
          </div>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">Error details (dev mode)</summary>
              <pre className="text-xs text-red-300 mt-1 overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
