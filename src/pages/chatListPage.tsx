import { useState, useRef, useEffect } from 'react';
import ChatRoom from '../components/chatlist/chatRoom';
import ChatLogo from '../components/chatlist/chatLogo';
import SearchIcon from '../components/common/searchIcon';
import PlusIcon from '../components/common/plusIcon';
import BottomTab from '../components/common/bottomTab';
import ShortButton from '../components/common/shortButton';
import { useNavigate } from 'react-router-dom';
import { useChatRoomListMutation, useChatRoomLogMutation, useChatRoomMembersMutation } from '../query/chatQuery';
import { useUserStore } from '../store/useUserStore';

const ChatListPage = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const chatRoomListMutation = useChatRoomListMutation();
    const chatRoomMembersMutation = useChatRoomMembersMutation();
    const chatRoomLogMutation = useChatRoomLogMutation();
    const [messages, setMessages] = useState<{ id: number; name: string; message: string; time: string; imageUrl: string; roomId: string; userId: string; }[]>([]);
    const [filteredMessages, setFilteredMessages] = useState(messages);
    const slideAnim = useRef(0);
    const [refreshFlag, setRefreshFlag] = useState(0);

    //채팅방 조회
    useEffect(() => {
        const fetchChatRoomMembers = async (roomId: string) => {
            try {
                const response = await chatRoomMembersMutation.mutateAsync({ roomId });
                console.log(`Room ID: ${roomId}, Members:`, response.userId);
            } catch (error) {
                console.error('Error fetching chat room members:', error);
            }
        };

        const fetchChatList = async () => {
            if (!user?.userId) return;

            try {
                const response = await chatRoomListMutation.mutateAsync({ userId: user.userId });
                console.log('Chat list response:', response);

                const updatedMessages = response.map((room: { id: string; name: string }) => {
                    const roomMembers = room.name.split(',').filter((name: string) => name !== user.name);
                    const roomName = roomMembers.join(',');

                    return {
                        id: Number(room.id),
                        name: roomName,
                        message: '',
                        time: '',
                        imageUrl: 'https://placehold.co/50',
                        roomId: room.id,
                        userId: user.userId,
                    };
                });

                setMessages(updatedMessages);
                setFilteredMessages(updatedMessages);

                updatedMessages.forEach((room: { roomId: string }) => fetchChatRoomMembers(room.roomId));
            } catch (error) {
                console.error('Error fetching chat list:', error);
            }
        };

        fetchChatList();
    }, [user, refreshFlag]);

    const handleShowInput = () => {
        setShowInput(prevShowInput => !prevShowInput);
        slideAnim.current = showInput ? 0 : 1;
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
        const filtered = messages.filter(msg =>
            msg.name.toLowerCase().includes(text.toLowerCase()) ||
            msg.message.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredMessages(filtered);
    };

    const navigateToChatAddPage = () => {
        navigate('/chataddpage');
        setRefreshFlag(prevFlag => prevFlag + 1); // 새로고침 플래그 업데이트
    };

    //채팅방 로그 조회(작동)
    const handleChatRoomLog = async () => {
        try {
            await chatRoomLogMutation.mutateAsync({
                room_Id: "9458fa1d-e5bd-4fe3-9844-6d348a6c3d85",
            });
        } catch {
            alert("로그 조회 오류")
        }
    }

    return (
        <main className="flex flex-col h-full">
            <div className="flex flex-col flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <ChatLogo />
                    <div className="flex">
                        <PlusIcon onShowInput={navigateToChatAddPage} />
                        <SearchIcon onPress={handleShowInput} />
                    </div>
                </div>
                {showInput && (
                    <div className="mb-4">
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded"
                            value={inputValue}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Search Chat Room"
                        />
                    </div>
                )}
                <div className="flex-1 overflow-y-auto">
                    <ChatRoom name="Chat Room" messages={filteredMessages} />
                </div>
                <ShortButton
                    text="채팅방 로그"
                    onClick={handleChatRoomLog}
                />
            </div>
            <BottomTab currentPage="ChatListPage" />
        </main>
    );
};

export default ChatListPage;