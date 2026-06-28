import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function RegistratiDialog({ open, onClose }) {
    const navigate = useNavigate();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
                <LockOutlinedIcon sx={{ fontSize: 48, color: "primary.main", mb: 1, display: "block", mx: "auto" }} />
                Accedi per continuare
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Registrati gratuitamente per accedere a tutte le funzionalità della piattaforma.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ flexDirection: "column", gap: 1, px: 3, pb: 3 }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/register")}
                >
                    Registrati gratis
                </Button>
                <Button
                    variant="text"
                    fullWidth
                    onClick={() => navigate("/login")}
                >
                    Hai già un account? Accedi
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RegistratiDialog;
