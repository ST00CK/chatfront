import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

const ChatLogo = () => {
    return (
        <div className="flex items-center">
            <FontAwesomeIcon icon={faUserCircle} size="3x" className="mr-2" />
            <span className="text-xl font-bold">STOOCK</span>
        </div>
    );
};

export default ChatLogo;