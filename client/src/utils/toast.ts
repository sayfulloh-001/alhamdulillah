export type ToastType = 'success' | 'error' | 'info';

export interface ToastDetail {
  message: string;
  type: ToastType;
}

/**
 * Dispatches a custom event to show a beautiful floating toast.
 * Replaces blocking browser alert() calls.
 */
export function showToast(message: string, type: ToastType = 'success') {
  const event = new CustomEvent('dehqon-toast', { 
    detail: { message, type } 
  });
  window.dispatchEvent(event);
}
