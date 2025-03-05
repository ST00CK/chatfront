import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface PlusIconProps {
    onShowInput: () => void;
}

const PlusIcon: React.FC<PlusIconProps> = ({ onShowInput }) => {
    return (
        <button className="w-8 h-8 flex justify-center items-center ml-2" onClick={onShowInput}>
            <FontAwesomeIcon icon={faPlus} className="text-black" />
        </button>
    );
};

export default PlusIcon;