import React from 'react';

interface FallbackProps {
  errorMessage: string;
  onRetry: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function DefaultFallback({ errorMessage, onRetry }: FallbackProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 3c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Terjadi Kesalahan</h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono break-all">
            {errorMessage}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-all"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [error, setError] = React.useState<Error | null>(null);
  const errorSeen = React.useRef(false);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      if (!errorSeen.current) {
        errorSeen.current = true;
        setError(event.error || new Error(event.message));
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      if (!errorSeen.current) {
        errorSeen.current = true;
        setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (error) {
    if (fallback) return <>{fallback}</>;
    return (
      <DefaultFallback
        errorMessage={error.message || 'Unknown error'}
        onRetry={() => {
          errorSeen.current = false;
          setError(null);
        }}
      />
    );
  }

  return <>{children}</>;
}
