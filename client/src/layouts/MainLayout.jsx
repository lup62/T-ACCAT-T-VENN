import {Outlet} from "react-router-dom"

function MainLayout(){
    return (
        <div>
            <header>Navbar</header>
            <main>
                <Outlet />
            </main>
            <footer>Footer</footer>
        </div>
    );
}

export default MainLayout;
