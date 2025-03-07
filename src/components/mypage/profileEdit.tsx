import React from 'react';

interface ProfileEditProps {
  user: {
    file: string;
    name: string;
    email: string;
  };
  newImage: string;
  isChanged: boolean;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, newImage, isChanged, handleImageChange }) => {
  return (
    <div className="flex items-center pr-4 py-4">
      {user && <img src={isChanged ? newImage : user.file} alt="Profile" className="w-[50px] h-[50px] rounded-full mr-4" />}
      <div className='flex justify-between w-full'>
        <div className="flex flex-col mr-4">
          {user && <p className="text-base font-bold">{user.name}</p>}
          {user && <p className="text-gray-600 text-sm">{user.email}</p>}
        </div>
        <button onClick={() => document.getElementById('fileInput')?.click()} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          사진변경
        </button>
      </div>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileEdit;