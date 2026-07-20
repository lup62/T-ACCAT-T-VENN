/**
 * SnackbarAvviso.jsx — snackbar di esito riusata in tutta l'app
 * (errori preferiti, conferma proposta inviata, rimozione preferito...).
 *
 * Props:
 *   testo     messaggio da mostrare; stringa vuota = snackbar chiusa
 *   severity  "success" | "error" | "warning" | "info" (default "error")
 *   onClose   callback che azzera il testo nello stato del padre
 *
 * La snackbar si apre/chiude in base al testo, così il padre gestisce
 * un solo pezzo di stato (la stringa) invece di open + messaggio.
 */

import { Alert, Snackbar } from "@mui/material";

function SnackbarAvviso({ testo, severity = "error", onClose }) {
    return (
        <Snackbar
            open={!!testo}
            autoHideDuration={5000}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
                {testo}
            </Alert>
        </Snackbar>
    );
}

export default SnackbarAvviso;
