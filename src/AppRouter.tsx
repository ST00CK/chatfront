import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import Login from './pages/loginPage';

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
    storage: window.localStorage,
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
                    <Route path="/" element={<Login />} />
                </Routes>
            </Router>
        </PersistQueryClientProvider>
    );
};

export default AppRouter;