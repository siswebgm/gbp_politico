import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id?: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  messages: ToastMessage[];
  showToast: (message: ToastMessage) => void;
  hideToast: (id: string) => void;
}

const toastStore = create<ToastStore>((set) => ({
  messages: [],
  showToast: (message: ToastMessage) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      messages: [...state.messages, { ...message, id }],
    }));

    if (message.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        }));
      }, message.duration || 3000);
    }
  },
  hideToast: (id: string) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),
}));

export function useToast() {
  const { showToast } = toastStore();

  return {
    success: (message: string) => showToast({ title: message, type: 'success' }),
    error: (message: string) => showToast({ title: message, type: 'error' }),
    info: (message: string) => showToast({ title: message, type: 'info' }),
    warning: (message: string) => showToast({ title: message, type: 'warning' }),
    custom: showToast,
  };
}
