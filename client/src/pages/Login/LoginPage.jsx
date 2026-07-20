/**
 * LoginPage.jsx  —  rotta: /login
 *
 * Form di accesso: email + password, collegato a POST /api/auth/login
 * tramite useAuth().accedi().
 */

import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import { useAuth } from "../../hooks/useAuth";

function LoginPage() {
    const navigate = useNavigate();
    const { accedi } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitErrore, setSubmitErrore] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitErrore("");

        setSubmitLoading(true);
        try {
            await accedi(email, password);
            navigate("/");
        } catch (error) {
            setSubmitErrore(error.message || "Accesso fallito. Riprova.");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Box sx={{ px: { xs: 2, md: 10 }, py: { xs: 4, md: 6 } }}>
            <Paper
                elevation={2}
                sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, maxWidth: 420, mx: "auto" }}
            >
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                    Accedi
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />

                    {submitErrore && (
                        <Alert severity="error" variant="outlined">
                            {submitErrore}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitLoading}
                        sx={{ mt: 1 }}
                    >
                        {submitLoading ? <CircularProgress size={24} color="inherit" /> : "Accedi"}
                    </Button>

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
                        Non hai un account?{" "}
                        <Box component={RouterLink} to="/register" sx={{ color: "primary.main", fontWeight: 600 }}>
                            Registrati
                        </Box>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default LoginPage;
