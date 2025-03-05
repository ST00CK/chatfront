import axios from 'axios';
import { useQuery, UseQueryResult, useMutation, UseMutationResult } from '@tanstack/react-query';
import { useUserStore } from '../store/useUserStore';

const API_URL = `${import.meta.env.VITE_STOOCK_API_URL}/user`;

// Declare Kakao on the window interface
declare global {
    interface Window {
      Kakao: {
        Auth: {
          login: (options: { success: (response: KakaoAuthResponse) => void; fail: (error: Error) => void }) => void;
          setAccessToken: (accessToken: string, refreshToken?: string) => void;
        };
      };
    }
  }

export interface User {
    id: number;
    name: string;
    profileImage: string;
    userId: string;
    email: string;
    file: string;
}

// 사용자 정보 조회
export const fetchUsers = async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}/find/user`);
    return response.data;
};

// 사용자 정보를 조회하는 React Query 훅
export const useUsersQuery = (): UseQueryResult<User[], unknown> => {
    const { setUsers } = useUserStore();

    const queryResult = useQuery<User[], unknown>({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    // 데이터가 성공적으로 로드되면 zustand 상태 업데이트
    if (queryResult.data) {
        setUsers(queryResult.data);
    }

    return queryResult;
};

// 특정 사용자 정보 조회
export const fetchUserById = async (userId: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/find/user`, {
        params: { userId }
    });
    console.log('Fetched user:', response.data); // 사용자 정보를 콘솔에 출력하여 확인
    return response.data;
};

// 특정 사용자 정보를 조회하는 React Query 훅
export const useUserQuery = (userId: string): UseQueryResult<User, unknown> => {
    return useQuery<User, unknown>({
        queryKey: ['user', userId],
        queryFn: () => fetchUserById(userId),
    });
};

// 로그아웃 함수
export const useLogout = () => {
    const { logout } = useUserStore();
    return async () => {
        try {
            const response = await axios.post(
                `${API_URL}/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            logout();
            alert(response.data.message);
            localStorage.removeItem('token');
            window.location.href = '/';
        } catch {
            alert('로그아웃 처리 중 오류가 발생했습니다.');
        }
    };
};
//이메일 인증 mutation
export const useEmailSendMutation = (): UseMutationResult<{ message: string }, unknown, string> => {
    return useMutation({
        mutationFn: async (email: string) => {
            console.log("Sending email:", email); // email 값 확인
            const response = await axios.post(`${API_URL}/send`, {
                email: email
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
    });
};

//이메일 확인 코드 검증
export const useEmailCheckMutation = (): UseMutationResult<{ message: string }, unknown, { email: string, authCode: string }> => {
    return useMutation({
        mutationFn: async ({ email, authCode }: { email: string, authCode: string }) => {
            console.log("Verifying email and authCode:", email, authCode); // email과 authCode 값 확인
            const response = await axios.post(`${API_URL}/verify`, {
                email: email,
                authCode: authCode
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            });
            console.log("Response:",response.data);
            return response.data;
        }
    });
};

// 회원가입 데이터 타입
export interface SignUpData {
    userId: string;
    name: string;
    email: string;
    password: string;
}

//회원가입 mutation
export const useSignUpMutation = (): UseMutationResult<{ message: string }, unknown, SignUpData> => {
    return useMutation({
        mutationFn: async (data: SignUpData) => {
            const response = await axios.post(`${API_URL}/formuser`, {
                formUserDto: {
                    userId: data.userId,
                    passwd: data.password,
                },
                userDto: {
                    userId: data.userId,
                    name: data.name,
                    email: data.email,
                },
            },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true, // 쿠키 허용
                }
            );
            return response.data;
        }
    });
};

//로그인 데이터 타입
export interface LoginData {
    userId: string;
    password: string;
}

//로그인 mutation
export const useLoginMutation = (): UseMutationResult<{ message: string }, unknown, LoginData> => {
    const { setUser } = useUserStore();
    return useMutation({
        mutationFn: async (data: LoginData) => {
            const response = await axios.post(`${API_URL}/login`, {
                userId: data.userId,
                passwd: data.password,
            },
                {
                    withCredentials: true, // 쿠키 허용
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message);

            const { file, name, userId, email } = data;
            setUser({ file, name, userId, email });
        }
    })
}

//카카오 로그인 데이터 타입
export interface KakaoAuthResponse {
    access_token: string;
    refresh_token: string;
}

//카카오 로그인 mutation
export const useKakaoLoginMutation = (): UseMutationResult<{ message: string },  unknown,  void, unknown> => {
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: async (): Promise<{ message: string; file: string; name: string; userId: string; email: string }> => {
      // Kakao 로그인 API 호출: Promise를 통해 Kakao 로그인 결과를 받음
      const authObj = await new Promise<KakaoAuthResponse>((resolve, reject) => {
        window.Kakao.Auth.login({
          success: resolve,
          fail: reject,
        });
      });

      const accessToken = authObj.access_token;
      const refreshToken = authObj.refresh_token;

      if (!accessToken) {
        throw new Error("No access token received from Kakao");
      }

      console.log("accessToken:", accessToken);
      console.log("refreshToken:", refreshToken);

      // 로그인 후 액세스 토큰과 리프레시 토큰을 Kakao SDK 및 쿠키에 설정
      window.Kakao.Auth.setAccessToken(accessToken, refreshToken);
      document.cookie = `refresh_token=${refreshToken}; path=/; SameSite=Strict`;
      console.log("설정된 쿠키:", document.cookie);

      // 액세스 토큰을 헤더에 포함시켜 서버에 카카오 토큰을 전송
      const response = await axios.post(
        `${API_URL}/api/kakao-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      console.log("서버 응답:", response.data);

      // 서버 응답 데이터를 반환
      return response.data;
    },
    onSuccess: (data) => {
      // 로그인 성공 시, 반환된 메시지를 alert로 출력
      alert(data.message);

      // 필요한 속성만 추출하여 user store 업데이트
      const { file, name, userId, email } = data;
      setUser({ file, name, userId, email });
    },
  });
}

export interface ChangePasswordData{
    userId: string;
    oldPassword: string;
    newPassword: string;
}
//비밀번호 변경 mutation(로그인 후)
export const useLogInChangePassWordMutation = (): UseMutationResult<{message:string}, unknown, ChangePasswordData> =>{
    return useMutation({
        mutationFn: async (data: ChangePasswordData) => {
            const response = await axios.post(`${API_URL}/change/password`,{
                userId: data.userId,
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            },
                {
                    withCredentials: true,
                }
            );
            return response.data;
        },
        onSuccess:(data)=>{
            alert(data.message)
        }
    })
}

//비밀번호 변경 mutation(로그인 전)
export const useChangePassWordMutation = (): UseMutationResult<{message:string}, unknown, ChangePasswordData> =>{
    return useMutation({
        mutationFn: async (data: ChangePasswordData) => {
            const response = await axios.post(`${API_URL}/reset/password`,{
                userId: data.userId,
                newPassword: data.newPassword,
            },
                {
                    withCredentials: true,
                }
            );
            return response.data;
        },
        onSuccess:(data)=>{
            alert(data.message)
        }
    })
}

// 프로필 사진 변경 mutation
export const useProfileImageMutation = (): UseMutationResult<{ fileUrl: string }, unknown, { userId: string, file: File }> => {
    return useMutation({
      mutationFn: async ({ userId, file }: { userId: string, file: File }) => {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('file', file);
  
        formData.forEach((value, key) => {
          console.log(key, value);
        });
  
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        return response.data;
      },
    });
  };