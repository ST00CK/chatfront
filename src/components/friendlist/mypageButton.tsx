import React from 'react';

interface MyPageButtonProps {
    onPress: () => void;
}

const MyPageButton: React.FC<MyPageButtonProps> = ({ onPress }) => {
    return (
        <button onClick={onPress} className="absolute top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg">
            My Page
        </button>
    );
};

export default MyPageButton;