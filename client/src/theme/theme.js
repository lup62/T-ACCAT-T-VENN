import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#2e7d32",
        },
        secondary: {
            main: "#ffb300",
        },
        background: {
            default: "#f8f7f2",
            paper: "#ffffff",
        },
    },
    shape: {
        borderRadius: 12,
    },
});

export default theme;