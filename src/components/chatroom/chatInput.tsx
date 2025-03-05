import React, { useState } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <div className="flex items-center p-2 border-t border-gray-300">
            <input
                type="text"
                className="flex-1 h-10 border border-gray-300 rounded-full px-4 mr-2"
                placeholder="Send a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button className="w-10 h-10 rounded-full bg-blue-500 flex justify-center items-center" onClick={handleSend}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3v7l15 2-15 2z" />
                </svg>
            </button>
        </div>
    );
};

export default ChatInput;