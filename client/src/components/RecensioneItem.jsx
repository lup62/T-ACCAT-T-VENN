/**
 * RecensioneItem.jsx — riga di una recensione, riusata dove servono elenchi
 * di recensioni (profilo pubblico, dettaglio annuncio concluso).
 *
 * Props:
 *   recensione         la recensione (autore/destinatario/annuncio popolati)
 *   mostraAnnuncio     aggiunge in coda "per <titolo annuncio>" — utile nel
 *                      profilo pubblico, ridondante nel dettaglio annuncio
 *   mostraDestinatario mostra "autore → destinatario" invece del solo autore —
 *                      utile nel dettaglio annuncio, dove le recensioni sono
 *                      nelle due direzioni della stessa collaborazione
 */

import { Box, Rating, Stack, Typography } from "@mui/material";

function formatData(iso) {
    return new Date(iso).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function nomeCompleto(utente) {
    return `${utente?.nome ?? ""} ${utente?.cognome ?? ""}`.trim();
}

function RecensioneItem({ recensione, mostraAnnuncio = false, mostraDestinatario = false }) {
    return (
        <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap" }}>
                <Rating value={recensione.stelle} readOnly size="small" />
                <Typography variant="body2" fontWeight={600}>
                    {nomeCompleto(recensione.autore)}
                    {mostraDestinatario && ` → ${nomeCompleto(recensione.destinatario)}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {formatData(recensione.createdAt)}
                </Typography>
            </Stack>
            {recensione.commento && (
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {recensione.commento}
                </Typography>
            )}
            {mostraAnnuncio && recensione.annuncio?.titolo && (
                <Typography variant="caption" color="text.secondary">
                    per "{recensione.annuncio.titolo}"
                </Typography>
            )}
        </Box>
    );
}

export default RecensioneItem;
