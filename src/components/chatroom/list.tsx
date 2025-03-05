import React from 'react';

interface ListIconProps {
    onPress: () => void;
}

const ListIcon: React.FC<ListIconProps> = ({ onPress }) => {
    return (
        <button onClick={onPress} className="p-2">
            <div className="w-5 h-0.5 bg-black my-0.5"></div>
            <div className="w-5 h-0.5 bg-black my-0.5"></div>
            <div className="w-5 h-0.5 bg-black my-0.5"></div>
        </button>
    );
};

export default ListIcon;