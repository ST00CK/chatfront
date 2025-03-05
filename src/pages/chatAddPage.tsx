import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/common/profile';
import SearchIcon from '../components/common/searchIcon';
import { useChatRoomCreateMutation } from '../query/chatQuery';
import { useFriendShipListMutation } from '../query/friendQuery';
import { useUserStore } from '../store/useUserStore';

interface ProfileType {
    id: number;
    name: string;
    imageUrl: string;
    isChecked: boolean;
}

const ChatAddPage = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [profiles, setProfiles] = useState<ProfileType[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<ProfileType[]>([]);
    const slideAnim = useRef(0);
    const createChatRoomMutation = useChatRoomCreateMutation();
    const friendShipListMutation = useFriendShipListMutation();

    useEffect(() => {
        const fetchFriendList = async () => {
            try {
                const response = await friendShipListMutation.mutateAsync(user!.userId);
                console.log('Friend list response:', response); // 응답 데이터 확인
                if (Array.isArray(response)) {
                    const transformedResponse = response.map((user: { id: string; name: string; imageUrl: string }) => ({
                        id: parseInt(user.id, 10),
                        name: user.name,
                        imageUrl: user.imageUrl,
                        isChecked: false,
                    }));
                    setProfiles(transformedResponse);
                    setFilteredProfiles(transformedResponse);
                }
            } catch (error) {
                console.error('Error fetching friend list:', error);
            }
        };
        fetchFriendList();
    }, [user]);

    const handleShowInput = () => {
        setShowInput(prevShowInput => !prevShowInput);
        slideAnim.current = showInput ? 0 : 1;
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
        const filtered = profiles.filter(profile =>
            profile.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredProfiles(filtered);
    };

    const handleCheck = (id: number) => {
        const updatedProfiles = profiles.map(profile =>
            profile.id === id ? { ...profile, isChecked: !profile.isChecked } : profile
        );
        setProfiles(updatedProfiles);
        setFilteredProfiles(updatedProfiles.filter(profile =>
            profile.name.toLowerCase().includes(inputValue.toLowerCase())
        ));
    };

    const handleCreateChatRoom = async () => {
        const selectedProfiles = profiles.filter(profile => profile.isChecked);
        const userIds = selectedProfiles.map(profile => profile.id.toString());
        const userNames = selectedProfiles.map(profile => profile.name);

        // 현재 사용자의 ID와 이름을 추가
        if (user && user.userId) {
            userIds.push(user.userId.toString());
            userNames.push(user.name);
        }

        const roomName = userNames.join(',');

        console.log('Selected profiles:', selectedProfiles);
        console.log('User IDs:', userIds);
        console.log('Room Name:', roomName);

        try {
            const response = await createChatRoomMutation.mutateAsync({
                roomName: roomName,
                userId: userIds
            });
            console.log('Chat room creation response:', response);
            alert(response.message);
            navigate('/chatlist', { state: { refresh: true } });
        } catch (error) {
            console.error('Error creating chat room:', error);
            alert("채팅방 생성 오류");
        }
    }

    return (
        <main className="flex flex-col h-full">
            <div className="flex flex-col flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-lg font-bold">대화상대 선택</h1>
                    <SearchIcon onPress={handleShowInput} />
                </div>
                {showInput && (
                    <div className="mb-4">
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded"
                            value={inputValue}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Search Friends"
                        />
                    </div>
                )}
                <div className="flex-1 overflow-y-auto">
                    {filteredProfiles.map(profile => (
                        <Profile
                            key={profile.id}
                            name={profile.name}
                            imageUrl={profile.imageUrl}
                            imageSize={40}
                            textSize={14}
                            showCheck={true}
                            isChecked={profile.isChecked}
                            onCheck={() => handleCheck(profile.id)}
                        />
                    ))}
                </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-300">
                <button className="w-full bg-blue-500 text-white py-3 rounded" onClick={handleCreateChatRoom}>
                    확인
                </button>
            </div>
        </main>
    );
};

export default ChatAddPage;