import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Chat from '../components/chatroom/chat';
import ChatInput from '../components/chatroom/chatInput';
import SearchIcon from '../components/common/searchIcon';
import ListIcon from '../components/chatroom/list';
import Profile from '../components/common/profile';
import ExitIcon from '../components/chatroom/exitIcon';
import ChatSetting from '../components/chatroom/chatSetting';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { useDeleteRoomMutation, useChatRoomLogMutation, useChatRoomMembersMutation } from '../query/chatQuery';
import { useUserStore } from '../store/useUserStore';
import { fetchUserById, User } from '../query/userQuery';

const ChatRoomPage = () => {
    const { name, roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();

    const chatRoomMembersMutation = useChatRoomMembersMutation();
    const chatRoomLogMutation = useChatRoomLogMutation();
    const [participants, setParticipants] = useState<User[]>([]);
    interface Message {
        id: number;
        profileImage: string;
        name: string;
        message: string;
        time: string;
        isUserMessage: boolean;
        userId: string;
    }
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState(messages);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isSettingVisible, setIsSettingVisible] = useState(false);
    const [roomName, setRoomName] = useState(name);
    const slideAnim = useRef(0);
    const panelAnim = useRef(0);
    const overlayOpacity = useRef(0);

    const deleteRoomMutation = useDeleteRoomMutation();

    useEffect(() => {
        const fetchChatRoomMembers = async () => {
            try {
                if (!roomId) {
                    throw new Error('Room ID is undefined');
                }
                const response = await chatRoomMembersMutation.mutateAsync({ roomId });
                console.log(`Room ID: ${roomId}, Members:`, response.userId);
                const userIds = response.userId || [];
                const users = await Promise.all(userIds.map(async (userId) => {
                    const user = await fetchUserById(userId);
                    console.log('Fetched user:', user); // 사용자 정보를 콘솔에 출력하여 확인
                    return {
                        ...user,
                        profileImage: user.file, // file 필드를 profileImage로 매핑
                    };
                }));
                setParticipants(users);
            } catch (error) {
                console.error('Error fetching chat room members:', error);
            }
        };

        const fetchChatRoomLog = async () => {
            try {
                if (!roomId) {
                    throw new Error('Room ID is undefined');
                }
                const response = await chatRoomLogMutation.mutateAsync({ room_Id: roomId });
                console.log('Chat room log response:', response);
                interface ChatMessage {
                    id: number;
                    profileImage: string;
                    name: string;
                    message: string;
                    time: string;
                    isUserMessage: boolean;
                    userId: string;
                }

                const messages: Message[] = Array.isArray(response) ? response.map((msg: ChatMessage) => ({
                    id: msg.id,
                    profileImage: msg.profileImage,
                    name: msg.name,
                    message: msg.message,
                    time: msg.time,
                    isUserMessage: msg.isUserMessage,
                    userId: msg.userId,
                })) : [];
                setMessages(messages);
                setFilteredMessages(messages);
            } catch (error) {
                console.error('Error fetching chat room log:', error);
            }
        };

        fetchChatRoomMembers();
        fetchChatRoomLog();
    }, [roomId]);

    const handleShowInput = () => {
        setShowInput(prevShowInput => !prevShowInput);
        slideAnim.current = showInput ? 0 : 1;
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
        const filtered = messages.filter(msg =>
            msg.message.toLowerCase().includes(text.toLowerCase()) ||
            msg.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredMessages(filtered);
    };

    const handleSend = (message: string) => {
        const newMessage = {
            id: messages.length + 1,
            profileImage: '',
            name: 'You',
            message: message,
            time: new Date().toISOString(),
            isUserMessage: true,
            userId: user?.userId || '',
        };
        setMessages([...messages, newMessage]);
        setFilteredMessages([...messages, newMessage]);
    };

    const togglePanel = () => {
        setIsPanelVisible(!isPanelVisible);
        panelAnim.current = isPanelVisible ? 0 : 1;
        overlayOpacity.current = isPanelVisible ? 0 : 1;
    };

    const handleExit = () => {
        if (user?.userId && roomId) {
            setIsPanelVisible(false);
            deleteRoomMutation.mutate({ roomId, userId: user.userId }, {
                onSuccess: () => {
                    navigate('/chatlist', { state: { refresh: true } });
                },
            });
        } else {
            alert("유효하지 않은 사용자 또는 채팅방 ID입니다.");
        }
    };

    const handleSettingPress = () => {
        setIsPanelVisible(false);
        setIsSettingVisible(true);
    };

    const handleSettingClose = () => {
        setIsSettingVisible(false);
    };

    const handleRoomNameUpdate = (newName: string) => {
        setRoomName(newName);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
                {!showInput ? (
                    <>
                        <span className="text-xl font-bold">{roomName}</span>
                        <div className="flex">
                            <SearchIcon onPress={handleShowInput} />
                            <ListIcon onPress={togglePanel} />
                        </div>
                    </>
                ) : (
                    <div className="flex-1">
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded"
                            value={inputValue}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Search"
                        />
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {filteredMessages.map((msg, index) => {
                    const showProfileImage = index === 0 || filteredMessages[index - 1].userId !== msg.userId;
                    const showName = index === 0 || filteredMessages[index - 1].userId !== msg.userId;
                    const showTime = index === filteredMessages.length - 1 || new Date(filteredMessages[index + 1].time).getMinutes() !== new Date(msg.time).getMinutes();
                    return (
                        <Chat
                            key={msg.id}
                            profileImage={msg.profileImage}
                            name={msg.name}
                            message={msg.message}
                            time={msg.time}
                            isUserMessage={msg.isUserMessage}
                            showProfileImage={showProfileImage}
                            showName={showName}
                            showTime={showTime}
                        />
                    );
                })}
            </div>
            <ChatInput onSend={handleSend} />
            {isPanelVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
                    <div className="bg-white w-3/4 h-full p-4 border-l border-gray-300">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold">Participants</span>
                            <button onClick={togglePanel} className="p-2">
                                <FontAwesomeIcon icon={faCog} size="lg" color="black" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {participants.map((participant, index) => (
                                <Profile
                                    key={index}
                                    name={participant.name}
                                    imageUrl={participant.profileImage}
                                    imageSize={40}
                                    textSize={14}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center p-4 border-t border-gray-300">
                            <ExitIcon onPress={handleExit} />
                            <button onClick={handleSettingPress} className="p-2">
                                <FontAwesomeIcon icon={faCog} size="lg" color="black" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ChatSetting
                isVisible={isSettingVisible}
                onClose={handleSettingClose}
                roomId={roomId || ''}
                roomName={roomName || ''}
                participants={participants.map(participant => ({
                    name: participant.name,
                    profileImage: participant.profileImage,
                }))}
                onRoomNameUpdate={handleRoomNameUpdate}
                handleExit={handleExit}
            />
        </div>
    );
};

export default ChatRoomPage;