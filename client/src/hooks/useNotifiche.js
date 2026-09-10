import { useContext } from "react";
import { NotificheContext } from "../contexts/notifiche-context.js";

export function useNotifiche() {
    const context = useContext(NotificheContext);

    if (!context) {
        throw new Error(
            "useNotifiche deve essere usato dentro <NotificheProvider>."
        );
    }

    return context;
}