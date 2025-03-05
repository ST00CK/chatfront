import React from 'react';

interface ChatProps {
    profileImage: string;
    name: string;
    message: string;
    time: string;
    isUserMessage?: boolean;
    showProfileImage: boolean;
    showName: boolean;
    showTime: boolean;
}

const Chat: React.FC<ChatProps> = ({ profileImage, name, message, time, isUserMessage, showProfileImage, showName, showTime }) => {
    const formattedTime = new Date(time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-2`}>
            {!isUserMessage && showProfileImage && (
                <div className="w-10 h-10 flex justify-center items-center">
                    <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full" />
                </div>
            )}
            <div className={`max-w-4/5 ${isUserMessage ? 'text-right' : 'text-left'} ml-2`}>
                {showName && !isUserMessage && <span className="font-bold">{name}</span>}
                <div className="flex items-center">
                    {isUserMessage && showTime && <span className="text-gray-500 text-xs mr-2">{formattedTime}</span>}
                    <div className={`bg-purple-100 border border-purple-100 rounded-lg px-3 py-2 mb-1 ${isUserMessage ? 'self-end' : 'self-start'}`}>
                        <span className="text-purple-900">{message}</span>
                    </div>
                    {!isUserMessage && showTime && <span className="text-gray-500 text-xs ml-2">{formattedTime}</span>}
                </div>
            </div>
        </div>
    );
};

export default Chat;