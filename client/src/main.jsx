// main.jsx — entry point Vite: monta l'app con tema MUI, router e AuthProvider globali.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {ThemeProvider} from "@mui/material/styles";
import theme from "./theme/theme.js";
import "./index.css"
import App from './App.jsx'
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { RealtimeProvider } from "./contexts/RealtimeContext.jsx";
import { NotificheProvider } from "./contexts/NotificheContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ThemeProvider theme={theme}>
          <BrowserRouter>
              <AuthProvider>
                 <RealtimeProvider>
                     <NotificheProvider>
                  <App />
                     </NotificheProvider>
                 </RealtimeProvider>
              </AuthProvider>
          </BrowserRouter>
      </ThemeProvider>
  </StrictMode>,


)
