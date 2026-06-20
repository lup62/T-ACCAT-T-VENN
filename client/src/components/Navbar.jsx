import { Link as RouterLink } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import farmerIcon from "../assets/farmerIcon.png"

function Navbar() {
    return (
        <AppBar
            position="sticky"
            elevation={1}
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: 72,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                {/* Logo */}
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "inherit",
                        textDecoration: "none",
                    }}
                >
                    <WorkIcon color="primary" />

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: "-0.5px",
                        }}
                    >
                        T&apos;ACCAT & T&apos;VENN
                    </Typography>
                </Box>

                {/* Menu centrale: visibile da tablet/desktop */}
                <Box
                    sx={{
                        display: {
                            xs: "none",
                            md: "flex",
                        },
                        gap: 1,
                    }}
                >
                    <Button
                        component={RouterLink}
                        to="/"
                        color="inherit"
                    >
                        Home
                    </Button>

                    <Button
                        component={RouterLink}
                        to="/annunci"
                        color="inherit"
                    >
                        Cerca annunci
                    </Button>

                    <Button
                        component={RouterLink}
                        to="/come-funziona"
                        color="inherit"
                    >
                        Come funziona
                    </Button>
                </Box>

                {/* Azioni utente */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Button
                        component={RouterLink}
                        to="/login"
                        color="inherit"
                    >
                        Accedi
                    </Button>

                    <Button
                        component={RouterLink}
                        to="/register"
                        variant="contained"
                        color="secondary"
                        sx={{
                            display: {
                                xs: "none",
                                md: "inline-flex",
                            },
                        }}
                        startIcon={
                            <Box
                                component="img"
                                src={farmerIcon}
                                alt=""
                                sx={{
                                    width: 22,
                                    height: 22,
                                }}
                            />
                        }
                    >
                        Registrati
                    </Button>


                    {/*Modifiche per il mobile*/}
                    <IconButton
                        aria-label="Apri menu"
                        sx={{
                            display: {
                                xs: "flex",
                                md: "none",
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;