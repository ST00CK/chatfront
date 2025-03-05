import React from 'react';

interface InputProps {
    placeholder: string;
    onChange: (text: string) => void;
    value: string;
    secureTextEntry?: boolean;
    style?: string;
}

const Input: React.FC<InputProps> = ({ placeholder, onChange, value, secureTextEntry, style }) => {
    return (
        <input
            type={secureTextEntry ? 'password' : 'text'}
            className={`bg-gray-300 rounded-full py-2 px-4 my-1 w-3/4 ${style}`}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            value={value}
        />
    );
};

export default Input;