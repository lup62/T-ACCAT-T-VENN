/**
 * ChatPage.jsx — rotta: /chat (+ ?c=<conversazioneId> per aprirne una)
 *
 * Messaggistica 1:1 tra utenti. Lo storico e la lista conversazioni
 * arrivano via REST (services/conversazioni.js), i messaggi nuovi via
 * Socket.IO (hooks/useChatSocket.js): prima si entra nella stanza della
 * conversazione, poi l'invio fa broadcast di "messaggio:nuovo" a entrambi
 * i partecipanti — anche al mittente, quindi l'append è centralizzato in
 * gestisciMessaggioNuovo con dedup per _id (l'ack dell'invio e il
 * broadcast portano lo stesso messaggio).
 *
 * La conversazione attiva vive nella query string (?c=...) così il link è
 * condivisibile e il back del browser chiude il thread; su mobile lista e
 * thread si alternano, su desktop sono affiancati.
 *
 * Le pagine che offrono "Contatta" (dettaglio annuncio, proposte) creano
 * o recuperano la conversazione con POST /api/conversazioni e navigano
 * qui con ?c=<id> passando la conversazione in location.state: se il
 * backend non la restituisce ancora nella lista (appena creata) viene
 * inserita da lì.
 *
 * Stato "a chiave" (stesso pattern di DettaglioAnnuncioPage): i risultati
 * delle fetch ricordano per quali parametri valgono, così il caricamento
 * si deriva senza setState sincroni negli effect
 * (react-hooks/set-state-in-effect).
 *
 * Accessibile solo agli utenti autenticati (stesso guard di PropostePage).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";

import { useAuth } from "../../hooks/useAuth";
import { useChatSocket } from "../../hooks/useChatSocket";
import {
    getConversazioni,
    getMessaggiConversazione,
    segnaMessaggiLetti,
} from "../../services/conversazioni";
import ListaConversazioni from "./ListaConversazioni";
import ThreadMessaggi from "./ThreadMessaggi";

function ChatPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, accessToken, inizializzazione, utente } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();
    const conversazioneAttivaId = searchParams.get("c");
    const mioId = utente?.id;

    const [conversazioni, setConversazioni] = useState(null); // null = in caricamento
    const [erroreCaricamento, setErroreCaricamento] = useState("");
    // Storico della conversazione attiva: { chiave, messaggi, errore }.
    const [risultatoMessaggi, setRisultatoMessaggi] = useState(null);
    // Errore d'ingresso nella stanza socket: { chiave, testo } | null.
    const [erroreStanza, setErroreStanza] = useState(null);

    // Refs lette dal callback del socket, che vive più a lungo del render;
    // aggiornate in un effect per la regola react-hooks/refs.
    const conversazioneAttivaIdRef = useRef(null);
    const accessTokenRef = useRef(null);
    const mioIdRef = useRef(null);
    useEffect(() => {
        conversazioneAttivaIdRef.current = conversazioneAttivaId;
        accessTokenRef.current = accessToken;
        mioIdRef.current = mioId;
    });

    // Unico punto in cui i messaggi vengono aggiunti al thread: usato sia
    // dal broadcast del socket sia dall'ack dell'invio (dedup per _id).
    const gestisciMessaggioNuovo = useCallback((messaggio) => {
        const convId = messaggio.conversazione;

        // Aggiorna l'anteprima nella lista e riporta la conversazione in cima.
        setConversazioni((prev) => {
            if (!prev) return prev;
            const aggiornate = prev.map((c) =>
                c._id === convId
                    ? {
                          ...c,
                          ultimoMessaggio: {
                              testo: messaggio.testo,
                              mittente: messaggio.mittente?._id,
                              timestamp: messaggio.createdAt,
                          },
                          updatedAt: messaggio.createdAt,
                      }
                    : c
            );
            return aggiornate.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
        });

        setRisultatoMessaggi((prev) => {
            if (
                !prev ||
                prev.chiave !== convId ||
                prev.messaggi.some((m) => m._id === messaggio._id)
            ) {
                return prev;
            }
            return { ...prev, messaggi: [...prev.messaggi, messaggio] };
        });

        // Se il messaggio arriva dall'altro mentre il thread è aperto lo
        // segniamo subito come letto; se fallisce verrà risegnato alla
        // prossima apertura della conversazione.
        if (
            convId === conversazioneAttivaIdRef.current &&
            messaggio.mittente?._id !== mioIdRef.current
        ) {
            segnaMessaggiLetti(convId, accessTokenRef.current).catch(() => {});
        }
    }, []);

    const { connesso, erroreConnessione, entraConversazione, inviaMessaggio } =
        useChatSocket(accessToken, gestisciMessaggioNuovo);

    // Caricamento della lista conversazioni. Se siamo arrivati da un
    // bottone "Contatta" la conversazione (eventualmente appena creata)
    // viaggia in location.state e viene inserita se il backend non la
    // include ancora.
    useEffect(() => {
        if (!accessToken) return undefined;
        let annullato = false;
        const daState = location.state?.conversazione;

        getConversazioni(accessToken)
            .then((lista) => {
                if (annullato) return;
                const completa =
                    daState && !lista.some((c) => c._id === daState._id)
                        ? [daState, ...lista]
                        : lista;
                setConversazioni(completa);
                setErroreCaricamento("");
            })
            .catch((err) => {
                if (annullato) return;
                setErroreCaricamento(err.message);
                setConversazioni([]);
            });

        return () => {
            annullato = true;
        };
    }, [accessToken, location.state]);

    // Storico messaggi della conversazione attiva + segna come letti.
    useEffect(() => {
        if (!conversazioneAttivaId || !accessToken) return undefined;
        let annullato = false;

        getMessaggiConversazione(conversazioneAttivaId, accessToken)
            .then((storico) => {
                if (annullato) return;
                setRisultatoMessaggi({
                    chiave: conversazioneAttivaId,
                    messaggi: storico,
                    errore: "",
                });
                segnaMessaggiLetti(conversazioneAttivaId, accessToken).catch(() => {});
            })
            .catch((err) => {
                if (annullato) return;
                setRisultatoMessaggi({
                    chiave: conversazioneAttivaId,
                    messaggi: [],
                    errore: err.message,
                });
            });

        return () => {
            annullato = true;
        };
    }, [conversazioneAttivaId, accessToken]);

    // Ingresso nella stanza socket: rieseguito anche a ogni riconnessione
    // (il socket viene ricreato al rinnovo del token e perde le stanze).
    useEffect(() => {
        if (!connesso || !conversazioneAttivaId) return;
        entraConversazione(conversazioneAttivaId)
            .then(() => setErroreStanza(null))
            .catch((err) =>
                setErroreStanza({ chiave: conversazioneAttivaId, testo: err.message })
            );
    }, [connesso, conversazioneAttivaId, entraConversazione]);

    const apriConversazione = (id) => setSearchParams({ c: id });
    const chiudiConversazione = () => setSearchParams({});

    const invia = async (testo) => {
        const messaggio = await inviaMessaggio(conversazioneAttivaId, testo);
        gestisciMessaggioNuovo(messaggio);
    };

    // ── Guard: ripristino sessione in corso ───────────────────────────────────
    if (inizializzazione) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    // ── Guard: utente non autenticato ─────────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
                <Paper
                    elevation={2}
                    sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, maxWidth: 600, mx: "auto", textAlign: "center" }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                        Devi essere registrato
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Per usare la chat devi avere un account e aver effettuato l'accesso.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                        <Button variant="contained" color="primary" size="large" onClick={() => navigate("/login")}>
                            Accedi
                        </Button>
                        <Button variant="outlined" color="primary" size="large" onClick={() => navigate("/register")}>
                            Registrati
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    const conversazioneAttiva =
        conversazioni?.find((c) => c._id === conversazioneAttivaId) ?? null;
    // Lo storico vale solo se appartiene alla conversazione mostrata.
    const messaggi =
        risultatoMessaggi?.chiave === conversazioneAttivaId
            ? risultatoMessaggi.messaggi
            : null;
    const erroreThread =
        (risultatoMessaggi?.chiave === conversazioneAttivaId
            ? risultatoMessaggi.errore
            : "") ||
        (erroreStanza?.chiave === conversazioneAttivaId ? erroreStanza.testo : "");

    return (
        <Box sx={{ px: { xs: 0, sm: 3, md: 10 }, py: { xs: 0, sm: 4, md: 6 } }}>
            <Typography
                variant="h4"
                component="h1"
                sx={{ mb: 0.5, px: { xs: 2, sm: 0 }, pt: { xs: 3, sm: 0 } }}
            >
                Messaggi
            </Typography>
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, px: { xs: 2, sm: 0 } }}
            >
                Le tue conversazioni con datori e lavoratori.
            </Typography>

            {erroreCaricamento && (
                <Alert severity="error" sx={{ mb: 3, mx: { xs: 2, sm: 0 } }}>
                    {erroreCaricamento}
                </Alert>
            )}
            {erroreConnessione && (
                <Alert severity="warning" sx={{ mb: 3, mx: { xs: 2, sm: 0 } }}>
                    Chat in tempo reale non disponibile: {erroreConnessione}
                </Alert>
            )}

            {conversazioni === null ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : conversazioni.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <ForumOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                        Non hai ancora nessuna conversazione: contatta qualcuno
                        dal dettaglio di un annuncio.
                    </Typography>
                </Box>
            ) : (
                <Paper
                    elevation={2}
                    sx={{
                        borderRadius: { xs: 0, sm: 3 },
                        overflow: "hidden",
                        display: "flex",
                        // Altezza legata al viewport (sono le due colonne
                        // interne a scorrere): su desktop la chat riempie lo
                        // schermo sotto navbar e titolo.
                        height: {
                            xs: "calc(100dvh - 240px)",
                            sm: "calc(100dvh - 290px)",
                        },
                        minHeight: 420,
                    }}
                >
                    {/* Lista: su mobile sparisce quando un thread è aperto */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: 340 },
                            flexShrink: 0,
                            borderRight: { md: 1 },
                            borderColor: { md: "divider" },
                            overflowY: "auto",
                            display: {
                                xs: conversazioneAttivaId ? "none" : "block",
                                md: "block",
                            },
                        }}
                    >
                        <ListaConversazioni
                            conversazioni={conversazioni}
                            mioId={mioId}
                            attivaId={conversazioneAttivaId}
                            onSeleziona={apriConversazione}
                        />
                    </Box>

                    {/* Thread della conversazione attiva. La key fa ripartire
                        il componente (campo di testo compreso) a ogni cambio
                        di conversazione. */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            minWidth: 0,
                            display: {
                                xs: conversazioneAttivaId ? "flex" : "none",
                                md: "flex",
                            },
                            flexDirection: "column",
                        }}
                    >
                        {conversazioneAttiva ? (
                            <ThreadMessaggi
                                key={conversazioneAttiva._id}
                                conversazione={conversazioneAttiva}
                                messaggi={messaggi}
                                errore={erroreThread}
                                mioId={mioId}
                                connesso={connesso}
                                onInvia={invia}
                                onIndietro={chiudiConversazione}
                            />
                        ) : (
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "text.secondary",
                                    p: 4,
                                    textAlign: "center",
                                }}
                            >
                                <Typography variant="body1">
                                    Seleziona una conversazione per leggere i messaggi.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

export default ChatPage;
