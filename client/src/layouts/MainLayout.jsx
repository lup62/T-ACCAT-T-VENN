import {Outlet} from "react-router-dom"
import Navbar from "../components/Navbar"

function MainLayout(){
    return (
        <div>
            <header>
                <Navbar />
            </header>
            <main>
                <Outlet />
            </main>
            <footer>Footer</footer>
        </div>
    );
}

export default MainLayout;
