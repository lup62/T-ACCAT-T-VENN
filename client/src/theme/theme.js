import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#2e7d32",
        },
        secondary: {
            main: "#ffb300",
        },
    },
    shape: {
        borderRadius: 12,
    },
});

export default theme;