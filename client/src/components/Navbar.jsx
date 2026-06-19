import {Link} from 'react-router-dom'

function Navbar(){
    return (
        <nav>
            <Link to="/">Home</Link>
            {" | "}
            <Link to="/annunci">Annunci</Link>
            {" | "}
            <Link to="/profilo">Profilo</Link>
            {" | "}
            <Link to="/chat">Chat</Link>
            {" | "}
            <Link to="/login">Login</Link>
            {" | "}
            <Link to="/register">Registrati</Link>
            {" | "}
        </nav>
    )
}

export default Navbar;