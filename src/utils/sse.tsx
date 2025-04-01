// const API_URL = `${import.meta.env.VITE_STOOCK_API_URL}/alert`;
const API_URL = `http://localhost:8080`

export const initializeSSE = (userId: string, onReceiveMessage: (msg: string) => void) => {
    const sse = new EventSource(`${API_URL}/sse/subscribe?userId=${userId}`);

    sse.onopen = () => {
        console.log('SSE opened successfully');
    }

    sse.addEventListener("chat-alert", (event) => {
        try {
            const parsed = JSON.parse(event.data);

            const roomName = parsed.roomName;
            const sender = parsed.userId;
            const message = parsed.message;

            const toastMsg = `[${roomName}] ${sender}: ${message}, 방금`;

            onReceiveMessage(toastMsg);
        } catch (err) {
            console.error('JSON 파싱 오류', err);
        }
    })

    sse.onerror = (err) => {
        console.error("SSE 연결 오류: ", err);
        sse.close();
    }

    return sse;
}