import React, { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

// Watches network status and toasts on transitions. The app needs a connection
// for AI generation, so a clear offline signal is genuinely useful. Renders nothing.
export default function OfflineNotice() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    const goOffline = () => toastRef.current.error("You're offline — AI generation needs a connection.", { duration: 5000 });
    const goOnline = () => toastRef.current.success('Back online.');
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return null;
}
