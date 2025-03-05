import React from 'react';

interface ShortButtonProps {
    text: string;
    onClick: () => void;
    style?: string;
    className?: string;
    disabled?: boolean;
}

const ShortButton: React.FC<ShortButtonProps> = ({ text, onClick, style, className, disabled }) => {
    return (
        <button
            className={`bg-red-500 rounded-full w-30 h-10 flex items-center justify-center ${style} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            <span className="text-white text-center">{text}</span>
        </button>
    );
};

export default ShortButton;