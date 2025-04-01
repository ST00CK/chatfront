import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

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
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isSettingVisible, setIsSettingVisible] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const roomId = location.state?.roomId;

    useEffect(() => {
        if (!roomId) {
            navigate('/chatlist');
        }
    }, [roomId, navigate]);

    useEffect(() => {
        const setupSocketAndFetchData = async () => {
            try {
                let socket;
                try {
                    socket = getSocket();
                } catch {
                    if (user?.userId) {
                        await initializeSocket(user.userId);
                        socket = getSocket();
                    }
                }

                if (socket) {
                    socket.emit('joinRoom', { roomId, userId: user?.userId });
                }

                socket?.on('newMessage', async (response: { message_id: string; room_id: string; user_id?: string; context: string; send_at: string }) => {
                    const isUserMessage = !response.user_id || response.user_id === user?.userId;
                    let sender = participants.find((p) => p.userId === response.user_id);

                    if (!sender && response.user_id) {
                        try {
                            const fetchedUser = await fetchUserById(response.user_id);
                            sender = {
                                userId: fetchedUser.userId,
                                name: fetchedUser.name,
                                profileImage: fetchedUser.file,
                                id: fetchedUser.id,
                                email: fetchedUser.email,
                                file: fetchedUser.file,
                            };
                        } catch (error) {
                            console.error('Error fetching user by ID:', error);
                        }
                    }

                    const newMessage: Message = {
                        id: Number(response.message_id) || Date.now(),
                        profileImage: isUserMessage ? user?.file || null : sender?.profileImage || null,
                        name: isUserMessage ? user?.name || '나' : sender?.name || '알 수 없음',
                        message: response.context,
                        time: response.send_at,
                        isUserMessage,
                        userId: response.user_id || user?.userId || '',
                    };

                    setMessages((prevMessages) => {
                        const isDuplicate = prevMessages.some((msg) => msg.id === newMessage.id && msg.message === newMessage.message);
                        if (isDuplicate) {
                            return prevMessages;
                        }

                        const updatedMessages = [...prevMessages, newMessage];
                        updatedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                        return updatedMessages;
                    });

                    setFilteredMessages((prevMessages) => {
                        const isDuplicate = prevMessages.some((msg) => msg.id === newMessage.id && msg.message === newMessage.message);
                        if (isDuplicate) {
                            return prevMessages;
                        }

                        const updatedMessages = [...prevMessages, newMessage];
                        updatedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                        return updatedMessages;
                    });

                    scrollToBottom();
                });

                await fetchChatRoomMembers();
                await fetchInitialChatRoomLog();
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

    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || !nextCursor) return;

        const { scrollTop } = messagesContainerRef.current;

        if (scrollTop === 0) {
            fetchOlderMessages();
        }
    }, [nextCursor]);

    useEffect(() => {
        const container = messagesContainerRef.current;

        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    const fetchChatRoomMembers = async () => {
        if (!roomId) throw new Error('Room ID is undefined');
        const response = await chatRoomMembersMutation.mutateAsync({ roomId });
        const userIds = response.userId || [];
        const users = await Promise.all(userIds.map(async (userId) => {
            const user = await fetchUserById(userId);
            return {
                ...user,
                profileImage: user.file,
                id: user.id,
                email: user.email,
                file: user.file,
            };
        }));
        setParticipants(users);
    };

    const fetchInitialChatRoomLog = async () => {
        if (!roomId) throw new Error('Room ID is undefined');
        const response = await chatRoomLogMutation.mutateAsync({ room_Id: roomId, limit: 20 });
        const { messages: fetchedMessages, nextCursor: fetchedNextCursor } = response;

        if (fetchedMessages && Array.isArray(fetchedMessages)) {
            const processedMessages = await processMessages(fetchedMessages);

            processedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            setMessages(processedMessages);
            setFilteredMessages(processedMessages);
            setNextCursor(fetchedNextCursor);

            scrollToBottom();
        } else {
            console.error('Fetched messages are not in the expected format:', fetchedMessages);
        }
    };

    const fetchOlderMessages = async () => {
        if (!roomId || !nextCursor) return;

        const response = await chatRoomLogMutation.mutateAsync({ room_Id: roomId, cursor: nextCursor, limit: 20 });
        const { messages: fetchedMessages, nextCursor: fetchedNextCursor } = response;

        if (fetchedMessages && Array.isArray(fetchedMessages)) {
            const processedMessages = await processMessages(fetchedMessages);

            setMessages((prevMessages) => {
                const combinedMessages = [...processedMessages, ...prevMessages];
                const uniqueMessages = combinedMessages.filter(
                    (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
                );

                uniqueMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                return uniqueMessages;
            });

            setFilteredMessages((prevMessages) => {
                const combinedMessages = [...processedMessages, ...prevMessages];
                const uniqueMessages = combinedMessages.filter(
                    (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
                );

                uniqueMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                return uniqueMessages;
            });

            setNextCursor(fetchedNextCursor);
        } else {
            console.error('Fetched messages are not in the expected format:', fetchedMessages);
        }
    };

    const processMessages = async (fetchedMessages: any[]): Promise<Message[]> => {
        return Promise.all(
            fetchedMessages.map(async (msg) => {
                let sender = participants.find((p) => p.userId === msg.user_id);

                if (!sender && msg.user_id) {
                    try {
                        const fetchedUser = await fetchUserById(msg.user_id);
                        sender = {
                            userId: fetchedUser.userId,
                            name: fetchedUser.name,
                            profileImage: fetchedUser.file,
                            id: fetchedUser.id,
                            email: fetchedUser.email,
                            file: fetchedUser.file,
                        };
                    } catch (error) {
                        console.error('Error fetching user by ID:', error);
                    }
                }

                return {
                    id: msg.message_id || Date.now(),
                    profileImage: sender?.profileImage || null,
                    name: sender?.name || '알 수 없음',
                    message: msg.context || '',
                    time: msg.send_at,
                    isUserMessage: msg.user_id === user?.userId,
                    userId: msg.user_id || '',
                };
            })
        );
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleShowInput = () => {
        setShowInput((prevShowInput) => !prevShowInput);
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

            socket.emit('sendMessage', payload);
        } catch (error) {
            console.error('Error sending message:', error);
        }
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

    const togglePanel = () => {
        setIsPanelVisible(!isPanelVisible);
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
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col"
            >
                {filteredMessages.map((msg, index) => {
                    const currentDate = new Date(msg.time).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });

                    const previousDate =
                        index > 0
                            ? new Date(filteredMessages[index - 1].time).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                              })
                            : null;

                    const isNewDate = currentDate !== previousDate;

                    return (
                        <React.Fragment key={msg.id || `message-${index}`}>
                            {isNewDate && (
                                <div className="flex items-center my-4">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="mx-4 text-gray-500 text-sm">{currentDate}</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>
                            )}
                            <Chat
                                profileImage={msg.profileImage}
                                name={msg.name}
                                message={msg.message}
                                time={msg.time}
                                isUserMessage={msg.isUserMessage}
                                showProfileImage={index === 0 || filteredMessages[index - 1]?.userId !== msg.userId}
                                showName={index === 0 || filteredMessages[index - 1]?.userId !== msg.userId}
                                showTime={
                                    index === filteredMessages.length - 1 ||
                                    new Date(filteredMessages[index + 1]?.time).getMinutes() !== new Date(msg.time).getMinutes()
                                }
                            />
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSend} />
            {isPanelVisible && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-end"
                    onClick={() => setIsPanelVisible(false)} // 공백 클릭 시 Panel 닫기
                >
                    <div
                        className="bg-white w-3/4 h-full p-4 border-l border-gray-300"
                        onClick={(e) => e.stopPropagation()} // Panel 내부 클릭 시 닫히지 않음
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold">Participants</span>
                            <button onClick={togglePanel} className="p-2">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {participants.map((participant, index) => (
                                <div key={index} className="flex items-center p-2">
                                    <img
                                        src={participant.profileImage || ''}
                                        alt={participant.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <span className="ml-2">{participant.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center p-4 border-t border-gray-300">
                            <button onClick={handleExit} className="p-2">
                                <ExitIcon />
                            </button>
                            <button onClick={handleSettingPress} className="p-2">
                                <SettingsIcon />
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