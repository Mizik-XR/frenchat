
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon, CheckCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons';

export interface GoogleDriveAlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  title: string;
  description: string;
}

export function GoogleDriveAlert({ type, title, description }: GoogleDriveAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'success':
        return <CheckCircledIcon className="h-4 w-4" />;
      case 'info':
      default:
        return <InfoCircledIcon className="h-4 w-4" />;
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
    </Alert>
  );
}
