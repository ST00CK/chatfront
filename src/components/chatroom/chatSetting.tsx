import React, { useEffect, useState } from 'react';
import { useChatRoomUpdateMutation } from '../../query/chatQuery';

interface ChatSettingProps {
    isVisible: boolean;
    onClose: () => void;
    roomId: string;
    roomName: string;
    participants: { name: string; profileImage: string }[];
    onRoomNameUpdate: (newName: string) => void;
    handleExit: () => void;
}

const ChatSetting: React.FC<ChatSettingProps> = ({ isVisible, onClose, roomId, roomName, participants, onRoomNameUpdate, handleExit }) => {
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
            updateRoomMutation.mutate({ roomId, roomName: newRoomName }, {
                onSuccess: () => {
                    setIsModified(false);
                    onRoomNameUpdate(newRoomName);
                },
            });
        }
    };

    const handleExitAndClose = () => {
        handleExit();
        onClose();
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ${isVisible ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">채팅방 설정</h2>
                    <button onClick={onClose}>
                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mb-4">
                    <div className="flex justify-center mb-4">
                        <div className="grid grid-cols-2 gap-2">
                            {participants.slice(0, 4).map((participant, index) => (
                                <img key={index} src={participant.profileImage} alt={participant.name} className="w-12 h-12 rounded-full" />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">채팅방 이름</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                            value={newRoomName}
                            onChange={(e) => handleRoomNameChange(e.target.value)}
                        />
                        <button
                            className={`w-full py-2 rounded-lg text-white ${isModified ? 'bg-blue-500' : 'bg-gray-300'}`}
                            onClick={handleSave}
                            disabled={!isModified}
                        >
                            확인
                        </button>
                    </div>
                </div>
                <button className="w-full py-2 rounded-lg bg-red-500 text-white" onClick={handleExitAndClose}>
                    채팅방 나가기
                </button>
            </div>
        </div>
    );
};

export default ChatSetting;