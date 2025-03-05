import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_STOOCK_API_URL}/chat`;

interface Room {
    id: string;
    name: string;
}

//채팅방 리스트 컬럼명? 수정함수
function transformRoomData(room: { room_id: string; room_name: string }): Room {
    return {
      id: room.room_id,
      name: room.room_name,
    };
  }

//채팅방 리스트
export const useChatRoomListMutation = (): UseMutationResult<Room[], unknown, { userId: string} , unknown> =>{
    return useMutation({
        mutationFn: async(userId) =>{
            console.log(userId);
            const response = await axios.get(`${API_URL}/api/chatroom/list`, {
                params: { userId }
            })
            const transformRoomDatas: Room[] = response.data.map(transformRoomData);

            return transformRoomDatas;
        },
        onSuccess(data){
            console.log(data);
        }
    })
}

// 채팅방 멤버 데이터 타입
interface RoomMembersData {
    roomId: string;
}

// 채팅방 멤버 응답 타입
interface RoomMembersResponse {
    userId: string[];
}

// 채팅방 멤버 조회
export const useChatRoomMembersMutation = (): UseMutationResult<RoomMembersResponse, unknown, RoomMembersData, unknown> => {
    return useMutation({
        mutationFn: async({ roomId }) => {
            const response = await axios.get(`${API_URL}/api/chatroom/members`, {
                params: { roomId },
            });
            console.log('API response:', response.data); // API 응답을 콘솔에 출력하여 확인
            const userIds = response.data.map((member: { user_id: string }) => member.user_id);
            return { userId: userIds };
        },
        onSuccess(data) {
            console.log('Mutation success data:', data); // 성공 시 데이터를 콘솔에 출력하여 확인
        }
    });
}

//채팅방 생성 요청 타입
interface CreateChatRoom{
    roomName:string,
    userId:string[]
}

//채팅방 생성 응답 타입
interface CreateRoomResponse {
    message: string;
    roomId: string;
    roomName: string;
    userId: string[];
  }

//채팅방 생성
export const useChatRoomCreateMutation = (): UseMutationResult<CreateRoomResponse, unknown, CreateChatRoom , unknown> =>{
    return useMutation({
        mutationFn: async(createRoomData: CreateChatRoom) =>{
            console.log(createRoomData);
            const response = await axios.post(`${API_URL}/api/chatroom/create`,
                createRoomData
            ,{
                headers: {
                    'Content-Type': 'application/json',
                  },
            })
            return response.data;
        },
        onSuccess(data){
            console.log(data);
            alert("채팅방 생성 완료")
        }
    })
}

//방 삭제 데이터타입
interface DeleteRoomData{
    roomId:string,
    userId:string
}

//채팅방 삭제(개발자 모드 네트워크에서 CORS에러 뜨는데 로그 확인 필요....ㅠㅠ)
export const useDeleteRoomMutation = () : UseMutationResult<string, unknown, DeleteRoomData , unknown> => {
    return useMutation({
        mutationFn: async(deleteRoomdata:DeleteRoomData) =>{
            const response = await axios.delete(`${API_URL}/api/chatroom/exit`,{
                data: deleteRoomdata,
            });
            return response.data;
        },
        onSuccess(data){
            console.log(data);
            alert("채팅방 삭제")
        }
    })
}


//채팅방 업데이트 데이터 타입
interface ChatRoomUpdateData{
    roomId:string,
    roomName:string
}

//채팅방 이름 업데이트
export const useChatRoomUpdateMutation = () : UseMutationResult<string, unknown, ChatRoomUpdateData, unknown> => {
    return useMutation({
        mutationFn: async(chatroomUpdatedata:ChatRoomUpdateData) =>{
            const response = await axios.patch(`${API_URL}/api/chatroom/update`,
                chatroomUpdatedata,
                {
                    headers:{
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data
        },
        onSuccess(data){
            alert("채팅방 이름이 변경되었습니다.")
            console.log(data)
        }
    })
}


//채팅방 초대 데이터 타입
interface RoomInviteData{
    roomId:string,
    userId:string
}

//채팅방 초대
export const useChatRoomInviteMutation = () : UseMutationResult<string, unknown, RoomInviteData, unknown> => {
    return useMutation({
        mutationFn: async(roomInviteData:RoomInviteData) =>{
            const response = await axios.post(`${API_URL}/api/chatroom/invite`,
                roomInviteData,
                {
                    headers:{
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data
        },
        onSuccess(data){
            alert("초대를 완료했습니다.")
            console.log(data)
        }
    })
}

interface ChatMessageDate {
    message_id: string;
    room_id: string;
    user_id: string;
    message: string;
    timestamp: string;
  }
  

//채팅방 로그 조회
export const useChatRoomLogMutation = (): UseMutationResult<ChatMessageDate, unknown, { room_Id: string} , unknown> =>{
    return useMutation({
        mutationFn: async({ room_Id }) =>{
            console.log("room_Id : " + room_Id);
            const response = await axios.get(`${API_URL}/api/chatroom/log`, {
                params: { roomId: room_Id },
            })

            return response.data;
        },
        onSuccess(data){
            console.log(data);
        }
    })
}