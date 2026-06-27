import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/Home/HomePage.jsx'
import LoginPage from '../pages/Login/LoginPage.jsx'
import RegisterPage from '../pages/Register/RegisterPage.jsx'
import AnnunciLavoroPage from '../pages/Annunci/AnnunciLavoroPage.jsx'
import AnnunciLavoratoriPage from '../pages/Annunci/AnnunciLavoratoriPage.jsx'
import DettaglioAnnuncioPage from '../pages/Annunci/DettaglioAnnuncioPage.jsx'
import ProfiloPage from '../pages/Profilo/ProfiloPage.jsx'
import ChatPage from '../pages/Chat/ChatPage.jsx'
import MainLayout from '../layouts/MainLayout.jsx'

/**
 * AppRoutes definisce tutte le rotte dell'applicazione.
 *
 * Struttura: tutte le pagine sono figlie di MainLayout (Navbar + Footer).
 *
 * Rotte annunci:
 *   /annunci/offerte  → offerte di lavoro pubblicate dai datori
 *   /annunci/cercasi  → profili di lavoratori disponibili
 *   /annunci/:id      → dettaglio di un singolo annuncio
 *
 * React Router v7 dà priorità ai path statici (offerte, cercasi) rispetto
 * al parametro dinamico (:id), quindi non c'è rischio di conflitto.
 */
function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="annunci/offerte" element={<AnnunciLavoroPage />} />
                <Route path="annunci/cercasi" element={<AnnunciLavoratoriPage />} />
                <Route path="annunci/:id" element={<DettaglioAnnuncioPage />} />
                <Route path="profilo" element={<ProfiloPage />} />
                <Route path="chat" element={<ChatPage />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes
