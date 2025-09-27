import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: any) => void
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="text-gray-600 max-w-md">
        An unexpected error occurred in the D&D encounter builder. Don't worry, your data is safe!
      </p>
      <details className="text-left">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Technical details
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
          {error.message}
        </pre>
      </details>
      <div className="flex gap-2 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-dnd-primary text-white rounded hover:bg-dnd-primary/90 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  </div>
)

/**
 * Enhanced error boundary for the D&D app
 * Provides graceful error handling and recovery options
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    // Call error callback if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} reset={this.handleReset} />
    }

    return this.props.children
  }
}

/**
 * Specific error boundary for combat features
 */
export const CombatErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleError = (error: Error, errorInfo: any) => {
    // Could send to error reporting service here
    console.error('Combat system error:', error, errorInfo)
  }

  const CombatErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-red-500 text-2xl">⚔️</div>
        <div>
          <h3 className="font-semibold text-red-800">Combat System Error</h3>
          <p className="text-red-600 text-sm">The combat tracker encountered an error</p>
        </div>
      </div>

      <div className="space-y-3">
        <details>
          <summary className="cursor-pointer text-sm text-red-700 hover:text-red-800">
            Show error details
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Reset Combat
          </button>
          <button
            onClick={() => {
              // Could clear combat state here
              reset()
            }}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={CombatErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary