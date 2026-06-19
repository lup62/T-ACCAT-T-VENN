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
            default: "#9e8727",
            paper: "#ae4c4c",
        },
    },
    shape: {
        borderRadius: 12,
    },
});

export default theme;