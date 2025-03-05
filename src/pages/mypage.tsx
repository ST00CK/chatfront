import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useProfileImageMutation, useLogInChangePassWordMutation } from '../query/userQuery';
import ProfileEdit from '../components/mypage/profileEdit';

const MyPage = () => {
  const { user, updateUser } = useUserStore();
  const [newImage, setNewImage] = useState(user?.file || '');
  const [isChanged, setIsChanged] = useState(false);
  const [isPasswordChangeVisible, setIsPasswordChangeVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const mutation = useProfileImageMutation();
  const changePasswordMutation = useLogInChangePassWordMutation();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
        setIsChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (isChanged && user) {
      let fileData: File | { uri: string; name: string; type: string };

      try {
        fileData = base64ToFile(newImage, 'profile.jpg', 'image/jpeg');
      } catch (error) {
        console.error('Error converting base64 to File:', error);
        return;
      }

      mutation.mutate(
        { userId: user.userId.toString(), file: fileData },
        {
          onSuccess: (data) => {
            updateUser({ file: data.fileUrl });
            setIsChanged(false);
          },
          onError: (error) => {
            console.error("Error uploading image:", error);
          }
        }
      );
    }
  };

  const handlePasswordChange = () => {
    setIsPasswordChangeVisible(!isPasswordChangeVisible);
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(newPassword)) {
      setPasswordError('비밀번호에 특수문자가 포함되어야 합니다.');
      return;
    } else {
      setPasswordError('');
    }

    if (user) {
      changePasswordMutation.mutate(
        { userId: user.userId.toString(), oldPassword: '', newPassword: newPassword },
        {
          onSuccess: () => {
            setNewPassword('');
            setConfirmNewPassword('');
            setIsPasswordChangeVisible(false);
          },
          onError: (error) => {
            console.error("Error changing password:", error);
          }
        }
      );
    }
  };

  return (
    <main className="flex flex-col p-5 bg-white h-full">
      <h1 className="text-2xl font-bold mb-5">내정보</h1>
      {user && (
        <ProfileEdit 
          user={user} 
          newImage={newImage} 
          isChanged={isChanged} 
          handleImageChange={handleImageChange} 
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mt-5"
      />
      <button
        className="mt-5 py-2 px-4 bg-blue-500 text-white rounded"
        onClick={handlePasswordChange}
      >
        비밀번호 변경
      </button>
      {isPasswordChangeVisible && (
        <div className="mt-5 p-5 bg-gray-100 rounded">
          <input
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            type="password"
            placeholder="새로운 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            type="password"
            placeholder="새로운 비밀번호 확인"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          <button
            className="mt-2 py-2 px-4 bg-blue-500 text-white rounded"
            onClick={handlePasswordSubmit}
          >
            확인
          </button>
        </div>
      )}
      <div className="flex-1" />
      <button
        className={`mt-5 py-2 px-4 rounded ${isChanged ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        onClick={handleSubmit}
        disabled={!isChanged}
      >
        제출
      </button>
    </main>
  );
};

// base64 문자열을 File 객체로 변환하는 함수 (웹 환경 전용)
function base64ToFile(base64: string, fileName: string, mimeType: string): File {
  const parts = base64.split(',');
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new File([uint8Array], fileName, { type: mimeType });
}

export default MyPage;