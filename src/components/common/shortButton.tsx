import React from 'react';

interface ShortButtonProps {
    text: string;
    onClick: () => void;
    style?: string;
}

const ShortButton: React.FC<ShortButtonProps> = ({ text, onClick, style }) => {
    return (
        <button className={`bg-red-500 rounded-full w-30 h-10 flex items-center justify-center ${style}`} onClick={onClick}>
            <span className="text-white text-center">{text}</span>
        </button>
    );
};

export default ShortButton;