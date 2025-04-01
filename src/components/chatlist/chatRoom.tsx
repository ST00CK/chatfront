import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../utils/socket';

interface ChatRoomProps {
    name: string; // 채팅방 이름
    messages: {
        id: string;
        name: string;
        message: string;
        time: string;
        imageUrl: string;
        roomId: string;
        userId: string;
    }[];
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages }) => {
    const navigate = useNavigate();

    const handlePress = (name: string, roomId: string, userId: string) => {
        const socket = getSocket();
        socket.emit('joinRoom', { roomId });

        navigate('/chatroom', { state: { roomId, name, userId } });
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        const date = new Date(time);
        if (isNaN(date.getTime())) return '';

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

        return `${period} ${formattedHours}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto">
            {messages.map((msg) => {
                // 디버깅용 로그 추가
                console.log('ChatRoom message:', msg);

                return (
                    <div
                        key={msg.id}
                        className="flex items-center p-2 border-b border-gray-300 cursor-pointer"
                        onClick={() => handlePress(msg.name, msg.roomId, msg.userId)}
                    >
                        <img src={msg.imageUrl} alt="Profile" className="w-12 h-12 rounded-full" />
                        <div className="flex flex-col flex-1 ml-2">
                            <span className="font-bold">{msg.name}</span>
                            <span className="text-gray-600 truncate">{msg.message || '대화가 없습니다.'}</span>
                        </div>
                        <span className="text-gray-500 text-sm">{formatTime(msg.time)}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatRoom;