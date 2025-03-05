import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ChatRoomProps {
    name: string;
    messages: { id: number; name: string; message: string; time: string; imageUrl: string; roomId: string; userId: string }[];
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages }) => {
    const navigate = useNavigate();

    const handlePress = (name: string, roomId: string, userId: string) => {
        navigate(`/chatroom/${roomId}`, { state: { name, userId } });
        console.log(`Navigating to ChatRoomPage with name: ${name}, roomId: ${roomId}, userId: ${userId}`);
    };

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto">
            {messages.map((msg) => (
                <div key={msg.id} className="flex items-center p-2 border-b border-gray-300 cursor-pointer" onClick={() => handlePress(msg.name, msg.roomId, msg.userId)}>
                    <img src={msg.imageUrl} alt="Profile" className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col flex-1 ml-2">
                        <span className="font-bold">{msg.name}</span>
                        <span className="text-gray-600">{msg.message}</span>
                    </div>
                    <span className="text-gray-500">{msg.time}</span>
                </div>
            ))}
        </div>
    );
};

export default ChatRoom;