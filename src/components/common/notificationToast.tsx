import React, { useEffect, useState } from 'react';
import '../../css/toast.css';

interface ToastProps {
    message: string;
    duration?: number;
    onClose?: () => void;
}

const NotificationToast: React.FC<ToastProps> = ({ message, duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300); // fadeOut 애니메이션 시간 고려
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast-container ${visible ? 'fade-in' : 'fade-out'}`}>
            <div className="toast-message">{message}</div>
        </div>
    );
};

export default NotificationToast;
