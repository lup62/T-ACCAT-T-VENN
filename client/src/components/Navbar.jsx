import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
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
import WorkIcon from "@mui/icons-material/Work";
import farmerIcon from "../assets/farmerIcon.png"



const navLinks = [
    { label: "Home", to: "/" },
    { label: "Offerte di lavoro", to: "/annunci/lavoro" },
    { label: "Cerca personale", to: "/annunci/lavoratori" },
    { label: "Come funziona", to: "/#come-funziona", isAnchor: true },
];

function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                            lg: "flex",
                        },
                        gap: 1,
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
                            <WorkIcon color="primary" />
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700 }}
                            >
                                T&apos;ACCAT & T&apos;VENN
                            </Typography>
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
                    </Box>
                </Box>
            </Drawer>
        </AppBar>
    );
}

export default Navbar;