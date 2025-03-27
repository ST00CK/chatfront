import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';

interface ExitIconProps {
    className?: string;
}

const ExitIcon: React.FC<ExitIconProps> = ({ className }) => {
    return (
        <svg
            className={`w-6 h-6 text-red-500 ${className}`}
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <LogoutIcon/>
        </svg>
    );
};

export default ExitIcon;