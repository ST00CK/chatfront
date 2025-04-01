import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../utils/socket';
import { fetchUserById } from '../../query/userQuery';
import { useChatRoomMembersMutation } from '../../query/chatQuery';
import { useUserStore } from '../../store/useUserStore'; // 현재 사용자 정보 가져오기

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
    const chatRoomMembersMutation = useChatRoomMembersMutation();
    const { user } = useUserStore(); // 현재 사용자 정보 가져오기
    const [roomParticipants, setRoomParticipants] = useState<{ file: string; userId: string }[]>([]);

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

    const fetchRoomParticipants = async (roomId: string) => {
        try {
            // 채팅방 참여자 ID 가져오기
            const response = await chatRoomMembersMutation.mutateAsync({ roomId });
            console.log(`Room ID: ${roomId}, Members:`, response.userId);

            // 참여자들의 프로필 이미지 가져오기
            const participants = await Promise.all(
                response.userId.map(async (userId) => {
                    const user = await fetchUserById(userId);
                    return { file: user.file, userId: userId };
                })
            );

            console.log(`Room ID: ${roomId}, Participants:`, participants);
            setRoomParticipants(participants);
        } catch (error) {
            console.error('Error fetching room participants:', error);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            // 첫 번째 메시지의 roomId를 사용하여 참여자 정보 가져오기
            fetchRoomParticipants(messages[0].roomId);
        }
    }, [messages]);

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto">
            {messages.map((msg) => {
                return (
                    <div
                        key={msg.id}
                        className="flex items-center p-2 border-b border-gray-300 cursor-pointer"
                        onClick={() => handlePress(msg.name, msg.roomId, msg.userId)}
                    >
                        {/* 프로필 이미지 표시 */}
                        <div className="relative w-12 h-12">
                            {roomParticipants.length === 2
                                ? roomParticipants
                                      .filter((participant) => participant.userId !== user?.userId) // 현재 사용자를 제외
                                      .map((participant, index) => (
                                          <img
                                              key={index}
                                              src={participant.file}
                                              alt="Profile"
                                              className="absolute w-12 h-12 rounded-full top-0 left-0"
                                          />
                                      ))
                                : roomParticipants.slice(0, 4).map((participant, index) => (
                                      <img
                                          key={index}
                                          src={participant.file}
                                          alt="Profile"
                                          className={`absolute w-6 h-6 rounded-full ${
                                              index === 0
                                                  ? 'top-0 left-0'
                                                  : index === 1
                                                  ? 'top-0 right-0'
                                                  : index === 2
                                                  ? 'bottom-0 left-0'
                                                  : 'bottom-0 right-0'
                                          }`}
                                      />
                                  ))}
                        </div>
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