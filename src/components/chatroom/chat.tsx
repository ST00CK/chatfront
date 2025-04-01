import React from 'react';

interface ChatProps {
    profileImage: string | null;
    name: string;
    message: string;
    time: string; // ISO 8601 형식의 time 값
    isUserMessage?: boolean;
    showProfileImage: boolean;
    showName: boolean;
    showTime: boolean;
}

const Chat: React.FC<ChatProps> = ({ profileImage, name, message, time, isUserMessage, showProfileImage, showName, showTime }) => {
    // 시간 변환 함수
    const formatTime = (time: string) => {
        const date = new Date(time);
        if (isNaN(date.getTime())) {
            console.error('Invalid time value in Chat component:', time);
            return 'Invalid Date';
        }

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

        return `${period} ${formattedHours}시 ${minutes.toString().padStart(2, '0')}분`;
    };

    const formattedTime = formatTime(time);

    return (
        <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-2`}>
            {/* 프로필 이미지가 있는 경우 */}
            {!isUserMessage && showProfileImage && (
                <div className="w-10 h-10 flex justify-center items-center">
                    <img src={profileImage || '/default-profile.png'} alt="Profile" className="w-10 h-10 rounded-full" />
                </div>
            )}
            {/* 프로필 이미지가 없는 경우에도 동일한 여백 유지 */}
            {!isUserMessage && !showProfileImage && <div className="w-10 h-10"></div>}
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