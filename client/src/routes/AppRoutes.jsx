
import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/Home/HomePage.jsx'
import LoginPage from '../pages/Login/LoginPage.jsx'
import RegisterPage from '../pages/Register/RegisterPage.jsx'
import AnnunciLavoroPage from '../pages/Annunci/ListaAnnunci/AnnunciLavoroPage.jsx'
import AnnunciLavoratoriPage from '../pages/Annunci/ListaAnnunci/AnnunciLavoratoriPage.jsx'
import DettaglioAnnuncioPage from '../pages/Annunci/DettaglioAnnuncio/DettaglioAnnuncioPage.jsx'
import ProfiloPage from '../pages/Profilo/ProfiloPage.jsx'
import ProfiloPubblicoPage from '../pages/Profilo/ProfiloPubblicoPage.jsx'
import ChatPage from '../pages/Chat/ChatPage.jsx'
import PrivacyPolicyPage from '../pages/Legal/PrivacyPolicyPage.jsx'
import TerminiCondizioniPage from '../pages/Legal/TerminiCondizioniPage.jsx'
import PubblicaAnnuncioPage from '../pages/Annunci/PubblicaAnnuncio/PubblicaAnnuncioPage.jsx'
import MieiAnnunciPage from '../pages/Annunci/MieiAnnunci/MieiAnnunciPage.jsx'
import PropostePage from '../pages/Proposte/PropostePage.jsx'
import PreferitiPage from '../pages/Preferiti/PreferitiPage.jsx'
import NotFoundPage from '../pages/NotFound/NotFoundPage.jsx'
import MainLayout from '../layouts/MainLayout.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'

/**
 * AppRoutes definisce tutte le rotte dell'applicazione.
 *
 * Struttura: tutte le pagine sono figlie di MainLayout (Navbar + Footer).
 *
 * Rotte annunci:
 *   /annunci/offerte  → offerte di lavoro pubblicate dai datori
 *   /annunci/cercasi  → profili di lavoratori disponibili
 *   /annunci/miei     → annunci pubblicati dall'utente autenticato
 *   /annunci/:id      → dettaglio di un singolo annuncio
 */
function AppRoutes() {
    return (
        <>
        <ScrollToTop />
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="annunci/offerte" element={<AnnunciLavoroPage />} />
                <Route path="annunci/cercasi" element={<AnnunciLavoratoriPage />} />
                <Route path="annunci/miei" element={<MieiAnnunciPage />} />
                <Route path="annunci/:id" element={<DettaglioAnnuncioPage />} />
                <Route path="profilo" element={<ProfiloPage />} />
                <Route path="utenti/:id" element={<ProfiloPubblicoPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="privacy" element={<PrivacyPolicyPage />} />
                <Route path="termini" element={<TerminiCondizioniPage />} />
                <Route path="annunci/nuovo" element={<PubblicaAnnuncioPage />} />
                <Route path="proposte" element={<PropostePage />} />
                <Route path="preferiti" element={<PreferitiPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
        </>
    );
}

export default AppRoutes
