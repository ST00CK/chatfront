import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../query/userQuery';

const Setting: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const navigate = useNavigate();
    const logout = useLogout();

    const navigateToMyPage = () => {
        setModalVisible(false);
        navigate('/mypage');
    };

    return (
        <div>
            <button onClick={() => setModalVisible(true)} className="p-2">
                <FontAwesomeIcon icon={faCog} size="lg" color="black" />
            </button>
            {modalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-4 w-full max-w-sm">
                        <button onClick={() => setModalVisible(false)} className="absolute top-2 right-2">
                            <FontAwesomeIcon icon={faTimes} size="lg" color="black" />
                        </button>
                        <div className="flex flex-col items-center">
                            <button className="w-full py-2 text-center text-black" onClick={navigateToMyPage}>
                                내정보
                            </button>
                            <button className="w-full py-2 text-center text-black" onClick={logout}>
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Setting;