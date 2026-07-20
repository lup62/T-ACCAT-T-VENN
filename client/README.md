# T'ACCAT & T'VENN — Frontend

Interfaccia web della piattaforma, sviluppata in React con Vite.

Per le istruzioni generali del progetto (backend, database, Docker) vedere il [README principale](../README.md).

## Stack tecnologico

- **React 19** + **Vite** — UI e tooling di sviluppo
- **Material UI (MUI)** — componenti e tema grafico
- **React Router** — routing lato client
- **Leaflet / react-leaflet** — mappe interattive per gli annunci (con clustering dei marker)
- **socket.io-client** — messaggistica 1:1 in tempo reale (chat)
- **ESLint** — linting del codice

## Avvio

```bash
cd client
npm install
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`.

Altri script disponibili:

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | avvia il server di sviluppo con hot reload |
| `npm run build` | genera la build di produzione in `dist/` |
| `npm run preview` | serve localmente la build di produzione |
| `npm run lint` | esegue ESLint su tutto il progetto |

## Variabili ambiente

| Variabile | Default | Descrizione |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | URL base del backend (REST e connessione Socket.IO) |

Con il backend in locale sulla porta 3000 non serve configurare nulla: il fallback copre già il caso standard. Per puntare a un backend diverso, creare un file `.env` in `client/` con la variabile.

## Struttura del progetto

```text
src/
├── assets/          # immagini, loghi e SVG
├── components/      # componenti condivisi tra più pagine (Navbar, Footer, ...)
├── contexts/        # contesti React (AuthContext: sessione, token, refresh)
├── hooks/           # hook riutilizzabili (filtri annunci, geocoding, preferiti, socket chat)
├── layouts/         # MainLayout: Navbar + contenuto + Footer
├── pages/           # una cartella per feature, con pagine e sotto-componenti
│   ├── Annunci/     #   liste, dettaglio, pubblicazione, i miei annunci
│   ├── Chat/        #   messaggistica 1:1 (lista conversazioni + thread)
│   ├── Home/
│   ├── Legal/       #   privacy policy e termini e condizioni
│   ├── Login/
│   ├── Preferiti/
│   ├── Profilo/     #   profilo personale e profilo pubblico
│   ├── Proposte/    #   proposte inviate/ricevute, recensioni
│   └── Register/
├── routes/          # AppRoutes: definizione di tutte le rotte
├── services/        # chiamate HTTP al backend, un file per risorsa
└── theme/           # tema MUI personalizzato
```

## Rotte principali

| Rotta | Pagina |
| --- | --- |
| `/` | home |
| `/login`, `/register` | autenticazione |
| `/annunci/offerte` | offerte di lavoro pubblicate dai datori |
| `/annunci/cercasi` | profili di lavoratori disponibili |
| `/annunci/miei` | annunci dell'utente autenticato |
| `/annunci/nuovo` | pubblicazione di un nuovo annuncio |
| `/annunci/:id` | dettaglio annuncio |
| `/proposte` | proposte inviate e ricevute |
| `/preferiti` | annunci salvati |
| `/profilo` | profilo personale (modifica dati) |
| `/utenti/:id` | profilo pubblico di un utente |
| `/chat` | messaggi (con `?c=<id>` si apre una conversazione specifica) |
| `/privacy`, `/termini` | pagine legali |

## Convenzioni

- **Nomi in italiano**: pagine, componenti, funzioni e commenti seguono il dominio in italiano (es. `PubblicaAnnuncioPage`, `creaProposta`).
- **Un service per risorsa**: ogni risorsa del backend ha il suo file in `services/` (`annunci.js`, `proposte.js`, `recensioni.js`, ...), con base URL da `VITE_API_URL`.
- **Pagine per feature**: ogni cartella in `pages/` contiene la pagina e i suoi sotto-componenti specifici; ciò che è condiviso tra più feature sta in `components/`.
- **Autenticazione**: gestita da `AuthContext` (access token in memoria, refresh token via cookie); le pagine usano l'hook `useAuth`.
- **Chat**: letture via REST (`services/conversazioni.js`: lista, storico, segna-letti), invio e ricezione in tempo reale via Socket.IO (`hooks/useChatSocket.js`, autenticato con l'access token nel handshake). I nuovi messaggi arrivano con l'evento `messaggio:nuovo` a chi è entrato nella stanza della conversazione.


