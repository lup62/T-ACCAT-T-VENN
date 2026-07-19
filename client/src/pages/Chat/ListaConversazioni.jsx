/**
 * ListaConversazioni.jsx
 *
 * Colonna sinistra della chat: una voce per conversazione con l'altro
 * partecipante, l'eventuale annuncio di riferimento e l'anteprima
 * dell'ultimo messaggio. La lista arriva già ordinata dalla più recente.
 *
 * Props:
 *   conversazioni  lista dal backend (partecipanti e annuncio popolati)
 *   mioId          id dell'utente loggato, per capire chi è "l'altro"
 *   attivaId       id della conversazione aperta (evidenziata)
 *   onSeleziona    callback(id) al click su una voce
 */

import {
    Avatar,
    Box,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";

import { altroPartecipante, iniziali } from "./chatUtils";

// Ora per i messaggi di oggi, altrimenti data breve.
function formatOrario(iso) {
    if (!iso) return "";
    const data = new Date(iso);
    const oggi = new Date();
    if (data.toDateString() === oggi.toDateString()) {
        return data.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    }
    return data.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function ListaConversazioni({ conversazioni, mioId, attivaId, onSeleziona }) {
    return (
        <List disablePadding>
            {conversazioni.map((conversazione) => {
                const altro = altroPartecipante(conversazione, mioId);
                const ultimo = conversazione.ultimoMessaggio;
                const anteprima = ultimo
                    ? `${ultimo.mittente === mioId ? "Tu: " : ""}${ultimo.testo}`
                    : "Nessun messaggio";

                return (
                    <ListItemButton
                        key={conversazione._id}
                        selected={conversazione._id === attivaId}
                        onClick={() => onSeleziona(conversazione._id)}
                        divider
                        alignItems="flex-start"
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                                {iniziali(altro)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            disableTypography
                            primary={
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="subtitle2" noWrap>
                                        {altro
                                            ? `${altro.nome} ${altro.cognome}`
                                            : "Utente non disponibile"}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ flexShrink: 0 }}
                                    >
                                        {formatOrario(ultimo?.timestamp)}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <>
                                    {conversazione.annuncioRiferimento && (
                                        <Typography
                                            variant="caption"
                                            color="primary"
                                            noWrap
                                            sx={{ display: "block" }}
                                        >
                                            {conversazione.annuncioRiferimento.titolo}
                                        </Typography>
                                    )}
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        noWrap
                                    >
                                        {anteprima}
                                    </Typography>
                                </>
                            }
                        />
                    </ListItemButton>
                );
            })}
        </List>
    );
}

export default ListaConversazioni;
