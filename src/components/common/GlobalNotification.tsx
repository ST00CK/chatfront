import NotificationToast from "./notificationToast";
import { useToastStore } from "../../store/useToastStore.tsx";

const GlobalNotification = () => {
    const {message, visible, hideToast } = useToastStore();

    if (!visible) return null;

    return (
        <NotificationToast
            message={message}
            duration={10000}
            onClose={hideToast}
        />
    );
};

export default GlobalNotification;