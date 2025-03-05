import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface SearchIconProps {
    onPress: () => void;
}

const SearchIcon: React.FC<SearchIconProps> = ({ onPress }) => {
    return (
        <button className="w-8 h-8 flex justify-center items-center ml-2" onClick={onPress}>
            <FontAwesomeIcon icon={faSearch} className="text-black" />
        </button>
    );
};

export default SearchIcon;