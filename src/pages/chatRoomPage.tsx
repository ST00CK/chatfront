import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSocket, initializeSocket } from '../utils/socket';
import { useUserStore } from '../store/useUserStore';
import { useChatRoomMembersMutation, useChatRoomLogMutation, useDeleteRoomMutation } from '../query/chatQuery';
import Chat from '../components/chatroom/chat';
import ChatInput from '../components/chatroom/chatInput';
import SearchIcon from '../components/common/searchIcon';
import ListIcon from '../components/chatroom/list';
import ExitIcon from '../components/chatroom/exitIcon';
import ChatSetting from '../components/chatroom/chatSetting';
import { fetchUserById, User } from '../query/userQuery';

interface Message {
    id: number;
    profileImage: string | null;
    name: string;
    message: string;
    time: string;
    isUserMessage: boolean;
    userId: string;
}

const ChatRoomPage = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUserStore();

    const chatRoomMembersMutation = useChatRoomMembersMutation();
    const chatRoomLogMutation = useChatRoomLogMutation();
    const deleteRoomMutation = useDeleteRoomMutation();

    const [participants, setParticipants] = useState<User[]>([]);
    const [roomName, setRoomName] = useState(location.state?.name || '');
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isSettingVisible, setIsSettingVisible] = useState(false);
    const slideAnim = useRef(0);
    const panelAnim = useRef(0);
    const overlayOpacity = useRef(0);

    useEffect(() => {
        const setupSocketAndFetchData = async () => {
            try {
                let socket;
                try {
                    socket = getSocket(); // 소켓 가져오기
                } catch {
                    console.warn('Socket not initialized. Retrying initialization...');
                    if (user?.userId) {
                        await initializeSocket(user.userId); // 소켓 초기화 재시도
                        socket = getSocket(); // 다시 소켓 가져오기
                    }
                }

                // 방 입장
                if (socket) {
                    socket.emit('joinRoom', { roomId, userId: user?.userId });
                } else {
                    console.error('Socket is undefined. Unable to join room.');
                }

                // 메시지 수신 이벤트
                socket?.on('newMessage', async (response: { messageId: string; roomId: string; userId?: string; context: string }) => {
                    console.log('New message received from server:', response); // 수신된 메시지 디버깅
                
                    const isUserMessage = !response.userId || response.userId === user?.userId; // userId가 없거나 현재 사용자와 동일한 경우
                    let sender = participants.find((p) => p.userId === response.userId);
                
                    // sender가 없으면 fetchUserById를 사용하여 사용자 정보 가져오기
                    if (!sender && response.userId) {
                        try {
                            const fetchedUser = await fetchUserById(response.userId);
                            sender = {
                                userId: fetchedUser.userId,
                                name: fetchedUser.name,
                                profileImage: fetchedUser.file,
                            };
                            setParticipants((prev) => [...prev, sender]); // participants에 추가
                        } catch (error) {
                            console.error('Error fetching user by ID:', error);
                        }
                    }
                
                    const newMessage: Message = {
                        id: Number(response.messageId) || Date.now(), // 메시지 ID가 없으면 현재 시간을 사용
                        profileImage: isUserMessage ? user?.file || null : sender?.profileImage || null,
                        name: isUserMessage ? user?.name || '나' : sender?.name || '알 수 없음',
                        message: response.context,
                        time: new Date().toISOString(),
                        isUserMessage,
                        userId: response.userId || user?.userId || '', // userId가 없으면 현재 사용자 ID 사용
                    };
                
                    setMessages((prevMessages) => {
                        // 중복 메시지 필터링
                        if (prevMessages.some((msg) => msg.id === newMessage.id)) {
                            console.log('Duplicate message detected, skipping:', newMessage);
                            return prevMessages;
                        }
                
                        const updatedMessages = [...prevMessages, newMessage];
                        console.log('Messages after receiving new message:', updatedMessages); // 메시지 상태 디버깅
                        return updatedMessages;
                    });
                
                    setFilteredMessages((prevMessages) => {
                        if (prevMessages.some((msg) => msg.id === newMessage.id)) {
                            return prevMessages;
                        }
                        return [...prevMessages, newMessage];
                    });
                });

                // 채팅방 멤버 가져오기
                const fetchChatRoomMembers = async () => {
                    if (!roomId) throw new Error('Room ID is undefined');
                    const response = await chatRoomMembersMutation.mutateAsync({ roomId });
                    const userIds = response.userId || [];
                    const users = await Promise.all(userIds.map(async (userId) => {
                        const user = await fetchUserById(userId);
                        return {
                            ...user,
                            profileImage: user.file,
                        };
                    }));
                    setParticipants(users);
                    console.log('Chat Room Participants:', users);
                };

                // 채팅 로그 가져오기
                const fetchChatRoomLog = async () => {
                    if (!roomId) throw new Error('Room ID is undefined');
                    const response = await chatRoomLogMutation.mutateAsync({ room_Id: roomId });
                
                    console.log('Raw Chat Log Response:', response); // 디버깅용 로그
                
                    const messages: Message[] = Array.isArray(response)
                        ? await Promise.all(
                              response.map(async (msg: any) => {
                                  let sender = participants.find((p) => p.userId === msg.user_id);
                
                                  // sender가 없으면 fetchUserById를 사용하여 사용자 정보 가져오기
                                  if (!sender && msg.user_id) {
                                      try {
                                          const fetchedUser = await fetchUserById(msg.user_id);
                                          sender = {
                                              userId: fetchedUser.userId,
                                              name: fetchedUser.name,
                                              profileImage: fetchedUser.file,
                                          };
                                          setParticipants((prev) => [...prev, sender]); // participants에 추가
                                      } catch (error) {
                                          console.error('Error fetching user by ID:', error);
                                      }
                                  }
                
                                  return {
                                      id: msg.message_id || Date.now(), // 메시지 ID가 없으면 현재 시간을 사용
                                      profileImage: sender?.profileImage || null, // 프로필 이미지
                                      name: sender?.name || '알 수 없음', // 사용자 이름
                                      message: msg.context || '', // 메시지 내용
                                      time: msg.send_at || new Date().toISOString(), // 전송 시간
                                      isUserMessage: msg.user_id === user?.userId, // 현재 사용자가 보낸 메시지 여부
                                      userId: msg.user_id || '', // 사용자 ID
                                  };
                              })
                          )
                        : [];
                
                    console.log('Processed Chat Messages:', messages); // 디버깅용 로그
                
                    setMessages(messages);
                    setFilteredMessages(messages);
                };

                await fetchChatRoomMembers();
                await fetchChatRoomLog();
            } catch (error) {
                console.error('Error setting up socket or fetching data:', error);
            }
        };

        setupSocketAndFetchData();

        return () => {
            try {
                const socket = getSocket();
                socket.emit('leaveRoom', { roomId });
                socket.off('newMessage');
            } catch (error) {
                console.error('Error during socket cleanup:', error);
            }
        };
    }, [roomId, user?.userId]);

    const handleShowInput = () => {
        setShowInput((prevShowInput) => !prevShowInput);
        slideAnim.current = showInput ? 0 : 1;
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
        const filtered = messages.filter((msg) =>
            msg.message.toLowerCase().includes(text.toLowerCase()) ||
            msg.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredMessages(filtered);
    };

    const handleSend = (message: string) => {
        try {
            const socket = getSocket();
    
            const payload = {
                roomId,
                userId: user?.userId,
                context: message,
            };
    
            socket.emit('sendMessage', payload); // 메시지 전송
            console.log('Message sent:', payload); // 전송된 메시지 디버깅
        } catch (error) {
            console.error('Error sending message:', error);
        }
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
            alert('유효하지 않은 사용자 또는 채팅방 ID입니다.');
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
        <main className="flex flex-col h-full">
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
                {filteredMessages.map((msg, index) => (
                    <Chat
                        key={msg.id || `message-${index}`} // msg.id가 유효하지 않으면 index 사용
                        profileImage={msg.profileImage}
                        name={msg.name}
                        message={msg.message}
                        time={msg.time}
                        isUserMessage={msg.isUserMessage}
                        showProfileImage={index === 0 || filteredMessages[index - 1]?.userId !== msg.userId}
                        showName={index === 0 || filteredMessages[index - 1]?.userId !== msg.userId}
                        showTime={index === filteredMessages.length - 1 || new Date(filteredMessages[index + 1]?.time).getMinutes() !== new Date(msg.time).getMinutes()}
                    />
                ))}
            </div>
            <ChatInput onSend={handleSend} />
            {isPanelVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
                    <div className="bg-white w-3/4 h-full p-4 border-l border-gray-300">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold">Participants</span>
                            <button onClick={togglePanel} className="p-2">
                                <ExitIcon onPress={togglePanel} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {participants.map((participant, index) => (
                                <div key={index} className="flex items-center p-2">
                                    <img src={participant.profileImage || ''} alt={participant.name} className="w-10 h-10 rounded-full" />
                                    <span className="ml-2">{participant.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center p-4 border-t border-gray-300">
                            <ExitIcon onPress={handleExit} />
                            <button onClick={handleSettingPress} className="p-2">
                                설정
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
                participants={participants.map((participant) => ({
                    name: participant.name,
                    profileImage: participant.profileImage,
                }))}
                onRoomNameUpdate={handleRoomNameUpdate}
                handleExit={handleExit}
            />
        </main>
    );
};

export default ChatRoomPage;