/**
 * MieiAnnunciPage.jsx  —  rotta: /annunci/miei
 *
 * "I miei annunci": tutti gli annunci creati dall'utente autenticato
 * (GET /api/annunci/miei), in qualunque stato. I chip in alto filtrano
 * per stato lato client, così i conteggi restano visibili.
 *
 * Azioni disponibili sulla card in base allo stato:
 *   - aperto   → "Chiudi annuncio" (con dialog di conferma: il backend
 *                rifiuta in automatico le proposte in attesa)
 *   - in_corso → "Concludi lavoro" (stessa azione della pagina proposte)
 *
 * Accessibile solo agli utenti autenticati (stesso guard di PropostePage).
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useAuth } from "../../../hooks/useAuth";
import { getAnnunciMiei, chiudiAnnuncio, concludiAnnuncio } from "../../../services/annunci";
import AnnuncioCard from "../ListaAnnunci/AnnuncioCard";
import StatoVuoto from "../ListaAnnunci/StatoVuoto";
import SnackbarAvviso from "../../../components/SnackbarAvviso";

const FILTRI_STATO = [
    { valore: "tutti", label: "Tutti" },
    { valore: "aperto", label: "Aperti" },
    { valore: "in_corso", label: "In corso" },
    { valore: "concluso", label: "Conclusi" },
    { valore: "chiuso", label: "Chiusi" },
];

// Stesso abbinamento delle pagine lista: offerte = secondary, cercasi = primary.
const COLOR_TIPO = {
    richiesta_manodopera: "secondary",
    disponibilita_lavoro: "primary",
};

function MieiAnnunciPage() {
    const navigate = useNavigate();
    const { isLoggedIn, accessToken, inizializzazione } = useAuth();

    const [annunci, setAnnunci] = useState(null); // null = in caricamento
    const [erroreCaricamento, setErroreCaricamento] = useState("");
    const [filtroStato, setFiltroStato] = useState("tutti");
    const [azioneInCorsoId, setAzioneInCorsoId] = useState(null);
    const [notifica, setNotifica] = useState(null); // { severity, testo }
    // Annuncio in attesa di conferma di chiusura — null = dialog chiuso.
    const [daChiudere, setDaChiudere] = useState(null);

    const carica = useCallback(async () => {
        try {
            setAnnunci(await getAnnunciMiei(accessToken));
            setErroreCaricamento("");
        } catch (err) {
            setErroreCaricamento(err.message);
            setAnnunci([]);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- carica aggiorna lo stato solo dopo la richiesta asincrona.
            void carica();
        }
    }, [accessToken, carica]);

    // Chiude o conclude l'annuncio e ricarica la lista, così chip di
    // stato e conteggi dei filtri restano coerenti col backend.
    const esegui = async (annuncio, azione) => {
        setAzioneInCorsoId(annuncio._id);
        try {
            await (azione === "chiudi"
                ? chiudiAnnuncio(annuncio._id, accessToken)
                : concludiAnnuncio(annuncio._id, accessToken));
            setNotifica({
                severity: "success",
                testo: azione === "chiudi" ? "Annuncio chiuso." : "Lavoro concluso!",
            });
            await carica();
        } catch (err) {
            setNotifica({ severity: "error", testo: err.message });
        } finally {
            setAzioneInCorsoId(null);
        }
    };

    const confermaChiusura = () => {
        const annuncio = daChiudere;
        setDaChiudere(null);
        esegui(annuncio, "chiudi");
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
                        Per vedere e gestire i tuoi annunci devi avere un account e aver effettuato l'accesso.
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

    const caricamento = annunci === null;
    const conteggioPerStato = (stato) =>
        stato === "tutti"
            ? annunci?.length
            : annunci?.filter((a) => a.stato === stato).length;
    const annunciFiltrati = caricamento
        ? []
        : filtroStato === "tutti"
        ? annunci
        : annunci.filter((a) => a.stato === filtroStato);

    // Azioni contestuali allo stato, rese dentro la card.
    const azioniPerAnnuncio = (annuncio) => {
        const inVolo = azioneInCorsoId === annuncio._id;
        if (annuncio.stato === "aperto") {
            return (
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={inVolo}
                    onClick={() => setDaChiudere(annuncio)}
                >
                    {inVolo ? <CircularProgress size={22} color="inherit" /> : "Chiudi annuncio"}
                </Button>
            );
        }
        if (annuncio.stato === "in_corso") {
            return (
                <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    disabled={inVolo}
                    onClick={() => esegui(annuncio, "concludi")}
                >
                    {inVolo ? <CircularProgress size={22} color="inherit" /> : "Concludi lavoro"}
                </Button>
            );
        }
        return null;
    };

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 0.5, flexWrap: "wrap" }}>
                <Typography variant="h4" component="h1">
                    I miei annunci
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/annunci/nuovo")}
                    sx={{ ml: "auto" }}
                >
                    Pubblica annuncio
                </Button>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Gli annunci che hai pubblicato, in ogni stato.
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 3, flexWrap: "wrap" }}>
                {FILTRI_STATO.map(({ valore, label }) => (
                    <Chip
                        key={valore}
                        label={caricamento ? label : `${label} (${conteggioPerStato(valore)})`}
                        color={filtroStato === valore ? "primary" : "default"}
                        variant={filtroStato === valore ? "filled" : "outlined"}
                        onClick={() => setFiltroStato(valore)}
                    />
                ))}
            </Stack>

            {caricamento ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : erroreCaricamento ? (
                <StatoVuoto
                    titolo="Impossibile caricare i tuoi annunci"
                    descrizione={erroreCaricamento}
                />
            ) : annunciFiltrati.length === 0 ? (
                <StatoVuoto
                    titolo="Nessun annuncio"
                    descrizione={
                        filtroStato === "tutti"
                            ? "Non hai ancora pubblicato annunci. Inizia con \"Pubblica annuncio\"."
                            : "Nessun annuncio in questo stato."
                    }
                />
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            lg: "repeat(3, 1fr)",
                        },
                        gap: 3,
                    }}
                >
                    {annunciFiltrati.map((annuncio) => (
                        <AnnuncioCard
                            key={annuncio._id}
                            annuncio={annuncio}
                            color={COLOR_TIPO[annuncio.tipo] ?? "primary"}
                            azioni={azioniPerAnnuncio(annuncio)}
                        />
                    ))}
                </Box>
            )}

            {/* Conferma di chiusura: azione irreversibile che rifiuta le proposte */}
            <Dialog open={!!daChiudere} onClose={() => setDaChiudere(null)}>
                <DialogTitle>Chiudere l'annuncio?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "{daChiudere?.titolo}" non sarà più visibile e le proposte
                        ancora in attesa verranno rifiutate automaticamente.
                        L'operazione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => setDaChiudere(null)}>
                        Annulla
                    </Button>
                    <Button variant="contained" color="error" onClick={confermaChiusura}>
                        Chiudi annuncio
                    </Button>
                </DialogActions>
            </Dialog>

            <SnackbarAvviso
                testo={notifica?.testo ?? ""}
                severity={notifica?.severity}
                onClose={() => setNotifica(null)}
            />
        </Box>
    );
}

export default MieiAnnunciPage;
