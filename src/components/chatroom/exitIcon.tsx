import React from 'react';

interface ExitIconProps {
    onPress: () => void;
}

const ExitIcon: React.FC<ExitIconProps> = ({ onPress }) => {
    return (
        <button className="flex justify-center items-center p-2" onClick={onPress}>
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 9V5a1 1 0 011-1h8a1 1 0 011 1v14a1 1 0 01-1 1h-8a1 1 0 01-1-1v-4H5v4a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h1a1 1 0 011 1v4h5z" />
            </svg>
        </button>
    );
};

export default ExitIcon;