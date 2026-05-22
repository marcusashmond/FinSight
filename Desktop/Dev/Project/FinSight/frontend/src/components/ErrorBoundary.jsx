import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
