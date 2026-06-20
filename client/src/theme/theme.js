import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#387347",
        },
        secondary: {
            main: "#69A62D",
        },
        background: {
            default: "#F7F5EF",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#24301F",
            secondary: "#5E6658",
        },
        success: {
            main: "#69A62D",
        },
        warning: {
            main: "#F2A96D",
        },
        error: {
            main: "#BF6565",
        },
    },

    typography: {
        fontFamily: '"Montserrat Alternates", system-ui, sans-serif',
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    textTransform: "none",
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme;