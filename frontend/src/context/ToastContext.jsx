import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext();

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((messageOrObj, type = 'info', duration = 5000) => {
    // Support both addToast('msg', 'error') and addToast({ message: 'msg', type: 'error' })
    let msg = messageOrObj;
    let t = type;
    let d = duration;
    if (typeof messageOrObj === 'object' && messageOrObj !== null) {
      msg = messageOrObj.message || '';
      t = messageOrObj.type || 'info';
      d = messageOrObj.duration || 5000;
    }
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message: msg, type: t }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, d);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
