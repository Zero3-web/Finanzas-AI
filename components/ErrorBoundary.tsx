import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  // FIX: The thrown value is not guaranteed to be an Error instance.
  error?: any;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Initialize state in the constructor. This is a more traditional approach
  // and can help resolve obscure type inference issues in some TypeScript configurations.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  // FIX: The thrown value is not guaranteed to be an Error instance.
  static getDerivedStateFromError(error: any): State {
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
