/**
 * FiltriAnnunci.jsx
 *
 * Pannello filtri per le pagine lista annunci.
 *
 * Comportamento in base all'autenticazione:
 *   - isLoggedIn = false  → i filtri sono visibili ma bloccati da un overlay;
 *                           cliccando si apre il RegistratiDialog.
 *   - isLoggedIn = true   → filtri completamente interattivi.
 *
 * Layout:
 *   - Desktop (md+): sidebar fissa a sinistra, sticky sotto la Navbar.
 *   - Mobile:        bottone "Filtri" che apre un Drawer laterale.
 *
 * Props:
 *   annunci         array degli annunci della pagina (per calcolare le opzioni)
 *   filtri          stato corrente { tipiLavoro, province, prezzoRange, stati,
 *                                    periodoInizio, periodoFine }
 *   onFiltriChange  callback(nuoviFiltri) — chiamata ad ogni modifica
 *   color           "primary" | "secondary" — colore tema della pagina
 *   isLoggedIn      se false i filtri sono bloccati (default: false)
 *
 */

import { useState, useMemo } from "react";
import {
    Box,
    Button,
    Checkbox,
    Divider,
    Drawer,
    FormControlLabel,
    FormGroup,
    IconButton,
    Slider,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RegistratiDialog from "../RegistratiDialog";
import { FILTRI_INIZIALI, PROVINCE_PUGLIA } from "../annunciConstants";

function FiltriAnnunci({ annunci, filtri, onFiltriChange, color = "primary", isLoggedIn = false, drawerOpen = false, onDrawerClose = () => {} }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [dialogOpen, setDialogOpen] = useState(false);

    // Opzioni tipo lavoro uniche presenti negli annunci passati
    const opzioniTipoLavoro = useMemo(
        () => [...new Set(annunci.map((a) => a.tipoLavoro))].sort(),
        [annunci]
    );

    const toggleCheckbox = (campo, valore) => {
        const corrente = filtri[campo];
        const nuovi = corrente.includes(valore)
            ? corrente.filter((v) => v !== valore)
            : [...corrente, valore];
        onFiltriChange({ ...filtri, [campo]: nuovi });
    };

    const resetFiltri = () => onFiltriChange(FILTRI_INIZIALI);

    // Contenuto dei filtri (mostrato sia nel sidebar che nel Drawer mobile)
    const contenutoFiltri = (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Filtri</Typography>
                <Button size="small" color={color} onClick={resetFiltri}>
                    Azzera
                </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Tipo di lavoro */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Tipo di lavoro</Typography>
            <FormGroup sx={{ mb: 2 }}>
                {opzioniTipoLavoro.map((tipo) => (
                    <FormControlLabel
                        key={tipo}
                        label={tipo}
                        control={
                            <Checkbox
                                size="small"
                                color={color}
                                checked={filtri.tipiLavoro.includes(tipo)}
                                onChange={() => toggleCheckbox("tipiLavoro", tipo)}
                            />
                        }
                    />
                ))}
            </FormGroup>

            <Divider sx={{ mb: 2 }} />

            {/* Provincia: lista fissa delle province pugliesi, non dipende dagli annunci */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Provincia</Typography>
            <FormGroup sx={{ mb: 2 }}>
                {PROVINCE_PUGLIA.map(({ codice, nome }) => (
                    <FormControlLabel
                        key={codice}
                        label={`${nome} (${codice})`}
                        control={
                            <Checkbox
                                size="small"
                                color={color}
                                checked={filtri.province.includes(codice)}
                                onChange={() => toggleCheckbox("province", codice)}
                            />
                        }
                    />
                ))}
            </FormGroup>

            <Divider sx={{ mb: 2 }} />

            {/* Fascia di prezzo */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Compenso: {filtri.prezzoRange[0]}–{filtri.prezzoRange[1]} €/giorno
            </Typography>
            <Box sx={{ px: 1, mb: 2 }}>
                <Slider
                    value={filtri.prezzoRange}
                    onChange={(_, v) => onFiltriChange({ ...filtri, prezzoRange: v })}
                    min={0}
                    max={200}
                    step={5}
                    color={color}
                />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Stato annuncio */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Stato</Typography>
            <FormGroup sx={{ mb: 2 }}>
                {[
                    { valore: 'aperto', label: 'Aperto' },
                    { valore: 'in_corso', label: 'In corso' },
                    { valore: 'concluso', label: 'Concluso' },
                    { valore: 'chiuso', label: 'Chiuso' },
                ].map(({ valore, label }) => (
                    <FormControlLabel
                        key={valore}
                        label={label}
                        control={
                            <Checkbox
                                size="small"
                                color={color}
                                checked={filtri.stati.includes(valore)}
                                onChange={() => toggleCheckbox("stati", valore)}
                            />
                        }
                    />
                ))}
            </FormGroup>

            <Divider sx={{ mb: 2 }} />

            {/* Periodo di disponibilità */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Periodo</Typography>
            <Stack spacing={1.5}>
                <TextField
                    type="date"
                    label="Da"
                    size="small"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={filtri.periodoInizio}
                    onChange={(e) => onFiltriChange({ ...filtri, periodoInizio: e.target.value })}
                />
                <TextField
                    type="date"
                    label="A"
                    size="small"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={filtri.periodoFine}
                    onChange={(e) => onFiltriChange({ ...filtri, periodoFine: e.target.value })}
                />
            </Stack>
        </Box>
    );

    // Wrapper: sfoca il contenuto quando non autenticato e ci mette un overlay cliccabile sopra.
    // filter:blur() sul contenuto è più affidabile di backdropFilter sull'overlay.
    const pannello = (
        <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 3 }}>
            {/* Contenuto sfocato quando l'utente non è loggato */}
            <Box sx={{ filter: !isLoggedIn ? "blur(3px)" : "none", userSelect: "none" }}>
                {contenutoFiltri}
            </Box>

            {/* Overlay trasparente cliccabile sopra il contenuto sfocato */}
            {!isLoggedIn && (
                <Box
                    onClick={() => setDialogOpen(true)}
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                        cursor: "pointer",
                        bgcolor: "rgba(247, 245, 239, 0.45)",
                    }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 36, color: `${color}.main` }} />
                    <Typography variant="body2" fontWeight={600} textAlign="center" sx={{ px: 2 }}>
                        Accedi per usare i filtri
                    </Typography>
                    <Button variant="contained" color={color} size="small">
                        Accedi o registrati
                    </Button>
                </Box>
            )}
        </Box>
    );

    // Su mobile: solo Drawer (il bottone trigger è gestito dalla pagina padre)
    if (isMobile) {
        return (
            <>
                <Drawer anchor="left" open={drawerOpen} onClose={onDrawerClose}>
                    <Box sx={{ width: 300 }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                            <IconButton onClick={onDrawerClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        {pannello}
                    </Box>
                </Drawer>

                <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
            </>
        );
    }

    // Su desktop: sidebar fissa sticky sotto la Navbar (minHeight Navbar = 72px)
    return (
        <>
            <Box
                sx={{
                    width: 270,
                    flexShrink: 0,
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: 1,
                    alignSelf: "start",
                    position: "sticky",
                    top: 88,
                    overflow: "hidden",
                }}
            >
                {pannello}
            </Box>

            <RegistratiDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </>
    );
}

export default FiltriAnnunci;
