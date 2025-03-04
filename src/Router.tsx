import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hello from './pages/hello';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Hello />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;