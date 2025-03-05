import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/common/profile';
import SearchIcon from '../components/common/searchIcon';
import PlusIcon from '../components/common/plusIcon';
import Setting from '../components/common/setting';
import BottomTab from '../components/common/bottomTab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../store/useUserStore';
import { useFriendShipCreateMutation, useFriendShipDeleteMutation, useFriendShipListMutation } from '../query/friendQuery';

interface Profile {
    id: string;
    imageUrl: string;
    name: string;
}

const FriendListPage = () => {
    const navigate = useNavigate();
    const [showInput, setShowInput] = useState(false);
    const [showFriendInput, setShowFriendInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [inputFriendIDValue, setInputFriendIDValue] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const friendShipCreateMutation = useFriendShipCreateMutation();
    const friendShipDeleteMutation = useFriendShipDeleteMutation();
    const friendShipListMutation = useFriendShipListMutation();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState(profiles);
    const slideAnim = useRef(0);
    const friendSlideAnim = useRef(0);
    const [refreshFlag, setRefreshFlag] = useState(0);
    const { user } = useUserStore();

    useEffect(() => {
        console.log('User information:', user);
        const fetchFriendList = async () => {
            try {
                const response = await friendShipListMutation.mutateAsync(user!.userId);
                console.log('Friend list response:', response);

                if (response === "친구 없음") {
                    return;
                }

                if (Array.isArray(response)) {
                    const transformedResponse = response.map(user => ({
                        ...user,
                        id: user.id.toString(),
                    }));
                    setProfiles(transformedResponse);
                    setFilteredProfiles(transformedResponse);
                    console.log('Profiles updated:', transformedResponse);
                } else {
                    console.error('Unexpected response format:', response);
                }
            } catch (error) {
                console.error('Error fetching friend list:', error);
            }
        };
        fetchFriendList();
    }, [user, refreshFlag]);

    const navigateToMyPage = () => {
        navigate('/mypage');
    };

    const handleShowInput = () => {
        setShowInput(prevShowInput => !prevShowInput);
        slideAnim.current = showInput ? 0 : 1;
    };

    const handleShowFriendInput = () => {
        setShowFriendInput(prevShowFriendInput => !prevShowFriendInput);
        friendSlideAnim.current = showFriendInput ? 0 : 1;
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
        const filtered = profiles.filter(profile => profile.name.toLowerCase().includes(text.toLowerCase()));
        setFilteredProfiles(filtered);
    };

    const handleInputFriendIdChange = (text: string) => {
        setInputFriendIDValue(text);
    };

    const handleFriendCreate = async () => {
        if (user!.userId === inputFriendIDValue) {
            alert("자기자신은 추가할 수 없습니다.");
            return;
        }
        try {
            const response = await friendShipCreateMutation.mutateAsync({
                User1ID: user!.userId,
                User2ID: inputFriendIDValue
            });
            console.log('Friend created:', response);
            setRefreshFlag(prev => prev + 1);
            setShowFriendInput(false);
        } catch (error) {
            console.error('Error CreateFreindShip:', error);
        }
    };

    const handleFriendDelete = async () => {
        if (selectedFriend) {
            try {
                await friendShipDeleteMutation.mutateAsync({
                    User1ID: user!.userId,
                    User2ID: selectedFriend.id
                });
                setRefreshFlag(prev => prev + 1);
                setModalVisible(false);
            } catch (error) {
                console.error('Error CreateFreindShip:', error);
            }
        }
    };

    const openModal = (friend: Profile) => {
        setSelectedFriend(friend);
        setModalVisible(true);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-end items-center p-4">
                <PlusIcon onShowInput={handleShowFriendInput} />
                <SearchIcon onPress={handleShowInput} />
                <Setting />
            </div>
            <div className="flex justify-center items-center p-4">
                <Profile
                    imageUrl={user ? user.file : 'https://placehold.co/50'}
                    name={user ? user.name : 'Guest'}
                    imageSize={60}
                    textSize={20}
                    onPress={navigateToMyPage}
                />
            </div>
            {showInput && (
                <div className="flex justify-center items-center p-4">
                    <input
                        type="text"
                        className="w-full border border-gray-300 p-2 rounded"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Search"
                    />
                </div>
            )}
            {showFriendInput && (
                <div className="flex justify-center items-center p-4 border border-black rounded">
                    <input
                        type="text"
                        className="flex-1 h-10 px-4"
                        value={inputFriendIDValue}
                        onChange={(e) => handleInputFriendIdChange(e.target.value)}
                        placeholder="friend ID"
                    />
                    <button
                        onClick={handleFriendCreate}
                        className={`ml-2 py-2 px-4 rounded ${inputFriendIDValue ? 'bg-white text-black' : 'bg-gray-300 text-gray-500'}`}
                        disabled={!inputFriendIDValue}
                    >
                        추가
                    </button>
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-4">
                {filteredProfiles.map(profile => (
                    <div key={profile.id} className="flex items-center p-2">
                        <Profile
                            imageUrl={profile.imageUrl}
                            name={profile.name}
                            imageSize={40}
                            textSize={14}
                        />
                        <button onClick={() => openModal(profile)} className="ml-auto p-2">
                            <FontAwesomeIcon icon={faEllipsisV} size="lg" color="black" />
                        </button>
                    </div>
                ))}
            </div>
            <BottomTab currentPage="FriendListPage" />
            {selectedFriend && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ${modalVisible ? 'block' : 'hidden'}`}>
                    <div className="bg-white rounded-lg p-4 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold">친구 정보</span>
                            <button onClick={() => setModalVisible(false)} className="p-2">
                                <FontAwesomeIcon icon={faTimes} size="lg" color="black" />
                            </button>
                        </div>
                        <Profile
                            imageUrl={selectedFriend.imageUrl}
                            name={selectedFriend.name}
                            imageSize={60}
                            textSize={20}
                        />
                        <div className="flex-1" />
                        <button onClick={handleFriendDelete} className="w-full py-2 rounded bg-blue-500 text-white">
                            친구 삭제
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendListPage;