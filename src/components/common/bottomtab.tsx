import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faComments } from '@fortawesome/free-solid-svg-icons';

const BottomTab = ({ currentPage }: { currentPage: string }) => {
    const navigate = useNavigate();

    return (
        <div className="flex justify-around items-center h-16 border-t border-gray-300 bg-white w-full">
            <button className="flex flex-col items-center p-2" onClick={() => navigate('/friendlist')}>
                <FontAwesomeIcon icon={faUser} className="text-gray-500 mb-1" />
                <span className={`text-xs ${currentPage === 'FriendListPage' ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>친구</span>
            </button>
            <button className="flex flex-col items-center p-2" onClick={() => navigate('/chatlist')}>
                <FontAwesomeIcon icon={faComments} className="text-gray-500 mb-1" />
                <span className={`text-xs ${currentPage === 'ChatListPage' ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>채팅</span>
            </button>
        </div>
    );
};

export default BottomTab;