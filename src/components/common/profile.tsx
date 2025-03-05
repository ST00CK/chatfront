import React from 'react';

interface ProfileProps {
    imageUrl: string;
    name: string;
    imageSize?: number;
    textSize?: number;
    style?: string;
    onPress?: () => void;
    showCheck?: boolean;
    isChecked?: boolean;
    onCheck?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ imageUrl, name, imageSize = 50, textSize = 18, style, onPress, showCheck = false, isChecked = false, onCheck }) => {
    const handlePress = () => {
        if (showCheck && onCheck) {
            onCheck();
        }
        if (onPress) {
            onPress();
        }
    };

    return (
        <div className={`flex items-center p-2 ${style}`} onClick={handlePress}>
            <img src={imageUrl} alt={name} className={`mr-2 rounded-full`} style={{ width: imageSize, height: imageSize }} />
            <span className={`flex-1`} style={{ fontSize: textSize }}>{name}</span>
            {showCheck && (
                <div className={`w-6 h-6 rounded-full border border-gray-300 flex justify-center items-center ${isChecked ? 'bg-purple-500 border-purple-500' : ''}`}>
                    {isChecked && <span className="text-white text-sm">✓</span>}
                </div>
            )}
        </div>
    );
};

export default Profile;