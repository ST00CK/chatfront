import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import { useUserStore } from './store/useUserStore';
import { initializeSocket } from './utils/socket';
import { useEffect } from 'react';
import GlobalNotification from "./components/common/GlobalNotification";
import {initializeSSE} from "./utils/sse";
import {useToastStore} from "store/useToastStore";

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
    storage: window.localStorage,
    throttleTime: 1000,
});

const AppRouter = () => {
    const { user } = useUserStore();

    useEffect(() => {
        const setupSocket = async () => {
            if (user?.userId) {
                try {
                    await initializeSocket(user.userId); // 소켓 연결 완료 대기
                    const sse = initializeSSE(user.userId, (message) => {
                        useToastStore.getState().showToast(message);
                    });

                    return () => { sse.close() };
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
                </Routes>
            </Router>
            <GlobalNotification />
        </PersistQueryClientProvider>
    );
};

export default AppRouter;
