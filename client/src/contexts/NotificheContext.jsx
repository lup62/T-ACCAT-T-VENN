import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { NotificheContext } from "./notifiche-context.js";
import { useAuth } from "../hooks/useAuth";
import { useRealtime } from "../hooks/useRealtime";

import {
    getNotifiche,
    segnaNotificaLetta,
    segnaTutteNotificheLette,
    eliminaNotifica,
} from "../services/notifiche";

export function NotificheProvider({ children }) {
    const { accessToken } = useAuth();
    const { socket } = useRealtime();

    const [notifiche, setNotifiche] = useState([]);
    const [nonLette, setNonLette] = useState(0);
    const [caricamento, setCaricamento] =
        useState(false);
    const [errore, setErrore] = useState("");

    useEffect(() => {
        let annullato = false;

        if (!accessToken) {
            Promise.resolve().then(() => {
                if (annullato) return;

                setNotifiche([]);
                setNonLette(0);
                setCaricamento(false);
                setErrore("");
            });

            return () => {
                annullato = true;
            };
        }

        Promise.resolve().then(() => {
            if (!annullato) {
                setCaricamento(true);
            }
        });

        getNotifiche(accessToken)
            .then((data) => {
                if (annullato) return;

                setNotifiche(data.notifiche || []);
                setNonLette(data.nonLette || 0);
                setErrore("");
            })
            .catch((error) => {
                if (annullato) return;

                setErrore(error.message);
            })
            .finally(() => {
                if (!annullato) {
                    setCaricamento(false);
                }
            });

        return () => {
            annullato = true;
        };
    }, [accessToken]);

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        const gestisciNuovaNotifica = (dati) => {
            const nuovaNotifica = dati?.notifica;

            if (!nuovaNotifica?._id) {
                return;
            }

            setNotifiche((correnti) => {
                const giaPresente = correnti.some(
                    (notifica) =>
                        notifica._id === nuovaNotifica._id
                );

                if (giaPresente) {
                    return correnti;
                }

                return [
                    nuovaNotifica,
                    ...correnti,
                ];
            });

            if (!nuovaNotifica.letta) {
                setNonLette(
                    (corrente) => corrente + 1
                );
            }
        };

        socket.on(
            "notifica:nuova",
            gestisciNuovaNotifica
        );

        return () => {
            socket.off(
                "notifica:nuova",
                gestisciNuovaNotifica
            );
        };
    }, [socket]);

const marcaComeLetta = useCallback(
    async (id) => {
        if (!accessToken) return null;

        const eraNonLetta = notifiche.some(
            (notifica) =>
                notifica._id === id &&
                !notifica.letta
        );

        const aggiornata =
            await segnaNotificaLetta(
                id,
                accessToken
            );

        setNotifiche((correnti) =>
            correnti.map((notifica) =>
                notifica._id === aggiornata._id
                    ? aggiornata
                    : notifica
            )
        );

        if (eraNonLetta) {
            setNonLette((corrente) =>
                Math.max(0, corrente - 1)
            );
        }

        return aggiornata;
    },
    [accessToken, notifiche]
);

    const marcaTutteComeLette =
        useCallback(async () => {
            if (!accessToken) return;

            await segnaTutteNotificheLette(
                accessToken
            );

            setNotifiche((correnti) =>
                correnti.map((notifica) => ({
                    ...notifica,
                    letta: true,
                }))
            );

            setNonLette(0);
        }, [accessToken]);

    const elimina = useCallback(
        async (id) => {
            if (!accessToken) return null;

            const eliminata = await eliminaNotifica(
                id,
                accessToken
            );

            setNotifiche((correnti) =>
                correnti.filter(
                    (notifica) =>
                        notifica._id !== eliminata._id
                )
            );

            if (!eliminata.letta) {
                setNonLette((corrente) =>
                    Math.max(0, corrente - 1)
                );
            }

            return eliminata;
        },
        [accessToken]
    );

    const value = useMemo(
        () => ({
            notifiche,
            nonLette,
            caricamento,
            errore,
            marcaComeLetta,
            marcaTutteComeLette,
            elimina,
        }),
        [
            notifiche,
            nonLette,
            caricamento,
            errore,
            marcaComeLetta,
            marcaTutteComeLette,
            elimina,
        ]
    );

    return (
        <NotificheContext.Provider value={value}>
            {children}
        </NotificheContext.Provider>
    );
}
