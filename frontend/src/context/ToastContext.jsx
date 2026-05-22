import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'success') => {
    const key = ++id
    setToasts((prev) => [...prev, { id: key, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== key)), 3500)
  }, [])

  const remove = useCallback((key) => setToasts((prev) => prev.filter((t) => t.id !== key)), [])

  const toast = {
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error'),
    info: (msg) => add(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, remove }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
