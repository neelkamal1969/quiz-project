import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const ConfirmContext = createContext(null);

// Promise-based confirm dialog. Use via useConfirm():
//   const ok = await confirm({ title, message, confirmText, tone: 'danger' });
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts = {}) => {
    setState({
      title: opts.title || 'Are you sure?',
      message: opts.message || '',
      confirmText: opts.confirmText || 'Confirm',
      cancelText: opts.cancelText || 'Cancel',
      tone: opts.tone || 'primary',
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result) => {
    setState(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        title={state?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => close(false)}>
              {state?.cancelText}
            </Button>
            <Button variant={state?.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)}>
              {state?.confirmText}
            </Button>
          </>
        }
      >
        {state?.message}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
