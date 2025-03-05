import React from 'react';

interface InputProps {
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    secureTextEntry?: boolean;
    style?: string;
    className?: string;
    type?: string;
    onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({ placeholder, onChange, value, secureTextEntry, style, className, type, onBlur }) => {
    return (
        <input
            type={type || (secureTextEntry ? 'password' : 'text')}
            className={`bg-gray-300 rounded-full py-2 px-4 my-1 w-3/4 ${style} ${className}`}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            onBlur={onBlur}
        />
    );
};

export default Input;