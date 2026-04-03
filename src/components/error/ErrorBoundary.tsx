import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Error Boundary Component - Error Boundary Pattern
 * Catches JavaScript errors anywhere in the child component tree
 */

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export const ErrorBoundary = ({ children, fallback, onError }: Props) => {
  const FallbackComponent = ({ error, resetErrorBoundary }: any) => {
    if (fallback) return fallback;

    return <ErrorFallback error={error} onRetry={resetErrorBoundary} />;
  };

  return (
    <ReactErrorBoundary FallbackComponent={FallbackComponent} onError={onError}>
      {children}
    </ReactErrorBoundary>
  );
};

/**
 * Error Fallback Component
 */
interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
}) => {
  const handleRetry = () => {
    onRetry?.();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try again or go back to the
          home page.
        </p>

        {error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Error Component
 */
export const LoadingError: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = "Failed to load data", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>

      <p className="text-gray-600 text-center mb-6 max-w-sm">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * Network Error Component
 */
export const NetworkError: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Problem
      </h3>

      <p className="text-gray-600 text-center mb-6 max-w-sm">
        Please check your internet connection and try again.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * Not Found Component
 */
export const NotFound: React.FC<{
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({
  title = "Oops... Looks like you got lost",
  message = "The page you are looking for does not exist.",
  action,
}) => {
  const defaultAction = {
    label: "Get back home",
    onClick: () => {
      window.location.href = "/";
    },
  };

  const effectiveAction = action || defaultAction;

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-orange-200">
        <div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center cursor-pointer hover:bg-orange-200 transition"
          onClick={effectiveAction.onClick}
          title="Click the car to go home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
            className="w-16 h-16"
          >
            <path
              d="M6 35h52l-4-12H10l-4 12z"
              fill="#FDBA74"
              stroke="#FB923C"
              strokeWidth="2"
            />
            <path
              d="M10 35v11h44V35"
              fill="#FDBA74"
              stroke="#FB923C"
              strokeWidth="2"
            />
            <circle cx="18" cy="48" r="4" fill="#FB923C" />
            <circle cx="46" cy="48" r="4" fill="#FB923C" />
            <path d="M20 22h24l4 13H16L20 22z" fill="#F59E0B" />
            <path d="M22 22v-6h20v6" stroke="#EA580C" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-orange-900 mb-3">404</h1>

        <p className="text-xl font-semibold text-orange-700 mb-2">{title}</p>

        <p className="text-orange-600 mb-6 max-w-sm mx-auto">{message}</p>

        <button
          onClick={effectiveAction.onClick}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          {effectiveAction.label}
        </button>

        <p className="mt-4 text-sm text-orange-500 opacity-80">
          Click the car above to return to home.
        </p>
      </div>
    </div>
  );
};

/**
 * Permission Denied Component
 */
export const PermissionDenied: React.FC<{
  requiredRole?: string;
  onLogin?: () => void;
}> = ({ requiredRole, onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>

        <p className="text-gray-600 mb-6">
          {requiredRole
            ? `You need ${requiredRole} privileges to access this page.`
            : "You do not have permission to access this page."}
        </p>

        {onLogin && (
          <button
            onClick={onLogin}
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};
