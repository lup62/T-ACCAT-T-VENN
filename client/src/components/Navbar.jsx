/**
 * Navbar.jsx
 *
 * Barra di navigazione globale, sempre visibile (sticky).
 * Su desktop/tablet (lg+) mostra i link e i bottoni Accedi/Registrati inline;
 * su mobile mostra solo l'icona menu che apre un Drawer laterale con le stesse voci.
 */

import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import AgricultureIcon from '@mui/icons-material/Agriculture';
import scrittaTaccat from "../assets/scrittaTaccat.svg"
import { useAuth } from "../hooks/useAuth";




const navLinks = [
    { label: "Home", to: "/" },
    { label: "Offerte di lavoro", to: "/annunci/offerte" },
    { label: "Cerca personale", to: "/annunci/cercasi" },
    { label: "Come funziona", to: "/#come-funziona", isAnchor: true },
];

function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isLoggedIn, utente, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate("/");
    };

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
                    position: "relative",
                }}
            >
                {/* Logo */}
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        textDecoration: "none",
                    }}
                >
                    <Box
                        component="img"
                        src={scrittaTaccat}
                        alt="T'ACCAT & T'VENN"
                        sx={{ height: 26 }}
                    />
                </Box>

                {/* Menu centrale: visibile da tablet/desktop.
                    Centrato rispetto alla barra (non allo spazio tra logo e
                    azioni, che hanno larghezze diverse). */}
                <Box
                    sx={{
                        display: {
                            xs: "none",
                            lg: "flex",
                        },
                        gap: 1,
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    {navLinks.map(({ to, label, isAnchor }) => (
                        <Button
                            key={to}
                            component={isAnchor ? "a" : RouterLink}
                            {...(isAnchor ? { href: to } : { to })}
                            color="inherit"
                        >
                            {label}
                        </Button>
                    ))}
                </Box>

                {/* Azioni utente */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    {isLoggedIn ? (
                        <>
                            <Button
                                component={RouterLink}
                                to="/preferiti"
                                color="inherit"
                                sx={{
                                    display: {
                                        xs: "none",
                                        lg: "inline-flex",
                                    },
                                }}
                            >
                                Preferiti
                            </Button>

                            <Button
                                component={RouterLink}
                                to="/proposte"
                                color="inherit"
                                sx={{
                                    display: {
                                        xs: "none",
                                        lg: "inline-flex",
                                    },
                                }}
                            >
                                Le mie proposte
                            </Button>


                            <Button
                                component={RouterLink}
                                to="/profilo"
                                color="primary"
                                variant="contained"
                                sx={{
                                    display: {
                                        xs: "none",
                                        lg: "inline-flex",
                                    },
                                }}
                                startIcon={
                                   <PersonIcon />
                                }
                            >
                                {utente?.nome}

                            </Button>

                            <Button
                                onClick={handleLogout}
                                color="inherit"
                                sx={{
                                    display: {
                                        xs: "none",
                                        lg: "inline-flex",
                                    },
                                }}
                            >
                                Esci
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                component={RouterLink}
                                to="/login"
                                color="inherit"
                                sx={{
                                    display: {
                                        xs: "none",
                                        lg: "inline-flex",
                                    },
                                }}
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
                                        lg: "inline-flex",
                                    },
                                    "&:hover": {
                                        color: "#FFFFFF",
                                    },
                                }}
                                startIcon={
                                    <AgricultureIcon />
                                }
                            >
                                Registrati
                            </Button>
                        </>
                    )}


                    {/*Modifiche per il mobile*/}
                    <IconButton
                        aria-label="Apri menu"
                        onClick={() => setMobileMenuOpen(true)}
                        sx={{
                            display: {
                                xs: "flex",
                                lg: "none",
                            },

                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Toolbar>

            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            >
                <Box sx={{ width: 280 }} role="presentation">
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Box
                                component="img"
                                src={scrittaTaccat}
                                alt="T'ACCAT & T'VENN"
                                sx={{ height: 30 }}
                            />
                        </Box>

                        <IconButton
                            aria-label="Chiudi menu"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Divider />

                    <List>
                        {navLinks.map(({ label, to, isAnchor }) => (
                            <ListItem key={to} disablePadding>
                                <ListItemButton
                                    component={isAnchor ? "a" : RouterLink}
                                    {...(isAnchor ? { href: to } : { to })}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ListItemText primary={label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <Divider />

                    {isLoggedIn ? (
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to="/preferiti"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ListItemText primary="Preferiti" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to="/proposte"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ListItemText primary="Le mie proposte" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to="/profilo"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ListItemText primary={`Profilo (${utente?.nome ?? ""})`} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleLogout}>
                                    <ListItemText primary="Esci" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    ) : (
                        <>
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        component={RouterLink}
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <ListItemText primary="Accedi" />
                                    </ListItemButton>
                                </ListItem>
                            </List>

                            <Box sx={{ px: 2, py: 1 }}>
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    sx={{
                                        "&:hover": {
                                            color: "#FFFFFF",
                                        },
                                    }}
                                    startIcon={<AgricultureIcon />}
                                >
                                    Registrati
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Drawer>
        </AppBar>
    );
}

export default Navbar;