import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShortButton from '../components/common/shortButton';
import Input from '../components/common/input';
import StoockImage from '../assets/STOOCK!.png';
import kakaoImage from '../assets/kakao.png';
import { useLoginMutation, useKakaoLoginMutation } from '../query/userQuery';
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
    console.log("Navigating to FriendListPage"); // 디버깅용 로그
    navigate('/friendlist');
  };

  const handleLogin = async () => {
    try {
      const user = await loginMutation.mutateAsync({
        userId: userId,
        password: password,
      });

      // 로그인 성공 시 유저 정보 저장
      setUser(user);

      // FriendListPage로 이동
      navigateToFriendList();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Login failed:", error.message);
      } else {
        console.error("Login failed:", error);
      }
      alert("Login failed. Please try again.");
    }
  };

  const handleKakaoLogin = async () => {
    try {
      await kakaoLoginMutation.mutateAsync(); // onSuccess에서 처리
      console.log("Kakao login mutation completed."); // 디버깅용 로그

      // FriendListPage로 이동
      navigateToFriendList();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Kakao login failed:", error.message);
      } else {
        console.error("Kakao login failed:", error);
      }

      alert("Kakao login failed. Please try again.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-full p-5 bg-white">
      <img src={StoockImage} alt="Stoock Logo" className="mb-10" />
      <h1 className="text-2xl mb-8">로그인</h1>
      <Input
        placeholder="아이디"
        className="mb-4 w-full"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
        value={userId}
      />
      <Input
        placeholder="비밀번호"
        type="password"
        className="mb-4 w-full"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <div className="flex justify-between w-full mt-5">
        <ShortButton text="로그인" onClick={handleLogin} className="flex-1 mx-1" />
        <ShortButton text="회원가입" onClick={() => navigate('/signup')} className="flex-1 mx-1" />
      </div>
      <button onClick={handleKakaoLogin} className="mt-5">
        <img src={kakaoImage} alt="Kakao Login" />
      </button>
      <button onClick={() => navigate('/passwdchange')} className="mt-5 text-blue-500 underline">
        비밀번호가 기억이 안나요
      </button>
    </main>
  );
};

export default LoginPage;