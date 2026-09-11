import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifiche } from "../hooks/useNotifiche";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

function NotificationMenu() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [erroreAzione, setErroreAzione] = useState("");
    const [eliminazioneInCorsoId, setEliminazioneInCorsoId] =
        useState(null);

    const {
        notifiche,
        nonLette,
        caricamento,
        errore,
        marcaComeLetta,
        marcaTutteComeLette,
        elimina,
    } = useNotifiche();

    const menuAperto = Boolean(anchorEl);

    const apriMenu = (event) => {
        setAnchorEl(event.currentTarget);
        setErroreAzione("");
    };

    const chiudiMenu = () => {
        setAnchorEl(null);
    };

    const gestisciClickNotifica = async (notifica) => {
        const annuncioId =
            typeof notifica.annuncio === "object"
                ? notifica.annuncio?._id
                : notifica.annuncio;

        if (!annuncioId) {
            setErroreAzione(
                "Annuncio associato alla notifica non disponibile."
            );
            return;
        }

        try {
            setErroreAzione("");

            if (!notifica.letta) {
                await marcaComeLetta(notifica._id);
            }

            chiudiMenu();
            navigate(`/annunci/${annuncioId}`);
        } catch (error) {
            setErroreAzione(error.message);
        }
    };

    const gestisciLeggiTutte = async () => {
        try {
            setErroreAzione("");
            await marcaTutteComeLette();
        } catch (error) {
            setErroreAzione(error.message);
        }
    };

    const gestisciElimina = async (event, notifica) => {
        event.stopPropagation();

        try {
            setErroreAzione("");
            setEliminazioneInCorsoId(notifica._id);

            await elimina(notifica._id);
        } catch (error) {
            setErroreAzione(error.message);
        } finally {
            setEliminazioneInCorsoId(null);
        }
    };

    return (
        <>
            <IconButton
                color="inherit"
                aria-label="Notifiche"
                onClick={apriMenu}
            >
                <Badge
                    badgeContent={nonLette}
                    color="error"
                    max={99}
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={menuAperto}
                onClose={chiudiMenu}
                slotProps={{
                    paper: {
                        sx: {
                            width: 380,
                            maxWidth: "calc(100vw - 24px)",
                            maxHeight: 520,
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                    }}
                >
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Notifiche
                    </Typography>

                    <Button
                        size="small"
                        disabled={nonLette === 0}
                        onClick={gestisciLeggiTutte}
                    >
                        Segna tutte come lette
                    </Button>
                </Box>

                <Divider />

                {(errore || erroreAzione) && (
                    <Typography
                        variant="body2"
                        color="error"
                        sx={{ px: 2, py: 1 }}
                    >
                        {erroreAzione || errore}
                    </Typography>
                )}

                {caricamento ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 3,
                        }}
                    >
                        <CircularProgress size={28} />
                    </Box>
                ) : notifiche.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ px: 2, py: 3 }}
                    >
                        Non hai ancora notifiche.
                    </Typography>
                ) : (
                    notifiche.slice(0, 10).map((notifica) => (
                        <MenuItem
                            key={notifica._id}
                            onClick={() =>
                                gestisciClickNotifica(notifica)
                            }
                            sx={{
                                alignItems: "flex-start",
                                whiteSpace: "normal",
                                py: 1.5,
                                bgcolor: notifica.letta
                                    ? "transparent"
                                    : "action.hover",
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{
                                    width: "100%",
                                    alignItems: "flex-start",
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        bgcolor: notifica.letta
                                            ? "transparent"
                                            : "primary.main",
                                        mt: 0.8,
                                        flexShrink: 0,
                                    }}
                                />

                                <Box
                                    sx={{
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={
                                            notifica.letta
                                                ? 500
                                                : 700
                                        }
                                    >
                                        {notifica.titolo}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {notifica.messaggio}
                                    </Typography>
                                </Box>

                                <IconButton
                                    size="small"
                                    aria-label="Elimina notifica"
                                    disabled={
                                        eliminazioneInCorsoId ===
                                        notifica._id
                                    }
                                    onClick={(event) =>
                                        gestisciElimina(
                                            event,
                                            notifica
                                        )
                                    }
                                >
                                    {eliminazioneInCorsoId ===
                                    notifica._id ? (
                                        <CircularProgress size={18} />
                                    ) : (
                                        <DeleteOutlinedIcon
                                            fontSize="small"
                                        />
                                    )}
                                </IconButton>
                            </Stack>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}

export default NotificationMenu;