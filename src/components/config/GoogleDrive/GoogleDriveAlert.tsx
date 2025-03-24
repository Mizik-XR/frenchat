
import React from '@/core/reactInstance';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Check, Info } from 'lucide-react';

export interface GoogleDriveAlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  title: string;
  description: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export function GoogleDriveAlert({ type, title, description, onCancel, onConfirm }: GoogleDriveAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <Check className="h-4 w-4" />;
      case 'info':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const alertClasses = `${
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-800'
      : type === 'warning'
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-blue-50 border-blue-200 text-blue-800'
  }`;

  return (
    <Alert className={alertClasses}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <AlertTitle>{title}</AlertTitle>
      </div>
      <AlertDescription>{description}</AlertDescription>
      
      {(onCancel || onConfirm) && (
        <div className="flex justify-end gap-2 mt-2">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Annuler
            </button>
          )}
          {onConfirm && (
            <button 
              onClick={onConfirm}
              className="px-2 py-1 text-sm bg-primary text-white hover:bg-primary/90 rounded"
            >
              Confirmer
            </button>
          )}
        </div>
      )}
    </Alert>
  );
}
