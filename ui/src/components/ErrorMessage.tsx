import React from 'react';
import { useAppStore } from '@/store/app';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const setError = useAppStore((state) => state.setError);

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between">
      <span className="text-sm">{message}</span>
      <button
        onClick={() => setError(null)}
        className="ml-4 text-destructive-foreground hover:text-destructive-foreground/80"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorMessage;