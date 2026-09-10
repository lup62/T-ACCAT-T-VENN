import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    IconButton,
    Paper,
    Slider,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";

import {
    PROVINCE_PUGLIA,
    TIPI_LAVORO,
} from "../Annunci/annunciConstants";

import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useAuth } from "../../hooks/useAuth";
import {
    eliminaRicercaSalvata,
    getRicercheSalvate,
    modificaRicercaSalvata,
} from "../../services/ricercheSalvate";
import SnackbarAvviso from "../../components/SnackbarAvviso";

function formattaData(data) {
    if (!data) return null;

    return new Intl.DateTimeFormat("it-IT").format(
        new Date(data)
    );
}

function etichettaTipoAnnuncio(tipoAnnuncio) {
    if (tipoAnnuncio === "richiesta_manodopera") {
        return "Offerte di lavoro";
    }

    if (tipoAnnuncio === "disponibilita_lavoro") {
        return "Cerca personale";
    }

    return tipoAnnuncio;
}

function RicercheSalvatePage() {
    const navigate = useNavigate();

    const {
        isLoggedIn,
        accessToken,
        inizializzazione,
    } = useAuth();

    const [ricerche, setRicerche] = useState(null);
    const [erroreCaricamento, setErroreCaricamento] = useState("");
    const [operazioneInCorsoId, setOperazioneInCorsoId] = useState(null);
    const [ricercaInModifica, setRicercaInModifica] = useState(null);
    const [formModifica, setFormModifica] = useState(null);
    const [notifica, setNotifica] = useState(null);

    useEffect(() => {
        if (!accessToken) return;

        getRicercheSalvate(accessToken)
            .then((lista) => {
                setRicerche(lista);
                setErroreCaricamento("");
            })
            .catch((error) => {
                setErroreCaricamento(error.message);
                setRicerche([]);
            });
    }, [accessToken]);

    const apriModifica = (ricerca) => {
        setRicercaInModifica(ricerca);

        setFormModifica({
            nome: ricerca.nome || "",
            ricerca: ricerca.ricerca || "",
            filtri: {
                tipiLavoro: ricerca.filtri?.tipiLavoro || [],
                province: ricerca.filtri?.province || [],
                prezzoRange: ricerca.filtri?.prezzoRange || [0, 200],
                periodoInizio:
                    ricerca.filtri?.periodoInizio?.slice(0, 10) || "",
                periodoFine:
                    ricerca.filtri?.periodoFine?.slice(0, 10) || "",
            },
        });
    };

    const chiudiModifica = () => {
        setRicercaInModifica(null);
        setFormModifica(null);
    };

    const toggleFiltroArray = (campo, valore) => {
        setFormModifica((corrente) => {
            const valori = corrente.filtri[campo];

            const aggiornati = valori.includes(valore)
                ? valori.filter((elemento) => elemento !== valore)
                : [...valori, valore];

            return {
                ...corrente,
                filtri: {
                    ...corrente.filtri,
                    [campo]: aggiornati,
                },
            };
        });
    };

    const salvaModificheRicerca = async () => {
        if (!ricercaInModifica || !formModifica) return;

        const {
            periodoInizio,
            periodoFine,
        } = formModifica.filtri;

        if (
            periodoInizio &&
            periodoFine &&
            periodoFine < periodoInizio
        ) {
            setNotifica({
                severity: "error",
                testo: "La data finale non può precedere quella iniziale.",
            });
            return;
        }

        setOperazioneInCorsoId(ricercaInModifica._id);

        try {
            const aggiornata = await modificaRicercaSalvata(
                ricercaInModifica._id,
                {
                    nome:
                        formModifica.nome.trim() ||
                        "Ricerca salvata",

                    ricerca: formModifica.ricerca.trim(),

                    filtri: {
                        ...formModifica.filtri,
                        periodoInizio:
                            periodoInizio || null,
                        periodoFine:
                            periodoFine || null,
                    },
                },
                accessToken
            );

            setRicerche((correnti) =>
                correnti.map((ricerca) =>
                    ricerca._id === aggiornata._id
                        ? aggiornata
                        : ricerca
                )
            );

            setNotifica({
                severity: "success",
                testo: "Ricerca modificata con successo.",
            });

            chiudiModifica();
        } catch (error) {
            setNotifica({
                severity: "error",
                testo: error.message,
            });
        } finally {
            setOperazioneInCorsoId(null);
        }
    };

    const cambiaStatoRicerca = async (ricerca) => {
        setOperazioneInCorsoId(ricerca._id);

        try {
            const aggiornata = await modificaRicercaSalvata(
                ricerca._id,
                {
                    attiva: !ricerca.attiva,
                },
                accessToken
            );

            setRicerche((correnti) =>
                correnti.map((elemento) =>
                    elemento._id === aggiornata._id
                        ? aggiornata
                        : elemento
                )
            );

            setNotifica({
                severity: "success",
                testo: aggiornata.attiva
                    ? "Ricerca riattivata."
                    : "Ricerca disattivata.",
            });
        } catch (error) {
            setNotifica({
                severity: "error",
                testo: error.message,
            });
        } finally {
            setOperazioneInCorsoId(null);
        }
    };

    const eliminaRicerca = async (ricerca) => {
        const confermata = window.confirm(
            `Eliminare definitivamente la ricerca "${ricerca.nome}"?`
        );

        if (!confermata) return;

        setOperazioneInCorsoId(ricerca._id);

        try {
            await eliminaRicercaSalvata(
                ricerca._id,
                accessToken
            );

            setRicerche((correnti) =>
                correnti.filter(
                    (elemento) =>
                        elemento._id !== ricerca._id
                )
            );

            setNotifica({
                severity: "success",
                testo: "Ricerca salvata eliminata.",
            });
        } catch (error) {
            setNotifica({
                severity: "error",
                testo: error.message,
            });
        } finally {
            setOperazioneInCorsoId(null);
        }
    };

    if (inizializzazione) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 12,
                }}
            >
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!isLoggedIn) {
        return (
            <Box
                sx={{
                    px: { xs: 2, md: 10 },
                    py: { xs: 4, md: 6 },
                }}
            >
                <Paper
                    elevation={2}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 3,
                        maxWidth: 600,
                        mx: "auto",
                        textAlign: "center",
                    }}
                >
                    <LockOutlinedIcon
                        sx={{
                            fontSize: 56,
                            color: "primary.main",
                            mb: 2,
                        }}
                    />

                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ mb: 1 }}
                    >
                        Devi essere registrato
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        Accedi per visualizzare e gestire le tue
                        ricerche salvate.
                    </Typography>

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate("/login")}
                        >
                            Accedi
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Registrati
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                px: {
                    xs: 2,
                    sm: 3,
                    md: 10,
                },
                py: {
                    xs: 4,
                    md: 6,
                },
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                sx={{ mb: 0.5 }}
            >
                Ricerche salvate
            </Typography>

            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                Gestisci le ricerche per cui vuoi ricevere
                notifiche quando vengono pubblicati nuovi annunci
                compatibili.
            </Typography>

            {erroreCaricamento && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {erroreCaricamento}
                </Alert>
            )}

            {ricerche === null ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 10,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : ricerche.length === 0 ? (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 8,
                    }}
                >
                    <BookmarkBorderIcon
                        sx={{
                            fontSize: 48,
                            color: "text.disabled",
                            mb: 1,
                        }}
                    />

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Non hai ancora salvato nessuna ricerca.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() =>
                            navigate("/annunci/offerte")
                        }
                    >
                        Cerca annunci
                    </Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {ricerche.map((ricerca) => {
                        const filtri = ricerca.filtri || {};
                        const tipiLavoro =
                            filtri.tipiLavoro || [];
                        const province =
                            filtri.province || [];

                        const operazioneInCorso =
                            operazioneInCorsoId ===
                            ricerca._id;

                        return (
                            <Paper
                                key={ricerca._id}
                                elevation={2}
                                sx={{
                                    p: {
                                        xs: 2.5,
                                        md: 3,
                                    },
                                    borderRadius: 3,
                                    opacity:
                                        ricerca.attiva
                                            ? 1
                                            : 0.65,
                                }}
                            >
                                <Stack
                                    direction={{
                                        xs: "column",
                                        md: "row",
                                    }}
                                    spacing={3}
                                    justifyContent="space-between"
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{
                                                flexWrap:
                                                    "wrap",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                component="h2"
                                            >
                                                {ricerca.nome}
                                            </Typography>

                                            <Chip
                                                label={
                                                    ricerca.attiva
                                                        ? "Attiva"
                                                        : "Disattivata"
                                                }
                                                color={
                                                    ricerca.attiva
                                                        ? "success"
                                                        : "default"
                                                }
                                                size="small"
                                            />
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {etichettaTipoAnnuncio(
                                                ricerca.tipoAnnuncio
                                            )}
                                        </Typography>

                                        {ricerca.ricerca && (
                                            <Typography
                                                variant="body2"
                                                sx={{ mb: 2 }}
                                            >
                                                Testo:{" "}
                                                <strong>
                                                    {
                                                        ricerca.ricerca
                                                    }
                                                </strong>
                                            </Typography>
                                        )}

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            useFlexGap
                                            flexWrap="wrap"
                                        >
                                            {tipiLavoro.map(
                                                (tipo) => (
                                                    <Chip
                                                        key={
                                                            tipo
                                                        }
                                                        label={
                                                            tipo
                                                        }
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )
                                            )}

                                            {province.map(
                                                (provincia) => (
                                                    <Chip
                                                        key={
                                                            provincia
                                                        }
                                                        label={`Provincia ${provincia}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )
                                            )}

                                            {filtri.prezzoRange && (
                                                <Chip
                                                    label={`${filtri.prezzoRange[0]}–${filtri.prezzoRange[1]} €/giorno`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}

                                            {filtri.periodoInizio && (
                                                <Chip
                                                    label={`Da ${formattaData(
                                                        filtri.periodoInizio
                                                    )}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}

                                            {filtri.periodoFine && (
                                                <Chip
                                                    label={`A ${formattaData(
                                                        filtri.periodoFine
                                                    )}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </Box>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent={{
                                            xs: "space-between",
                                            md: "flex-end",
                                        }}
                                    >

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disabled={operazioneInCorso}
                                            onClick={() => apriModifica(ricerca)}
                                        >
                                            Modifica
                                        </Button>

                                        <FormControlLabel
                                            label={
                                                ricerca.attiva
                                                    ? "Attiva"
                                                    : "Disattivata"
                                            }
                                            control={
                                                <Switch
                                                    checked={
                                                        ricerca.attiva
                                                    }
                                                    disabled={
                                                        operazioneInCorso
                                                    }
                                                    onChange={() =>
                                                        cambiaStatoRicerca(
                                                            ricerca
                                                        )
                                                    }
                                                />
                                            }
                                        />

                                        <IconButton
                                            color="error"
                                            aria-label="Elimina ricerca"
                                            disabled={
                                                operazioneInCorso
                                            }
                                            onClick={() =>
                                                eliminaRicerca(
                                                    ricerca
                                                )
                                            }
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            )}

            <Dialog
                open={Boolean(ricercaInModifica)}
                onClose={chiudiModifica}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Modifica ricerca
                </DialogTitle>

                <DialogContent>
                    {formModifica && (
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            {/* Nome della ricerca */}
                            <TextField
                                label="Nome ricerca"
                                fullWidth
                                value={formModifica.nome}
                                onChange={(event) =>
                                    setFormModifica((corrente) => ({
                                        ...corrente,
                                        nome: event.target.value,
                                    }))
                                }
                            />

                            {/* Testo cercato in titolo/descrizione */}
                            <TextField
                                label="Testo ricerca"
                                fullWidth
                                placeholder="Es. raccolta olive"
                                value={formModifica.ricerca}
                                onChange={(event) =>
                                    setFormModifica((corrente) => ({
                                        ...corrente,
                                        ricerca: event.target.value,
                                    }))
                                }
                            />

                            <Divider />

                            {/* Tipo di lavoro */}
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{ mb: 1 }}
                                >
                                    Tipo di lavoro
                                </Typography>

                                <FormGroup row>
                                    {TIPI_LAVORO.map((tipo) => (
                                        <FormControlLabel
                                            key={tipo}
                                            label={tipo}
                                            control={
                                                <Checkbox
                                                    checked={formModifica.filtri.tipiLavoro.includes(
                                                        tipo
                                                    )}
                                                    onChange={() =>
                                                        toggleFiltroArray(
                                                            "tipiLavoro",
                                                            tipo
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                    ))}
                                </FormGroup>
                            </Box>

                            <Divider />

                            {/* Province */}
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{ mb: 1 }}
                                >
                                    Provincia
                                </Typography>

                                <FormGroup row>
                                    {PROVINCE_PUGLIA.map(
                                        ({ codice, nome }) => (
                                            <FormControlLabel
                                                key={codice}
                                                label={`${nome} (${codice})`}
                                                control={
                                                    <Checkbox
                                                        checked={formModifica.filtri.province.includes(
                                                            codice
                                                        )}
                                                        onChange={() =>
                                                            toggleFiltroArray(
                                                                "province",
                                                                codice
                                                            )
                                                        }
                                                    />
                                                }
                                            />
                                        )
                                    )}
                                </FormGroup>
                            </Box>

                            <Divider />

                            {/* Prezzo */}
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{ mb: 1 }}
                                >
                                    Compenso:{" "}
                                    {formModifica.filtri.prezzoRange[0]}–
                                    {formModifica.filtri.prezzoRange[1]} €/giorno
                                </Typography>

                                <Slider
                                    value={formModifica.filtri.prezzoRange}
                                    min={0}
                                    max={200}
                                    step={5}
                                    valueLabelDisplay="auto"
                                    onChange={(_, nuovoValore) =>
                                        setFormModifica((corrente) => ({
                                            ...corrente,
                                            filtri: {
                                                ...corrente.filtri,
                                                prezzoRange: nuovoValore,
                                            },
                                        }))
                                    }
                                />
                            </Box>

                            <Divider />

                            {/* Periodo */}
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{ mb: 1.5 }}
                                >
                                    Periodo
                                </Typography>

                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    spacing={2}
                                >
                                    <TextField
                                        type="date"
                                        label="Da"
                                        fullWidth
                                        value={
                                            formModifica.filtri
                                                .periodoInizio
                                        }
                                        slotProps={{
                                            inputLabel: {
                                                shrink: true,
                                            },
                                            htmlInput: {
                                                max:
                                                    formModifica.filtri
                                                        .periodoFine ||
                                                    undefined,
                                            },
                                        }}
                                        onChange={(event) =>
                                            setFormModifica(
                                                (corrente) => ({
                                                    ...corrente,
                                                    filtri: {
                                                        ...corrente.filtri,
                                                        periodoInizio:
                                                        event.target
                                                            .value,
                                                    },
                                                })
                                            )
                                        }
                                    />

                                    <TextField
                                        type="date"
                                        label="A"
                                        fullWidth
                                        value={
                                            formModifica.filtri
                                                .periodoFine
                                        }
                                        error={Boolean(
                                            formModifica.filtri
                                                .periodoInizio &&
                                            formModifica.filtri
                                                .periodoFine &&
                                            formModifica.filtri
                                                .periodoFine <
                                            formModifica.filtri
                                                .periodoInizio
                                        )}
                                        helperText={
                                            formModifica.filtri
                                                .periodoInizio &&
                                            formModifica.filtri
                                                .periodoFine &&
                                            formModifica.filtri
                                                .periodoFine <
                                            formModifica.filtri
                                                .periodoInizio
                                                ? "La data finale non può precedere quella iniziale."
                                                : ""
                                        }
                                        slotProps={{
                                            inputLabel: {
                                                shrink: true,
                                            },
                                            htmlInput: {
                                                min:
                                                    formModifica.filtri
                                                        .periodoInizio ||
                                                    undefined,
                                            },
                                        }}
                                        onChange={(event) =>
                                            setFormModifica(
                                                (corrente) => ({
                                                    ...corrente,
                                                    filtri: {
                                                        ...corrente.filtri,
                                                        periodoFine:
                                                        event.target
                                                            .value,
                                                    },
                                                })
                                            )
                                        }
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={chiudiModifica}
                        disabled={
                            operazioneInCorsoId ===
                            ricercaInModifica?._id
                        }
                    >
                        Annulla
                    </Button>

                    <Button
                        variant="contained"
                        onClick={salvaModificheRicerca}
                        disabled={
                            operazioneInCorsoId ===
                            ricercaInModifica?._id
                        }
                    >
                        {operazioneInCorsoId ===
                        ricercaInModifica?._id
                            ? "Salvataggio..."
                            : "Salva modifiche"}
                    </Button>
                </DialogActions>
            </Dialog>

            <SnackbarAvviso
                testo={notifica?.testo ?? ""}
                severity={
                    notifica?.severity ?? "error"
                }
                onClose={() => setNotifica(null)}
            />
        </Box>
    );
}

export default RicercheSalvatePage;