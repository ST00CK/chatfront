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

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
    storage: window.localStorage,
    throttleTime: 1000,
});

const AppRouter = () => {
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
                    <Route path="/chatroom/:roomId" element={<ChatRoomPage />} />
                    <Route path="/chatlist" element={<ChatListPage />} />
                    <Route path="/chataddpage" element={<ChatAddPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                </Routes>
            </Router>
        </PersistQueryClientProvider>
    );
};

export default AppRouter;
