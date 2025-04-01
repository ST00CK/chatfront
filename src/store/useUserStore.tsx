import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    userId: string;
    email: string;
    file: string;
    name: string;
}

interface UserStore {
    user: User | null;
    users: User[]; // 사용자 목록 추가
    setUser: (user: User) => void;
    setUsers: (users: User[]) => void; // 사용자 목록 설정 메서드 추가
    updateUser: (user: Partial<User>) => void;
    logout: () => void;
    isLoggedIn: () => boolean;
}

export const useUserStore = create<UserStore, [["zustand/persist", UserStore]]>(
    persist(
        (set, get) => ({
            user: null,
            users: [], // 초기 사용자 목록 설정
            setUser: (user) => set(() => ({ user })), // 상태를 중첩 없이 저장
            setUsers: (users) => set({ users }), // 사용자 목록 설정 메서드 구현
            updateUser: (updatedUser) => set((state) => {
                const user = state.user ? { ...state.user, ...updatedUser } : null;
                return { user };
            }),
            logout: () => {
                set({ user: null, users: [] }); // 상태 초기화
                localStorage.removeItem('user-storage'); // 로컬 스토리지에서 상태 제거
            },
            isLoggedIn: () => get().user !== null,
        }),
        {
            name: 'user-storage',
        }
    )
);