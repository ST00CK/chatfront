import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShortButton from '../components/common/shortButton';
import Input from '../components/common/input';
import StoockImage from '../assets/STOOCK!.png';
import kakaoImage from '../assets/kakao.png';
import { useLoginMutation, useKakaoLoginMutation, User } from '../query/userQuery';
import { useUserStore } from '../store/useUserStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUserStore();

  const loginMutation = useLoginMutation();
  const kakaoLoginMutation = useKakaoLoginMutation();

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_STOOCK_KAKAO_API_KEY);
      console.log("Kakao SDK 초기화 완료:", window.Kakao.isInitialized());
    }
  }, []);

  const navigateToFriendList = () => {
    navigate('/friendlist');
  };

  const handleLogin = async () => {
    try {
        const response = await loginMutation.mutateAsync({
            userId: userId,
            password: password,
        });

        if (response.message) {
            // 로그인 실패 처리
            alert(response.message);
            return;
        }

        // 반환된 데이터를 User 타입에 맞게 변환
        const userData: User = {
          userId: response.userId || '',
          email: response.email || '',
          file: response.file || '',
          name: response.name || '',
          id: 0,
          profileImage: ''
        };

        setUser(userData);
        navigateToFriendList();
    } catch (error) {
        console.error("Login failed:", error);

        if (error instanceof Error) {
            alert(`Login failed: ${error.message}`);
        } else {
            alert("Login failed. Please try again.");
        }
    }
};

  return (
    <main className="flex flex-col items-center justify-center h-full p-5 bg-white">
      <img src={StoockImage} alt="Stoock Logo" className="mb-10" />
      <h1 className="text-2xl mb-8">로그인</h1>
      <Input placeholder="아이디" className="mb-4 w-full" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)} value={userId} />
      <Input placeholder="비밀번호" type='password' className="mb-4 w-full" onChange={(e) => setPassword(e.target.value)} value={password} />
      <div className="flex justify-between w-full mt-5">
        <ShortButton text='로그인' onClick={handleLogin} className="flex-1 mx-1" />
        <ShortButton text='회원가입' onClick={() => navigate('/signup')} className="flex-1 mx-1" />
      </div>
      <button onClick={() => kakaoLoginMutation.mutateAsync()} className="mt-5">
        <img src={kakaoImage} alt="Kakao Login" />
      </button>
      <button onClick={() => navigate('/passwdchange')} className="mt-5 text-blue-500 underline">
        비밀번호가 기억이 안나요
      </button>
    </main>
  );
};

export default LoginPage;