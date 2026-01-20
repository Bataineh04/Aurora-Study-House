import * as React from "react";

// Simple toast implementation for Material-UI Snackbar
function useToast() {
  const [toast, setToast] = React.useState({ open: false, message: '', severity: 'info' });

  const showToast = ({ title, description, variant = 'default' }) => {
    const message = title + (description ? ': ' + description : '');
    const severity = variant === 'destructive' ? 'error' : 'info';
    
    setToast({ open: true, message, severity });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return {
    toast: showToast,
    hideToast,
    toastState: toast
  };
}

export { useToast };
