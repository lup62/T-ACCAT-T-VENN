import {Link} from 'react-router-dom'
import { AppBar, Toolbar, Typography } from "@mui/material";

function Navbar() {
    return (
        <AppBar
            position="sticky"
            elevation={1}
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
            }}
        >
            <Toolbar>
                <Typography variant="h6">
                    T&apos;ACCAT
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;