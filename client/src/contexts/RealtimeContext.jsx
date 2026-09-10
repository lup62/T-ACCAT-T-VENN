import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { io } from "socket.io-client";

import { RealtimeContext } from "./realtime-context.js";
import { useAuth } from "../hooks/useAuth";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

const TIMEOUT_ACK_MS = 10000;

export function RealtimeProvider({ children }) {
    const { accessToken } = useAuth();

    const socketRef = useRef(null);

    const [socket, setSocket] = useState(null);
    const [connesso, setConnesso] = useState(false);
    const [erroreConnessione, setErroreConnessione] =
        useState("");

    useEffect(() => {
        if (!accessToken) {
            return undefined;
        }

        const nuovoSocket = io(API_URL, {
            auth: {
                token: accessToken,
            },
        });

        socketRef.current = nuovoSocket;

        const gestisciConnessione = () => {
            setSocket(nuovoSocket);
            setConnesso(true);
            setErroreConnessione("");
        };

        const gestisciDisconnessione = () => {
            setSocket((corrente) =>
                corrente === nuovoSocket
                    ? null
                    : corrente
            );

            setConnesso(false);
        };

        const gestisciErroreConnessione = (error) => {
            setConnesso(false);
            setErroreConnessione(
                error.message ||
                "Connessione real-time non riuscita."
            );
        };

        nuovoSocket.on(
            "connect",
            gestisciConnessione
        );

        nuovoSocket.on(
            "disconnect",
            gestisciDisconnessione
        );

        nuovoSocket.on(
            "connect_error",
            gestisciErroreConnessione
        );

        return () => {
            nuovoSocket.disconnect();

            nuovoSocket.off(
                "connect",
                gestisciConnessione
            );

            nuovoSocket.off(
                "disconnect",
                gestisciDisconnessione
            );

            nuovoSocket.off(
                "connect_error",
                gestisciErroreConnessione
            );

            if (socketRef.current === nuovoSocket) {
                socketRef.current = null;
            }
        };
    }, [accessToken]);

    const emetti = useCallback(
        (evento, dati) =>
            new Promise((resolve, reject) => {
                const socketCorrente =
                    socketRef.current;

                if (!socketCorrente?.connected) {
                    reject(
                        new Error(
                            "Connessione real-time non attiva."
                        )
                    );
                    return;
                }

                socketCorrente
                    .timeout(TIMEOUT_ACK_MS)
                    .emit(
                        evento,
                        dati,
                        (error, risposta) => {
                            if (error) {
                                reject(
                                    new Error(
                                        "Il server real-time non risponde."
                                    )
                                );
                                return;
                            }

                            if (!risposta?.ok) {
                                reject(
                                    new Error(
                                        risposta?.message ||
                                        "Errore nella comunicazione real-time."
                                    )
                                );
                                return;
                            }

                            resolve(risposta);
                        }
                    );
            }),
        []
    );

    const value = useMemo(
        () => ({
            socket,
            connesso,
            erroreConnessione:
                accessToken
                    ? erroreConnessione
                    : "",
            emetti,
        }),
        [
            socket,
            connesso,
            erroreConnessione,
            emetti,
            accessToken,
        ]
    );

    return (
        <RealtimeContext.Provider value={value}>
            {children}
        </RealtimeContext.Provider>
    );
}