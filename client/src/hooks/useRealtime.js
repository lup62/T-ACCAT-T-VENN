import { useContext } from "react";
import { RealtimeContext } from "../contexts/realtime-context.js";

export function useRealtime() {
    const context = useContext(RealtimeContext);

    if (!context) {
        throw new Error(
            "useRealtime deve essere usato dentro <RealtimeProvider>."
        );
    }

    return context;
}