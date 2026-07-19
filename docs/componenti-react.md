# Componenti React — T'accatt e t'venn

Breve descrizione dei componenti del frontend (`client/`), organizzata per cartella.

**Stack:** React 19 + Vite, Material UI (tema personalizzato), React Router 7, react-leaflet + OpenStreetMap per le mappe, Nominatim per il geocoding, socket.io-client per la messaggistica in tempo reale. Le chiamate al backend usano `fetch` con base URL da `VITE_API_URL` (fallback `http://localhost:3000`); la stessa base URL è usata per la connessione Socket.IO.

**Struttura di `client/src`:**

```text
src/
├── main.jsx          entry point: ThemeProvider + BrowserRouter + AuthProvider
├── App.jsx           componente radice, monta il router
├── routes/           definizione delle rotte
├── layouts/          struttura comune delle pagine
├── components/       componenti condivisi tra più pagine
├── contexts/         stato globale (autenticazione)
├── hooks/            logica riusabile estratta dai componenti
├── services/         funzioni di chiamata alle API del backend
├── pages/            una cartella per area funzionale
└── theme/            tema MUI condiviso
```

---

## Bootstrap e routing

| File | Descrizione |
|---|---|
| `main.jsx` | Entry point Vite: monta l'app dentro `ThemeProvider` (tema MUI), `BrowserRouter` e `AuthProvider`, che così sono disponibili a tutte le pagine. |
| `App.jsx` | Componente radice: renderizza solo `AppRoutes`. |
| `routes/AppRoutes.jsx` | Dichiara tutte le rotte. Tutte le pagine sono figlie di `MainLayout` (Navbar + Footer comuni); monta anche `ScrollToTop`. |

Rotte principali:

| Rotta | Pagina |
|---|---|
| `/` | `HomePage` |
| `/login`, `/register` | `LoginPage`, `RegisterPage` |
| `/annunci/offerte` | `AnnunciLavoroPage` (offerte di lavoro dei datori) |
| `/annunci/cercasi` | `AnnunciLavoratoriPage` (disponibilità dei lavoratori) |
| `/annunci/miei` | `MieiAnnunciPage` |
| `/annunci/nuovo` | `PubblicaAnnuncioPage` |
| `/annunci/:id` | `DettaglioAnnuncioPage` |
| `/proposte` | `PropostePage` |
| `/preferiti` | `PreferitiPage` |
| `/profilo` | `ProfiloPage` |
| `/utenti/:id` | `ProfiloPubblicoPage` |
| `/chat` | `ChatPage` |
| `/privacy`, `/termini` | pagine legali |

---

## Layout e componenti condivisi

| Componente | Descrizione |
|---|---|
| `layouts/MainLayout.jsx` | Struttura comune a tutte le pagine: `Navbar` in alto, contenuto della rotta al posto di `<Outlet />`, `Footer` in fondo. |
| `components/Navbar.jsx` | Barra di navigazione sticky. Su desktop mostra link e bottoni Accedi/Registrati inline; su mobile un menu che apre un Drawer laterale. Cambia voci in base allo stato di autenticazione (da `useAuth`). |
| `components/Footer.jsx` | Piè di pagina globale con i link a Privacy Policy e Termini e Condizioni. |
| `components/HowItWorks.jsx` | Sezione "Come funziona" della home: tre step (cerca, proponi, collabora) generati da un array di dati. |
| `components/RecensioneItem.jsx` | Riga di una recensione, riusata nel profilo pubblico e nel dettaglio di un annuncio concluso; le prop `mostraAnnuncio` e `mostraDestinatario` adattano il testo al contesto. |
| `components/ProfiloCampi.jsx` | Coppia di piccoli componenti (`CampoProfilo`, `ChipsProfilo`) per le righe etichetta/valore e gli elenchi di chip nelle pagine profilo. |
| `components/SnackbarAvviso.jsx` | Snackbar di esito riusata in tutta l'app; si apre/chiude in base al testo passato, così il padre gestisce un solo pezzo di stato. |
| `components/ScrollToTop.jsx` | Riporta la finestra in cima ad ogni cambio di rotta (non renderizza nulla); ignora le navigazioni con hash, gestite dalla pagina di destinazione. |

---

## Contexts e hooks

| File | Descrizione |
|---|---|
| `contexts/AuthContext.jsx` | Stato di autenticazione globale: access token solo in memoria (rinnovato automaticamente prima della scadenza dei 15 minuti), refresh token in cookie httpOnly gestito dal backend, profilo utente in localStorage per il reload. Espone `isLoggedIn`, `utente`, `accessToken` e le azioni `registrati`, `accedi`, `logout`, `aggiornaUtente`. Al reload ripristina la sessione con `POST /api/auth/refresh`. |
| `hooks/useAuth.js` | Accesso ad `AuthContext` con controllo che il chiamante sia dentro `AuthProvider`. |
| `hooks/useAnnunciFiltrati.js` | Logica condivisa dalle due pagine lista annunci: ricerca testuale, filtri, ordinamento, toggle lista/mappa e limite di annunci visibili per i non autenticati. |
| `hooks/usePreferitiAnnunci.js` | Preferiti di tipo "annuncio" dell'utente loggato: mantiene la mappa annuncioId → preferitoId (necessaria per la DELETE) ed espone `isPreferito` e `togglePreferito`. |
| `hooks/useGeocodingLuogo.js` | Geocoding di un campo di testo libero (es. "Bari (BA)") al blur, con stati di caricamento/errore; usato da registrazione e pubblicazione annuncio. |
| `hooks/useChatSocket.js` | Connessione Socket.IO per la chat: si autentica passando l'access token JWT nel handshake e vive quanto il token (al rinnovo viene ricreata col token nuovo). Espone lo stato `connesso`, e `entraConversazione`/`inviaMessaggio` che avvolgono gli emit con ack del server in Promise; i messaggi in arrivo (`messaggio:nuovo`) sono consegnati a un callback tenuto in una ref, così il socket non va ricreato a ogni render. |

---

## Services

Moduli di sole funzioni `fetch` verso le API del backend, uno per risorsa; le rotte protette ricevono l'`accessToken` e lo inviano come Bearer token.

| File | Endpoint coperti |
|---|---|
| `services/annunci.js` | Lista, dettaglio, propri annunci, creazione, chiusura e conclusione (`/api/annunci`). |
| `services/proposte.js` | Invio, ricevute/inviate, accettazione e rifiuto (`/api/proposte`). |
| `services/preferiti.js` | Lista, salvataggio e rimozione (`/api/preferiti`). |
| `services/recensioni.js` | Creazione e letture per annuncio/per utente (`/api/recensioni`). |
| `services/users.js` | Profilo completo (`/api/auth/me`), modifica (`/api/users/me`), profilo pubblico (`/api/users/:id`). |
| `services/conversazioni.js` | Lista conversazioni, apertura/creazione, storico messaggi e segna-come-letti (`/api/conversazioni`). L'invio dei messaggi non passa da qui: avviene via Socket.IO (`useChatSocket`). |
| `services/geocoding.js` | Geocoding via Nominatim (OpenStreetMap): da testo libero a coordinate + sigla provincia. |

---

## Pagine

### Home e autenticazione

| Componente | Descrizione |
|---|---|
| `Home/HomePage.jsx` | Landing page pubblica: hero full-bleed, sezione "L'iniziativa" e sezione "Come funziona". |
| `Login/LoginPage.jsx` | Form di accesso email + password, collegato a `useAuth().accedi`. |
| `Register/RegisterPage.jsx` | Form di registrazione con scelta di uno o entrambi i ruoli (lavoratore/imprenditore) e geocoding dell'indirizzo al blur per ottenere le coordinate richieste dal backend. |

### Annunci

| Componente | Descrizione |
|---|---|
| `ListaAnnunci/ListaAnnunciPage.jsx` | Pagina lista generica: barra di ricerca, ordinamento, pannello filtri, griglia di card o vista mappa. Configurata dalle due varianti sottostanti. |
| `ListaAnnunci/AnnunciLavoroPage.jsx` / `AnnunciLavoratoriPage.jsx` | Wrapper di `ListaAnnunciPage` per le offerte di lavoro (tipo `richiesta_manodopera`, colore secondary) e le disponibilità dei lavoratori (`disponibilita_lavoro`, colore primary). |
| `ListaAnnunci/AnnuncioCard.jsx` | Card riepilogo di un annuncio nelle griglie; include il cuoricino dei preferiti quando il padre passa la callback. |
| `ListaAnnunci/FiltriAnnunci.jsx` | Pannello filtri: sidebar sticky su desktop, Drawer su mobile. Per i non autenticati i filtri sono bloccati da un overlay che apre `RegistratiDialog`. |
| `ListaAnnunci/MappaAnnunci.jsx` | Vista mappa degli annunci (react-leaflet) con clustering dei marker; ogni marker apre un popup con riepilogo e link al dettaglio. |
| `ListaAnnunci/StatoVuoto.jsx` | Empty state riusabile per le liste senza risultati. |
| `DettaglioAnnuncio/DettaglioAnnuncioPage.jsx` | Dettaglio completo di un annuncio: descrizione, competenze, mappa, autore, bottone per la proposta; se l'annuncio è concluso mostra le recensioni della collaborazione. Nella card autore, "Invia un messaggio" apre (o recupera) la conversazione legata all'annuncio e porta a `/chat` col thread selezionato. |
| `DettaglioAnnuncio/InviaPropostaDialog.jsx` | Dialog per inviare una proposta sull'annuncio, con messaggio facoltativo; gli errori del backend vengono mostrati dentro il dialog. |
| `MieiAnnunci/MieiAnnunciPage.jsx` | "I miei annunci" con filtro per stato via chip; azioni per stato: "Chiudi annuncio" (aperto, con conferma) e "Concludi lavoro" (in corso). |
| `PubblicaAnnuncio/PubblicaAnnuncioPage.jsx` | Form di pubblicazione in sezioni: tipo, info principali, luogo (geocoding + affinamento su mappa), periodo/compenso, dettagli. |
| `PubblicaAnnuncio/SelettoreTipoAnnuncio.jsx` | Due card cliccabili per scegliere il tipo di annuncio da pubblicare. |
| `PubblicaAnnuncio/SelettorePosizioneMappa.jsx` | Mappa per fissare/affinare la posizione dell'annuncio con un click. |
| `PubblicaAnnuncio/InputCompetenze.jsx` | Campo per una lista di competenze come chip rimovibili, con controllo duplicati. |
| `PubblicaAnnuncio/pubblicaAnnuncioForm.js` | Modello del form (stato iniziale, validazione, payload): funzioni pure separate dalla UI. |
| `RegistratiDialog.jsx` | Dialog mostrato ai non autenticati che provano a usare una funzionalità protetta, con link ad Accedi/Registrati. |
| `annunciConstants.js` | Costanti condivise (categorie di tipo lavoro, filtri iniziali) tra form di pubblicazione, filtri e hook. |

### Proposte, preferiti, profilo

| Componente | Descrizione |
|---|---|
| `Proposte/PropostePage.jsx` | "Le mie proposte" in due tab: Ricevute (Accetta/Rifiuta, poi "Concludi lavoro" sull'accettata; alla conclusione il backend rifiuta le proposte rimaste in attesa) e Inviate (stato delle proprie candidature). Sulle proposte accettate con annuncio concluso compare "Lascia una recensione". |
| `Proposte/PropostaCard.jsx` | Card di una singola proposta, usata in entrambe le tab; le azioni disponibili dipendono da tipo e stato. Sulle proposte accettate compare "Invia un messaggio", che apre la chat con l'altra persona. |
| `Proposte/RecensioneDialog.jsx` | Dialog per lasciare una recensione (stelle 1–5, commento facoltativo) al termine di una collaborazione, da entrambe le parti. |
| `Preferiti/PreferitiPage.jsx` | Griglia degli annunci salvati nei preferiti, con le stesse card delle liste; il cuoricino rimuove il preferito. Solo per autenticati. |
| `Profilo/ProfiloPage.jsx` | Profilo dell'utente autenticato: dati completi da `GET /api/auth/me` e modifica tramite `ModificaProfiloForm`; dopo il salvataggio aggiorna anche `AuthContext`. |
| `Profilo/ModificaProfiloForm.jsx` | Form di modifica del profilo (`PATCH /api/users/me`), limitato ai campi che il backend permette di cambiare. |
| `Profilo/ProfiloPubblicoPage.jsx` | Profilo pubblico di un utente con le recensioni ricevute; raggiungibile dal nome dell'autore in un annuncio. |

### Chat (messaggistica 1:1)

La chat combina REST e Socket.IO: lista conversazioni, storico e segna-come-letti passano dalle normali `fetch` (`services/conversazioni.js`), mentre l'invio e la ricezione dei messaggi avvengono sul socket (`useChatSocket`), così i nuovi messaggi arrivano in tempo reale senza ricaricare. Il server, dopo aver salvato un messaggio, lo ritrasmette con `messaggio:nuovo` a tutta la stanza della conversazione — mittente compreso: l'append nel thread è quindi centralizzato in un unico punto con deduplicazione per `_id` (lo stesso messaggio arriva sia dall'ack dell'invio sia dal broadcast).

| Componente | Descrizione |
|---|---|
| `Chat/ChatPage.jsx` | Orchestrazione della chat (rotta `/chat`, solo autenticati). La conversazione attiva vive nella query string (`?c=<id>`): link condivisibile e back del browser che chiude il thread. Carica la lista e lo storico via REST, entra nella stanza socket della conversazione attiva (rientrandovi a ogni riconnessione, perché al rinnovo del token il socket viene ricreato) e segna i messaggi come letti all'apertura e all'arrivo di messaggi altrui. Su desktop lista e thread sono affiancati, su mobile si alternano. |
| `Chat/ListaConversazioni.jsx` | Colonna sinistra: una voce per conversazione con l'altro partecipante, l'eventuale annuncio di riferimento e l'anteprima dell'ultimo messaggio con orario; la conversazione attiva è evidenziata. |
| `Chat/ThreadMessaggi.jsx` | Colonna destra: intestazione con link al profilo pubblico e all'annuncio, messaggi in bolle (i propri a destra) con separatori per giorno, campo di invio con Enter (Shift+Enter va a capo) e limite di 2000 caratteri come da validazione del backend. Montato con `key` sull'id della conversazione, così cambiando thread lo stato locale riparte pulito. |
| `Chat/chatUtils.js` | Utility condivise dai componenti della chat (altro partecipante, iniziali per l'avatar). |

### Altre pagine

| Componente | Descrizione |
|---|---|
| `Legal/PrivacyPolicyPage.jsx` / `TerminiCondizioniPage.jsx` | Pagine statiche di privacy policy e termini e condizioni. |

---

## Tema

`theme/theme.js` definisce il tema MUI condiviso: palette a tema agricolo (primary verde scuro `#387347`, secondary verde chiaro `#69A62D`, sfondo avorio), tipografia e override dei bottoni. I colori primary/secondary sono usati anche come convenzione per distinguere le due sezioni di annunci (cercasi = primary, offerte = secondary).
