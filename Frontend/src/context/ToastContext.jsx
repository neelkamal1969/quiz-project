import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;
const TONES = {
  success: { border: 'rgba(52,211,153,0.4)', icon: '✅' },
  error: { border: 'rgba(251,113,133,0.4)', icon: '⚠️' },
  info: { border: 'rgba(var(--accent-rgb),0.4)', icon: 'ℹ️' },
};

// Global toast notifications. Use via useToast(): toast.success/error/info(message).
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const show = useCallback(
    (message, { type = 'info', duration = 3200 } = {}) => {
      const id = ++idCounter;
      setToasts((list) => [...list, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    show,
    success: (m, o) => show(m, { ...o, type: 'success' }),
    error: (m, o) => show(m, { ...o, type: 'error' }),
    info: (m, o) => show(m, { ...o, type: 'info' }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 'var(--space-6)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 'var(--z-toast)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          width: 'min(92vw, 380px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const tone = TONES[t.type] || TONES.info;
          return (
            <div
              key={t.id}
              role="status"
              onClick={() => dismiss(t.id)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-700)',
                border: `1.5px solid ${tone.border}`,
                boxShadow: 'var(--shadow-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-sans)',
                animation: 'ds-fade-up var(--dur) var(--ease-out) both',
              }}
            >
              <span>{tone.icon}</span>
              <span style={{ flex: 1 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
