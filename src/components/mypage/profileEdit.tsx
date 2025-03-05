import React from 'react';

interface ProfileEditProps {
  user: {
    file: string;
    name: string;
    email: string;
  };
  newImage: string;
  isChanged: boolean;
  handleImageChange: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, newImage, isChanged, handleImageChange }) => {
  return (
    <div className="flex flex-col items-center p-4">
      {user && <img src={isChanged ? newImage : user.file} alt="Profile" className="w-24 h-24 rounded-full mb-4" />}
      <div className="text-center mb-4">
        {user && <p className="text-lg font-bold">{user.name}</p>}
        {user && <p className="text-gray-600">{user.email}</p>}
      </div>
      <button onClick={handleImageChange} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
        사진변경
      </button>
    </div>
  );
};

export default ProfileEdit;