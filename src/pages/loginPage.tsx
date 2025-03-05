import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShortButton from '../components/common/shortButton';
import Input from '../components/common/input';
import StoockImage from '../assets/STOOCK!.png';
import kakaoImage from '../assets/kakao.png';
import { useLoginMutation, useKakaoLoginMutation } from '../query/userQuery';

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation();
  const kakaoLoginMutation = useKakaoLoginMutation();

  const navigateToFriendList = () => {
    navigate('/friendlist');
  };

  const navigateToSignUp = () => {
    navigate('/signup');
  };

  const navigateToPasswdChange = () => {
    navigate('/passwdchange');
  };

  // 폼 로그인 핸들
  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({
        userId: userId,
        password: password,
      });

      navigateToFriendList();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  // 카카오 로그인 핸들
  const handleKaKaoLogin = async () => {
    try {
      // Kakao 로그인 mutation 실행
      await kakaoLoginMutation.mutateAsync();

      navigateToFriendList();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-5 bg-white">
      <img src={StoockImage} alt="Stoock Logo" className="mb-10" />
      <h1 className="text-2xl mb-8">로그인</h1>
      <Input placeholder="아이디" className="mb-4 w-full" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)} value={userId} />
      <Input placeholder="비밀번호" className="mb-4 w-full" onChange={(e) => setPassword(e.target.value)} value={password} />
      <div className="flex justify-between w-full mt-5">
        <ShortButton text='로그인' onClick={handleLogin} className="flex-1 mx-1" />
        <ShortButton text='회원가입' onClick={navigateToSignUp} className="flex-1 mx-1" />
      </div>
      <button onClick={handleKaKaoLogin} className="mt-5">
        <img src={kakaoImage} alt="Kakao Login" />
      </button>
      <button onClick={navigateToPasswdChange} className="mt-5 text-blue-500 underline">
        비밀번호가 기억이 안나요
      </button>
    </div>
  );
};

export default LoginPage;