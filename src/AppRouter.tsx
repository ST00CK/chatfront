import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import LoginPage from './pages/loginPage';
import SignUpPage from './pages/signUpPage';
import PasswdChangePage from './pages/passWDChangePage';
import FriendListPage from './pages/friendListPage';
import ChatRoomPage from './pages/chatRoomPage';
import ChatListPage from './pages/chatListPage';
import ChatAddPage from './pages/chatAddPage';
import MyPage from './pages/mypage';
import NotFoundPage from './pages/NotFoundPage';
import { useUserStore } from './store/useUserStore';
import {useEffect, useRef} from 'react';
import GlobalNotification from "./components/common/GlobalNotification";
import {initializeSSE} from "./utils/sse";
import {useToastStore} from "./store/useToastStore";
import { initializeSocket } from './utils/socket';

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
    storage: window.localStorage,
    throttleTime: 1000,
});

const AppRouter = () => {
    const { user,setUser } = useUserStore();

    useEffect(() => {
        const storedUser = localStorage.getItem('user-storage');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
    
                // 중첩된 상태를 복원
                const user = parsedUser.state?.user?.state?.user || parsedUser.state?.user || parsedUser.user;
                if (user) {
                    setUser(user);
                }
            } catch (error) {
                console.error('Failed to parse user-storage:', error);
            }
        }
    }, [setUser]);

    useEffect(() => {
        const setupSocket = async () => {
            if (user?.userId) {
                try {
                    await initializeSocket(user.userId);
                } catch (error) {
                    console.error('Failed to initialize socket:', error);
                }
            }
        };

        setupSocket();
    }, [user?.userId]);

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{
            persister,
            dehydrateOptions: {
                shouldDehydrateQuery: (query) => query.options.meta?.persist === true,
            },
        }}>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/passwdchange" element={<PasswdChangePage />} />
                    <Route path="/friendlist" element={<FriendListPage />} />
                    <Route path="/chatroom" element={<ChatRoomPage />} />
                    <Route path="/chatlist" element={<ChatListPage />} />
                    <Route path="/chataddpage" element={<ChatAddPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="*" element={<NotFoundPage />} /> {/* 404 페이지 */}
                </Routes>
            </Router>
        </PersistQueryClientProvider>
    );
};

export default AppRouter;
