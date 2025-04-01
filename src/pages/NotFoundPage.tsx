import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/'); // 3초 후 홈 페이지로 리다이렉트
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div>
            <h1>404 - 페이지를 찾을 수 없습니다.</h1>
            <p>3초 후 홈 페이지로 이동합니다...</p>
        </div>
    );
};

export default NotFoundPage;