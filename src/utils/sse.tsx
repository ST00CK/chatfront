const API_URL = `${import.meta.env.VITE_STOOCK_API_URL}/alert`;

export const initializeSSE = (userId: string, onReceiveMessage: (msg: string) => void) => {
    let eventSource: EventSource | null = null;
    let retryDelay: number = 1000;

    const connect = () => {
        eventSource = new EventSource(`${API_URL}/sse/subscribe?userId=${userId}`)

        eventSource.onopen = () => {
            console.log('✅ SSE opened successfully');
        }

        eventSource.addEventListener("chat-alert", (event) => {
            try{
                const parsed = JSON.parse(event.data);
                    const roomName = parsed.roomName;
                    const sender = parsed.userId;
                    const message = parsed.message;

                    const toastMsg = `[${roomName}] ${sender}: ${message}, 방금`;

                    onReceiveMessage(toastMsg);
            } catch (err){
                console.error('JSON 파싱 오류', err);
            }
        })

        eventSource.onerror = (err) => {
            console.error("SSE 연결 오류", err);
            if (eventSource?.readyState !== EventSource.CLOSED) {
                setTimeout(() => {
                    console.log('SSE 재연결 시도 ...');
                    connect();
                    retryDelay = Math.min(retryDelay * 2, 5000);
                }, retryDelay);
            }
        }
    }

    connect();

    return eventSource;


    // // const sse = new EventSource(`${API_URL}/sse/subscribe?userId=${userId}`);
    //
    // sse.onopen = () => {
    //     console.log('✅ SSE opened successfully');
    // }
    //
    // sse.addEventListener("chat-alert", (event) => {
    //     try {
    //         const parsed = JSON.parse(event.data);
    //
    //         const roomName = parsed.roomName;
    //         const sender = parsed.userId;
    //         const message = parsed.message;
    //
    //         const toastMsg = `[${roomName}] ${sender}: ${message}, 방금`;
    //
    //         onReceiveMessage(toastMsg);
    //     } catch (err) {
    //         console.error('JSON 파싱 오류', err);
    //     }
    // })
    //
    // sse.onerror = (err) => {
    //     console.error("SSE 연결 오류: ", err);
    //     sse.close();
    // }
    //
    // return sse;
}