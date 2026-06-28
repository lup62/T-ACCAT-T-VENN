import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {

        //palette di riferimento da Adobe Color: https://color.adobe.com/explore?q=farm&color-palette=387347%2C69A62D%2CD5D962%2CF29E6D%2CBF6565&color-palette-name=My+Color+Theme

        primary: {
            main: "#387347",
        },
        secondary: {
            main: "#69A62D",
            contrastText: "#FFFFFF",
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

    shape: {
        borderRadius: 16,
    },

    //font di riferimento da Google fonts: https://fonts.google.com/share?selection.family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900
    typography: {
        fontFamily: '"Montserrat Alternates", system-ui, sans-serif',
        h1: {
            fontWeight: 800,
        },
        h2: {
            fontWeight: 800,
        },
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 500,
        },
        body1: {
            fontWeight: 400,
        },
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius,
                    textTransform: "none",
                    fontWeight: 600,
                }),
                sizeLarge: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius * 1.5,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    padding: "14px 32px",
                }),
                contained: ({ ownerState, theme }) => {
                    const colorKey = ownerState.color || "primary";
                    const mainColor = theme.palette[colorKey]?.main;

                    return {
                        border: "2px solid transparent",
                        "&:hover": {
                            backgroundColor: mainColor,
                            borderColor: "#FFFFFF",
                        },
                    };
                },
            },
        },
    },
});

export default theme;