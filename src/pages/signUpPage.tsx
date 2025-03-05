import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/input';
import ShortButton from '../components/common/shortButton';
import StoockImage from '../assets/STOOCK!.png';
import { useSignUpMutation, useEmailSendMutation, useEmailCheckMutation } from '../query/userQuery';

const SignUpPage = () => {
    const [ID, setID] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [inputEmailCode, setInputEmailCode] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isSignUpDisabled, setIsSignUpDisabled] = useState(true);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isEmailCodeVisible, setIsEmailCodeVisible] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const navigate = useNavigate();
    const signUpMutation = useSignUpMutation();
    const emailSendMutation = useEmailSendMutation();
    const emailCheckMutation = useEmailCheckMutation();

    useEffect(() => {
        if (ID && name && email && password && confirmPassword && isEmailVerified) {
            setIsSignUpDisabled(false);
        } else {
            setIsSignUpDisabled(true);
        }
    }, [ID, name, email, password, confirmPassword, isEmailVerified]);

    const navigateToLoginPage = () => {
        navigate('/login');
    };

    const handleSignUp = async () => {
        if (!ID || !name || !email || !password || !confirmPassword) {
            setErrorMessage('모든 필드를 입력해주세요.');
            setIsErrorModalVisible(true);
            return;
        }

        if (!isEmailVerified) {
            setErrorMessage('이메일을 인증해주세요.');
            setIsErrorModalVisible(true);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
            return;
        }

        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(password)) {
            setPasswordError('비밀번호에 특수문자가 포함되어야 합니다.');
            return;
        } else {
            setPasswordError('');
        }

        try {
            await signUpMutation.mutateAsync({
                userId: ID,
                name: name,
                email: email,
                password: password,
            });
            setIsModalVisible(true);
        } catch (error) {
            console.error("회원가입 실패:", error);
            alert("회원가입에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleModalSignUp = () => {
        setIsModalVisible(false);
        navigateToLoginPage();
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

    const handleErrorModalClose = () => {
        setIsErrorModalVisible(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-gray-100">
            <img src={StoockImage} alt="Stoock Logo" className="mb-10" />
            <h1 className="text-2xl font-bold mb-5">회원가입</h1>
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
            <div className="w-4/5 mb-5">
                <Input
                    placeholder="아이디"
                    onChange={(e) => setID(e.target.value)}
                    value={ID}
                />
            </div>
            <div className="w-4/5 mb-5">
                <Input
                    placeholder="이름"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                />
            </div>
            <div className="w-4/5 mb-5">
                <Input
                    placeholder="비밀번호 ( 특수문자 필수 포함 )"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    onBlur={handlePasswordBlur}
                />
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>
            <div className="w-4/5 mb-5">
                <Input
                    placeholder="비밀번호 확인"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    type="password"
                    onBlur={handleConfirmPasswordBlur}
                />
                {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
            </div>
            <div className="w-4/5 mb-5">
                <ShortButton
                    text="회원가입"
                    onClick={handleSignUp}
                    className={`w-full ${isSignUpDisabled && 'bg-gray-300 text-gray-500'}`}
                    disabled={isSignUpDisabled}
                />
            </div>

            {isModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-5 w-4/5 max-w-md">
                        <p className="text-lg mb-5">회원가입이 완료되었습니다.</p>
                        <ShortButton text="확인" onClick={handleModalSignUp} className="w-full" />
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

export default SignUpPage;