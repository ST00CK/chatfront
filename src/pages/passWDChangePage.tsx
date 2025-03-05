import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/input';
import ShortButton from '../components/common/shortButton';
import StoockImage from '../assets/images/STOOCK!.png';
import { useEmailSendMutation, useEmailCheckMutation, useChangePassWordMutation } from '../query/userQuery';

const PasswdChangePage = () => {
    const [email, setEmail] = useState('');
    const [inputEmailCode, setInputEmailCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isEmailCodeVisible, setIsEmailCodeVisible] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const navigate = useNavigate();
    const emailSendMutation = useEmailSendMutation();
    const emailCheckMutation = useEmailCheckMutation();
    const changePasswordMutation = useChangePassWordMutation();

    const navigateToLoginPage = () => {
        navigate('/login');
    };

    const handleSendEmailCode = async () => {
        if (!email) {
            setErrorMessage('이메일을 입력해주세요.');
            setIsErrorModalVisible(true);
            return;
        }

        try {
            const response = await emailSendMutation.mutateAsync(email);
            if (response) {
                alert("인증코드가 발송되었습니다.");
                setIsEmailCodeVisible(true);
            }
        } catch (error) {
            console.error("인증코드 발송 실패:", error);
            alert("인증코드 발송에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleCheckEmailCode = async () => {
        if (!inputEmailCode) {
            setErrorMessage('인증코드를 입력해주세요.');
            setIsErrorModalVisible(true);
            return;
        }

        try {
            const response = await emailCheckMutation.mutateAsync({ email, authCode: inputEmailCode });
            if (response.message === "인증이 성공적으로 완료되었습니다.") {
                setIsEmailVerified(true);
                alert("이메일 인증이 완료되었습니다.");
            } else {
                alert("인증코드가 올바르지 않습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("인증코드 확인 실패:", error);
            alert("인증코드 확인에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleChangePassword = async () => {
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

        if (!specialCharRegex.test(password)) {
            setPasswordError('비밀번호에 특수문자가 포함되어야 합니다.');
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({
                userId: email,
                oldPassword: '',
                newPassword: password,
            });
            setIsModalVisible(true);
        } catch (error) {
            console.error("비밀번호 변경 실패:", error);
            alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handlePasswordBlur = () => {
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(password)) {
            setPasswordError('비밀번호에 특수문자가 포함되어야 합니다.');
        } else {
            setPasswordError('');
        }
    };

    const handleConfirmPasswordBlur = () => {
        if (password !== confirmPassword) {
            setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        navigateToLoginPage();
    };

    const handleErrorModalClose = () => {
        setIsErrorModalVisible(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-gray-100">
            <img src={StoockImage} alt="Stoock Logo" className="mb-10" />
            <h1 className="text-2xl font-bold mb-5">비밀번호 변경</h1>
            <div className="w-4/5 mb-5">
                <Input
                    placeholder="이메일"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />
            </div>
            <div className="w-4/5 mb-5">
                <ShortButton
                    text="인증코드"
                    onClick={handleSendEmailCode}
                    className={`w-full ${!email && 'bg-gray-300 text-gray-500'}`}
                    disabled={!email}
                />
            </div>
            {isEmailCodeVisible && (
                <div className="w-4/5 mb-5">
                    <Input
                        placeholder="인증코드"
                        onChange={(e) => setInputEmailCode(e.target.value)}
                        value={inputEmailCode}
                    />
                    <ShortButton
                        text="확인"
                        onClick={handleCheckEmailCode}
                        className={`w-full mt-2 ${!inputEmailCode && 'bg-gray-300 text-gray-500'}`}
                        disabled={!inputEmailCode}
                    />
                </div>
            )}
            {isEmailVerified && (
                <div className="w-4/5 mb-5">
                    <Input
                        placeholder="새 비밀번호"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        type="password"
                        onBlur={handlePasswordBlur}
                    />
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                    <Input
                        placeholder="비밀번호 확인"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        type="password"
                        onBlur={handleConfirmPasswordBlur}
                    />
                    {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
                    <ShortButton
                        text="비밀번호 변경"
                        onClick={handleChangePassword}
                        className={`w-full mt-2 ${(!password || !confirmPassword) && 'bg-gray-300 text-gray-500'}`}
                        disabled={!password || !confirmPassword}
                    />
                </div>
            )}
            {isModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-5 w-4/5 max-w-md">
                        <p className="text-lg mb-5">비밀번호가 성공적으로 변경되었습니다.</p>
                        <ShortButton text="확인" onClick={handleModalClose} className="w-full" />
                    </div>
                </div>
            )}
            {isErrorModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-5 w-4/5 max-w-md">
                        <p className="text-lg mb-5">{errorMessage}</p>
                        <ShortButton text="확인" onClick={handleErrorModalClose} className="w-full" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswdChangePage;