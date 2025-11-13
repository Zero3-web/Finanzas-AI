import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Added a constructor to properly initialize the component's state. In React class components, the constructor is where `super(props)` should be called and the initial state should be set. This resolves errors where `this.state` or `this.props` would be undefined.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh', 
            padding: '2rem', 
            textAlign: 'center', 
            fontFamily: 'sans-serif',
            backgroundColor: '#f9fafb',
            color: '#1f2937'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>An unexpected error occurred. Please try refreshing the page.</p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: '1rem', borderRadius: '8px', textAlign: 'left', maxWidth: '800px', cursor: 'pointer' }}>
                <summary>Error Details</summary>
                <code style={{ display: 'block', marginTop: '1rem', color: '#ef4444' }}>
                    {this.state.error.toString()}
                </code>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;