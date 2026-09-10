import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";

import AnnuncioCard from "./AnnuncioCard";
import RegistratiDialog from "../RegistratiDialog";
import StatoVuoto from "./StatoVuoto";
import FiltriAnnunci from "./FiltriAnnunci";
import MappaAnnunci from "./MappaAnnunci";

import { getAnnunci } from "../../../services/annunci";
import { creaRicercaSalvata } from "../../../services/ricercheSalvate";

import { useAnnunciFiltrati } from "../../../hooks/useAnnunciFiltrati";
import { usePreferitiAnnunci } from "../../../hooks/usePreferitiAnnunci";
import { useAuth } from "../../../hooks/useAuth";

import SnackbarAvviso from "../../../components/SnackbarAvviso";

function ListaAnnunciPage({ tipoAnnuncio, titolo, color }) {
    const navigate = useNavigate();

    const { utente, accessToken } = useAuth();

    const [annunci, setAnnunci] = useState([]);
    const [caricamento, setCaricamento] = useState(true);
    const [errore, setErrore] = useState(null);

    const [errorePreferiti, setErrorePreferiti] = useState("");

    const [avvisoRicerca, setAvvisoRicerca] = useState("");
    const [severityRicerca, setSeverityRicerca] = useState("success");
    const [salvataggioRicerca, setSalvataggioRicerca] = useState(false);

    const {
        isPreferito,
        togglePreferito,
        toggleInCorsoId,
    } = usePreferitiAnnunci();

    const toggle = async (annuncio) => {
        try {
            await togglePreferito(annuncio);
        } catch (err) {
            setErrorePreferiti(err.message);
        }
    };

    useEffect(() => {
        getAnnunci(tipoAnnuncio)
            .then(setAnnunci)
            .catch((error) => setErrore(error.message))
            .finally(() => setCaricamento(false));
    }, [tipoAnnuncio]);

    const {
        filtri,
        setFiltri,
        ricerca,
        setRicerca,
        ordinamento,
        setOrdinamento,
        vistaLista,
        setVistaLista,
        filtriDrawerOpen,
        setFiltriDrawerOpen,
        dialogOpen,
        setDialogOpen,
        isLoggedIn,
        annunciFiltrati,
        annunciDaMostrare,
        hasMore,
    } = useAnnunciFiltrati(annunci);

    const salvaRicercaCorrente = async () => {
        if (!isLoggedIn || !accessToken) {
            setDialogOpen(true);
            return;
        }

        try {
            setSalvataggioRicerca(true);

            await creaRicercaSalvata(
                {
                    nome: ricerca.trim() || titolo,
                    tipoAnnuncio,
                    ricerca: ricerca.trim(),
                    filtri: {
                        ...filtri,
                        periodoInizio: filtri.periodoInizio || null,
                        periodoFine: filtri.periodoFine || null,
                    },
                },
                accessToken
            );

            setSeverityRicerca("success");
            setAvvisoRicerca("Ricerca salvata con successo.");
        } catch (error) {
            setSeverityRicerca("error");
            setAvvisoRicerca(error.message);
        } finally {
            setSalvataggioRicerca(false);
        }
    };

    return (
        <Box
            sx={{
                px: { xs: 3, md: 10 },
                py: { xs: 4, md: 6 },
            }}
        >
            {/* Titolo + controlli desktop */}
            <Stack
                direction="row"
                alignItems="center"
                gap={2}
                sx={{
                    mb: 4,
                    flexWrap: "wrap",
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        display: "inline-block",
                        bgcolor: `${color}.main`,
                        color: "#FFFFFF",
                        px: 3,
                        py: 1,
                        borderRadius: 1,
                        width: { xs: "100%", sm: "auto" },
                    }}
                >
                    {titolo}
                </Typography>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        ml: "auto",
                        display: { xs: "none", md: "flex" },
                    }}
                >
                    <Button
                        variant="outlined"
                        color={color}
                        startIcon={<BookmarkAddOutlinedIcon />}
                        onClick={salvaRicercaCorrente}
                        disabled={salvataggioRicerca}
                    >
                        {salvataggioRicerca
                            ? "Salvataggio..."
                            : "Salva ricerca"}
                    </Button>

                    <Button
                        variant="contained"
                        color={color}
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/annunci/nuovo")}
                    >
                        Pubblica annuncio
                    </Button>

                    <Button
                        variant={vistaLista ? "contained" : "outlined"}
                        color={color}
                        onClick={() => setVistaLista(true)}
                        sx={{
                            minWidth: { xs: 44, sm: "auto" },
                            px: { xs: 1, sm: 2.5 },
                        }}
                    >
                        <ViewListIcon
                            fontSize="small"
                            sx={{
                                mr: { xs: 0, sm: 1 },
                            }}
                        />

                        <Box
                            component="span"
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "inline",
                                },
                            }}
                        >
                            Lista
                        </Box>
                    </Button>

                    <Button
                        variant={!vistaLista ? "contained" : "outlined"}
                        color={color}
                        onClick={() => setVistaLista(false)}
                        sx={{
                            minWidth: { xs: 44, sm: "auto" },
                            px: { xs: 1, sm: 2.5 },
                        }}
                    >
                        <MapIcon
                            fontSize="small"
                            sx={{
                                mr: { xs: 0, sm: 1 },
                            }}
                        />

                        <Box
                            component="span"
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "inline",
                                },
                            }}
                        >
                            Mappa
                        </Box>
                    </Button>
                </Stack>
            </Stack>

            {/* Ricerca testuale + ordinamento */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 4 }}
            >
                <TextField
                    fullWidth
                    placeholder="Cerca per titolo o descrizione..."
                    value={ricerca}
                    onChange={(event) =>
                        setRicerca(event.target.value)
                    }
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Ordina per</InputLabel>

                    <Select
                        value={ordinamento}
                        label="Ordina per"
                        onChange={(event) =>
                            setOrdinamento(event.target.value)
                        }
                    >
                        <MenuItem value="recenti">
                            Più recenti
                        </MenuItem>

                        <MenuItem value="vecchi">
                            Più vecchi
                        </MenuItem>

                        <MenuItem value="prezzoAsc">
                            Prezzo crescente
                        </MenuItem>

                        <MenuItem value="prezzoDesc">
                            Prezzo decrescente
                        </MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {/* Controlli mobile */}
            <Stack
                direction="row"
                alignItems="center"
                sx={{
                    display: {
                        xs: "flex",
                        md: "none",
                    },
                    mb: 2,
                }}
            >
                <IconButton
                    onClick={() => setFiltriDrawerOpen(true)}
                    sx={{
                        border: 1,
                        borderColor: `${color}.main`,
                        borderRadius: 2,
                        color: `${color}.main`,
                    }}
                >
                    <MenuIcon />
                </IconButton>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ ml: "auto" }}
                >
                    {/* Salva ricerca - mobile */}
                    <Button
                        variant="outlined"
                        color={color}
                        onClick={salvaRicercaCorrente}
                        disabled={salvataggioRicerca}
                        sx={{
                            minWidth: 44,
                            px: 1,
                        }}
                    >
                        <BookmarkAddOutlinedIcon fontSize="small" />
                    </Button>

                    <Button
                        variant="contained"
                        color={color}
                        onClick={() => navigate("/annunci/nuovo")}
                        sx={{
                            minWidth: 44,
                            px: 1,
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </Button>

                    <Button
                        variant={
                            vistaLista
                                ? "contained"
                                : "outlined"
                        }
                        color={color}
                        onClick={() => setVistaLista(true)}
                        sx={{
                            minWidth: 44,
                            px: 1,
                        }}
                    >
                        <ViewListIcon fontSize="small" />
                    </Button>

                    <Button
                        variant={
                            !vistaLista
                                ? "contained"
                                : "outlined"
                        }
                        color={color}
                        onClick={() => setVistaLista(false)}
                        sx={{
                            minWidth: 44,
                            px: 1,
                        }}
                    >
                        <MapIcon fontSize="small" />
                    </Button>
                </Stack>
            </Stack>

            {/* Filtri + annunci */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    gap: 4,
                    alignItems: {
                        md: "stretch",
                    },
                }}
            >
                <FiltriAnnunci
                    filtri={filtri}
                    onFiltriChange={setFiltri}
                    color={color}
                    isLoggedIn={isLoggedIn}
                    drawerOpen={filtriDrawerOpen}
                    onDrawerClose={() =>
                        setFiltriDrawerOpen(false)
                    }
                />

                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    {caricamento ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                py: 8,
                            }}
                        >
                            <CircularProgress color={color} />
                        </Box>
                    ) : errore ? (
                        <StatoVuoto
                            titolo="Impossibile caricare gli annunci"
                            descrizione={errore}
                        />
                    ) : vistaLista ? (
                        annunciFiltrati.length === 0 ? (
                            <StatoVuoto
                                titolo="Nessun annuncio trovato"
                                descrizione="Nessun annuncio corrisponde ai filtri selezionati. Prova a modificarli."
                            />
                        ) : (
                            <>
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
                                    {annunciDaMostrare.map(
                                        (annuncio) => (
                                            <AnnuncioCard
                                                key={annuncio._id}
                                                annuncio={annuncio}
                                                color={color}
                                                preferito={isPreferito(
                                                    annuncio._id
                                                )}
                                                onTogglePreferito={
                                                    isLoggedIn &&
                                                    annuncio
                                                        .autore
                                                        ?._id !==
                                                    utente?.id
                                                        ? toggle
                                                        : undefined
                                                }
                                                toggleInCorso={
                                                    toggleInCorsoId ===
                                                    annuncio._id
                                                }
                                            />
                                        )
                                    )}
                                </Box>

                                {hasMore && (
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            mt: 4,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            color={color}
                                            size="large"
                                            onClick={() =>
                                                setDialogOpen(true)
                                            }
                                        >
                                            Vedi altri annunci
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )
                    ) : (
                        <MappaAnnunci
                            annunci={annunciDaMostrare}
                            color={color}
                        />
                    )}
                </Box>
            </Box>

            <RegistratiDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />

            {/* Errori preferiti */}
            <SnackbarAvviso
                testo={errorePreferiti}
                onClose={() => setErrorePreferiti("")}
            />

            {/* Esito salvataggio ricerca */}
            <SnackbarAvviso
                testo={avvisoRicerca}
                severity={severityRicerca}
                onClose={() => setAvvisoRicerca("")}
            />
        </Box>
    );
}

export default ListaAnnunciPage;
