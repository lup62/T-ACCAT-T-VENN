import {Link} from 'react-router-dom'
import { AppBar, Toolbar, Typography } from "@mui/material";

function Navbar() {
    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography variant="h6">
                    T&apos;ACCAT
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;