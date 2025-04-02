import { create } from 'zustand';

interface UseToastStore {
    message: string;
    visible: boolean;
    showToast: (message: string) => void;
    hideToast: () => void;
}

export const useToastStore = create<UseToastStore>((set) => ({
    message: '',
    visible: false,
    showToast: (message: string) =>
        set({ message, visible: true}),
    hideToast: () => set({ visible: false }),
}));