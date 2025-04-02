import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { fetchUserById } from '../../query/userQuery';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning';
    duration?: number;
    onClose?: () => void;
}

const NotificationToast: React.FC<ToastProps> = ({ message, duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(true);
    const [filteredNames, setFilteredNames] = useState('');
    const [userName, setUserName] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const { user } = useUserStore();

    useEffect(() => {
        const processMessage = async () => {
            try {
                console.log('Original message from server:', message);

                if (!user) {
                    console.log('No user logged in. Displaying original message.');
                    setMessageContent(message);
                    return;
                }

                const match = message.match(/^\[(.*?)\]\s+(\S+):\s*(.*)$/);
                if (!match) {
                    console.log('Message format does not match expected pattern. Displaying original message.');
                    setMessageContent(message);
                    return;
                }

                const [, namesPart, userId, content] = match;
                console.log('Parsed namesPart:', namesPart);
                console.log('Parsed userId:', userId);
                console.log('Parsed messageContent (before trimming):', content);

                const trimmedContent = content.replace(/,\s*방금$/, '');
                console.log('Parsed messageContent (after trimming):', trimmedContent);

                const filtered = namesPart
                    .split(',')
                    .map((name) => name.trim())
                    .filter((name) => name !== user.name)
                    .join(', ');
                setFilteredNames(filtered);
                console.log('Filtered names (excluding current user):', filtered);

                await fetchUserById(userId)
                    .then((res) => {
                        console.log('Fetched user data from userId:', res);
                        setUserName(res.name);
                        setProfileImage(res.file);
                    })
                    .catch((err) => {
                        console.error('Error fetching user by ID:', err);
                        setUserName(userId);
                        setProfileImage('');
                    });

                setMessageContent(trimmedContent);
            } catch (err) {
                console.error('Error processing message:', err);
                setMessageContent(message);
            }
        };

        processMessage();
    }, [message, user]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`fixed min-w-96 bottom-5 right-5 flex flex-col gap-2 p-4 rounded-xl shadow-lg bg-white text-black 
                        transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
            style={{ maxWidth: '400px' }}
        >
            <span className="text-sm font-bold">{`[${filteredNames}]`}</span>
    
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-300">
                    {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-300"></div>
                    )}
                </div>
    
                <div className="flex flex-col flex-1">
                    <span className="font-bold text-sm">{userName}</span>
                    <span className="text-sm">{messageContent}</span>
                </div>
    
                <span className="text-xs text-gray-500">{'방금'}</span>
            </div>
        </div>
    );
};

export default NotificationToast;