import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!socket) {
            socket = io(import.meta.env.VITE_STOOCK_API_URL, {
                query: { userId },
                transports: ['websocket'],
                path: '/socket.io',
            });

            socket.on('connect', () => {
                console.log('Socket connected for user:', userId);
                resolve(); // 연결 완료
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                reject(error); // 연결 실패
            });
        } else if (socket.connected) {
            resolve(); // 이미 연결된 상태
        } else {
            socket.connect(); // 연결 재시도
            socket.on('connect', () => {
                console.log('Socket reconnected for user:', userId);
                resolve();
            });
        }
    });
};

export const getSocket = (): Socket => {
    if (!socket || !socket.connected) {
        console.error('Socket is not initialized or not connected. Call initializeSocket first.');
        throw new Error('Socket is not initialized or not connected. Call initializeSocket first.');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected');
    }
};