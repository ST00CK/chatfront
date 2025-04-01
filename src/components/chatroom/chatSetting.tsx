import React, { useEffect, useState } from 'react';
import { useChatRoomUpdateMutation } from '../../query/chatQuery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface ChatSettingProps {
    isVisible: boolean;
    onClose: () => void;
    roomId: string;
    roomName: string;
    participants: { name: string; profileImage: string }[];
    onRoomNameUpdate: (newName: string) => void;
    handleExit: () => void;
}

const ChatSetting: React.FC<ChatSettingProps> = ({
    isVisible,
    onClose,
    roomId,
    roomName,
    participants,
    onRoomNameUpdate,
    handleExit,
}) => {
    const [newRoomName, setNewRoomName] = useState(roomName);
    const [isModified, setIsModified] = useState(false);
    const updateRoomMutation = useChatRoomUpdateMutation();

    useEffect(() => {
        setNewRoomName(roomName);
        setIsModified(false);
    }, [roomName]);

    const handleRoomNameChange = (text: string) => {
        setNewRoomName(text);
        setIsModified(text !== roomName);
    };

    const handleSave = () => {
        if (isModified) {
            updateRoomMutation.mutate(
                { roomId, roomName: newRoomName },
                {
                    onSuccess: () => {
                        setIsModified(false);
                        onRoomNameUpdate(newRoomName);
                    },
                }
            );
        }
    };

    const handleExitAndClose = () => {
        handleExit();
        onClose();
    };

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ${
                isVisible ? 'block' : 'hidden'
            }`}
        >
            <div className="bg-white w-full h-full p-6 relative">
                {/* 닫기 버튼 */}
                <button
                    className="absolute top-4 right-4 p-2"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>
                {/* 왼쪽 위 화살표
                <button
                    className="absolute top-4 left-4 p-2"
                    onClick={onClose}
                >
                    <svg
                        className="w-6 h-6 text-black"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                </button> */}
                <div className="flex flex-col h-full">
                    <h2 className="text-lg font-bold mb-4">채팅방 설정</h2>
                    <div className="flex justify-center mb-4">
                        <div className="grid grid-cols-2 gap-2">
                            {participants.slice(0, 4).map((participant, index) => (
                                <img
                                    key={index}
                                    src={participant.profileImage}
                                    alt={participant.name}
                                    className="w-12 h-12 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                            채팅방 이름
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                            value={newRoomName}
                            onChange={(e) =>
                                handleRoomNameChange(e.target.value)
                            }
                        />
                        <button
                            className={`w-full py-2 rounded-lg text-white ${
                                isModified ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            onClick={handleSave}
                            disabled={!isModified}
                        >
                            확인
                        </button>
                    </div>
                    <button
                        className="w-full py-2 rounded-lg bg-red-500 text-white mt-4"
                        onClick={handleExitAndClose}
                    >
                        채팅방 나가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatSetting;