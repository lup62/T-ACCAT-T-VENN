import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/Home/HomePage.jsx'
import LoginPage from '../pages/Login/LoginPage.jsx'
import RegisterPage from '../pages/Register/RegisterPage.jsx'
import AnnunciPage from '../pages/Annunci/AnnunciPage.jsx'
import ProfiloPage from '../pages/Profilo/ProfiloPage.jsx'
import ChatPage from '../pages/Chat/ChatPage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/annunci" element={<AnnunciPage />} />
      <Route path="/profilo" element={<ProfiloPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}

export default AppRoutes
