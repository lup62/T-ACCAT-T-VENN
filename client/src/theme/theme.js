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
            default: "#c1ab5f",
            paper: "#873f3f",
        },
    },
    shape: {
        borderRadius: 12,
    },
});

export default theme;