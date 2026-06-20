import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {

        //palette di riferimento da Adobe Color: https://color.adobe.com/explore?q=farm&color-palette=387347%2C69A62D%2CD5D962%2CF29E6D%2CBF6565&color-palette-name=My+Color+Theme

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

    //font di riferimento da Google fonts: https://fonts.google.com/share?selection.family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900
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