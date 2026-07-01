// MainLayout.jsx — struttura comune a tutte le pagine (Navbar + contenuto + Footer).
// Le pagine vengono renderizzate al posto di <Outlet /> tramite le rotte figlie in AppRoutes.
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
            }}
        >
            <Navbar />

            <Box
                component="main"
                sx={{
                    flex: 1,
                    pb: { xs: 2, md: 5 },
                }}
            >
                <Outlet />
            </Box>

            <Footer />
        </Box>
    );
}

export default MainLayout;