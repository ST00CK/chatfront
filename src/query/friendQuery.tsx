import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { fetchUserById } from './userQuery';


const API_URL = `${import.meta.env.VITE_STOOCK_API_URL}/friend`;

interface FriendData{
    User1ID:string,
    User2ID:string
}

//친구추가
export const useFriendShipCreateMutation = (): UseMutationResult<AxiosResponse, unknown, FriendData , unknown> =>{
    return useMutation({
        mutationFn: async(friendData:FriendData) => {
            const response = await axios.post(`${API_URL}/friendship/create`,
                friendData
            )
            return response;
        },
        onSuccess(data){
            alert("친구 추가")
            console.log(data);
        }
    })
}

//친구삭제
export const useFriendShipDeleteMutation = (): UseMutationResult<AxiosResponse, unknown, FriendData , unknown> =>{
    return useMutation({
        mutationFn: async(friendData:FriendData) => {
            const response = await axios.post(`${API_URL}/friendship/delete`,
                friendData
            )
            return response;
        },
        onSuccess(data){
            alert("친구 삭제")
            console.log(data);
        }
    })
}

//리스트 가져오기
export const useFriendShipListMutation = (): UseMutationResult<TransformedUser[]|string, unknown, string , unknown> =>{
    return useMutation({
        mutationFn: async(userID) => {
            const response = await axios.get(`${API_URL}/friendship/list`,{
                params: { userID }
        })

        if(response.data==null){
            return "친구 없음"  
        }
        
        console.log(response.data);
        // response.data가 배열인지 확인하고, 배열이 아니면 배열로 감싸기
        const originalData: ServerUserData[] = Array.isArray(response.data)
        ? response.data
        : [response.data];

        console.log("ori: " + JSON.stringify(originalData));

        const transformedData: TransformedUser[] = await Promise.all(originalData.map(transformUser));
        console.log(transformedData);
        return transformedData;
        },
        onSuccess(data){
            console.log(data);
        }
    })
}

// 서버에서 받는 원본 데이터 타입
interface ServerUserData {
    Id: number;
    ElementId: string;
    Labels: string[];
    Props: {
      id: string;
      profile: string;
    };
  }

  // 변환 후 사용할 데이터 타입
interface TransformedUser {
    id: string;
    name: string;
    imageUrl: string;
  }

  async function transformUser(data: ServerUserData): Promise<TransformedUser> {
    const user = await fetchUserById(data.Props.id);
    return {
        id: data.Props.id,
        name: user.name,
        imageUrl: data.Props.profile,
    };
}