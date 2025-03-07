import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../query/userQuery';

const Setting: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const navigate = useNavigate();
    const logout = useLogout();

    const navigateToMyPage = () => {
        setModalVisible(false);
        navigate('/mypage');
    };

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const modalWidth = 100;
        const left = rect.left - modalWidth + rect.width;
        setModalPosition({ top: rect.bottom, left: left < 0 ? 0 : left });
        setModalVisible(true);
    };

    return (
        <div>
            <button onClick={handleButtonClick} className="p-2">
                <FontAwesomeIcon icon={faCog} size="lg" color="black" />
            </button>
            {modalVisible && (
                <div
                    className="absolute bg-white rounded-lg px-4 pt-4 pb-2 shadow-lg"
                    style={{ top: modalPosition.top, left: modalPosition.left }}
                >
                    <button onClick={() => setModalVisible(false)} className="absolute top-2 right-2">
                        <FontAwesomeIcon icon={faTimes} size="lg" color="black" />
                    </button>
                    <div className="flex flex-col items-center my-2">
                        <button className="w-full py-2 text-center text-black" onClick={navigateToMyPage}>
                            내정보
                        </button>
                        <button className="w-full py-2 text-center text-black" onClick={logout}>
                            로그아웃
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Setting;