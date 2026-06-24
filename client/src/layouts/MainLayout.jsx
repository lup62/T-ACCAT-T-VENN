import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
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

            <Container
                component="main"
                maxWidth="lg"
                sx={{
                    flex: 1,
                    pb: { xs: 2, md: 5 },
                }}
            >
                <Outlet />
            </Container>

            <Footer />
        </Box>
    );
}

export default MainLayout;