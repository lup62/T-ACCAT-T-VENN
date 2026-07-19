# Scenario applicativo e architettura — T'ACCAT & T'VENN

## 1. Scopo del documento

Questo documento descrive lo scenario applicativo e l'architettura **attualmente implementata** di T'ACCAT & T'VENN. La piattaforma mette in contatto lavoratori e imprenditori del settore agricolo attraverso annunci geolocalizzati, proposte di collaborazione e comunicazioni dirette.


Per gli approfondimenti progettuali e per i diagrammi bisogna fare riferimento ai documenti presenti nell'apposita cartella [`docs/`](./) e nelle relative sottocartelle. In particolare, la descrizione dettagliata del frontend è contenuta in [`componenti-react.md`](./componenti-react.md), mentre i diagrammi dei flussi applicativi sono raccolti nella cartella [`UML sequenza`](./UML%20sequenza/). I diagrammi non vengono duplicati in questo documento.

## 2. Scenario applicativo

### 2.1 Contesto e obiettivo

Nel lavoro agricolo la domanda di manodopera e la disponibilità dei lavoratori sono spesso stagionali, locali e legate a competenze specifiche. T'ACCAT & T'VENN supporta entrambi i versi dell'incontro:

- un imprenditore può pubblicare una **richiesta di manodopera**;
- un lavoratore può pubblicare una **disponibilità di lavoro**;
- gli utenti possono cercare opportunità per categoria, provincia, periodo e fascia di prezzo, visualizzandole anche su mappa;
- le parti possono formalizzare l'interesse con una proposta, comunicare in chat e recensirsi dopo la conclusione del lavoro.

Un singolo account può possedere il ruolo `lavoratore`, il ruolo `imprenditore` oppure entrambi. I ruoli determinano il tipo di annuncio pubblicabile; l'autorizzazione delle altre operazioni dipende inoltre dall'autenticazione, dalla proprietà delle risorse e dalla partecipazione alla collaborazione.

Non rientrano nel perimetro attuale pagamenti, fatturazione, amministrazione della piattaforma, gestione contrattuale o selezione automatica dei candidati.

### 2.2 Attori

| Attore | Obiettivi e operazioni principali |
| --- | --- |
| Visitatore | Consultare gli annunci aperti, vedere i dettagli pubblici, i profili pubblici e le recensioni; registrarsi o accedere per interagire. Nell'interfaccia, la quantità di risultati e l'uso dei filtri avanzati sono limitati finché non effettua l'accesso. |
| Lavoratore | Gestire il proprio profilo e le competenze, pubblicare disponibilità di lavoro, consultare richieste di manodopera, inviare proposte, usare preferiti e chat, lasciare o ricevere recensioni. |
| Imprenditore | Gestire il profilo aziendale, pubblicare richieste di manodopera, esaminare e accettare o rifiutare proposte, coordinarsi in chat, concludere il lavoro e lasciare o ricevere recensioni. |
| Utente con doppio ruolo | Svolgere entrambe le famiglie di operazioni con lo stesso account. |
| Servizi cartografici esterni | Nominatim converte un luogo testuale in coordinate; i provider cartografici forniscono i tile usati dalle mappe Leaflet. Le chiamate partono direttamente dal browser. |

Il backend rimane l'autorità per autenticazione, autorizzazione e regole di dominio: le limitazioni o i controlli presenti nella sola interfaccia non sono considerati un confine di sicurezza.

### 2.3 Casi d'uso principali

| Area | Casi d'uso |
| --- | --- |
| Identità | Registrazione con uno o due ruoli, login, rinnovo della sessione, logout, lettura e modifica del profilo, consultazione del profilo pubblico. |
| Annunci | Pubblicazione, consultazione in lista o su mappa, ricerca e filtri, dettaglio, modifica da parte dell'autore, elenco dei propri annunci, chiusura e conclusione. |
| Proposte | Invio di una proposta su un annuncio altrui, elenco delle proposte inviate e ricevute, accettazione o rifiuto da parte dell'autore dell'annuncio. |
| Comunicazione | Creazione o recupero di una conversazione 1:1, lettura dello storico, invio e ricezione di messaggi in tempo reale, marcatura dei messaggi come letti. |
| Fiducia | Recensioni reciproche dopo una collaborazione conclusa e aggiornamento del rating medio dell'utente. |
| Organizzazione personale | Aggiunta, consultazione e rimozione di annunci o profili preferiti; l'interfaccia corrente espone principalmente i preferiti di tipo annuncio. |

### 2.4 Flusso applicativo principale

1. L'utente si registra selezionando uno o entrambi i ruoli. L'indirizzo viene geocodificato e memorizzato come testo e punto GeoJSON.
2. Un imprenditore pubblica una richiesta di manodopera oppure un lavoratore pubblica la propria disponibilità, indicando luogo, periodo, categoria, competenze e compenso.
3. Gli altri utenti esplorano gli annunci aperti tramite ricerca, filtri, ordinamento, lista o mappa.
4. Un utente autenticato invia una proposta su un annuncio non proprio.
5. L'autore dell'annuncio accetta o rifiuta la proposta. L'accettazione porta l'annuncio nello stato `in_corso`; sullo stesso annuncio possono essere accettate più proposte e quelle ancora in attesa non vengono rifiutate automaticamente in questa fase.
6. Le parti aprono una conversazione legata, facoltativamente, all'annuncio e comunicano in tempo reale.
7. L'autore conclude il lavoro. L'annuncio passa a `concluso` e le proposte rimaste `in_attesa` vengono rifiutate. In alternativa, un annuncio ancora `aperto` può essere chiuso senza avviare una collaborazione.
8. Dopo la conclusione, i partecipanti a una collaborazione accettata possono recensirsi; il backend ricalcola il rating medio del destinatario.

### 2.5 Stati di annunci e proposte

| Stato annuncio | Significato | Transizioni ammesse |
| --- | --- | --- |
| `aperto` | Visibile nella lista pubblica e disponibile per nuove proposte. | `in_corso` con un'accettazione; `chiuso` per decisione dell'autore. |
| `in_corso` | Esiste almeno una proposta accettata; altre proposte possono ancora essere gestite. | Resta `in_corso` con ulteriori accettazioni; passa a `concluso` quando l'autore termina il lavoro. |
| `concluso` | La collaborazione è terminata e può essere recensita. | Stato terminale nel flusso corrente. |
| `chiuso` | L'annuncio è stato ritirato prima dell'avvio del lavoro. | Stato terminale nel flusso corrente. |

Una proposta nasce `in_attesa` e può diventare `accettata` o `rifiutata`. La chiusura di un annuncio aperto e la conclusione di un annuncio in corso trasformano automaticamente in `rifiutata` ogni proposta ancora in attesa. Gli annunci non più aperti sono visibili soltanto all'autore e ai proponenti con proposta accettata.

## 3. Architettura dell'applicazione

### 3.1 Stile architetturale

L'applicazione segue un'architettura client-server a tre livelli:

1. una **Single Page Application** React gestisce presentazione, navigazione e stato dell'interfaccia;
2. un **monolite backend modulare** Node.js espone API REST e il canale Socket.IO sullo stesso server HTTP;
3. MongoDB persiste dati applicativi e sessioni di refresh tramite modelli Mongoose.

Il backend è organizzato per responsabilità (`routes`, `middlewares`, `controllers`, `models`, `sockets`), con una separazione simile a MVC per la parte API. Non sono presenti microservizi: API REST, autenticazione, regole applicative, documentazione Swagger e messaggistica real-time appartengono allo stesso processo Node.js.

### 3.2 Vista di contesto e container

Il browser raggiunge il frontend statico servito da Nginx sulla porta host `5173`. Il bundle React comunica tramite REST e Socket.IO con il backend esposto sulla porta `3000`; il backend raggiunge MongoDB usando il nome di servizio `mongo` sulla rete Docker interna. Le chiamate a Nominatim e ai provider cartografici partono invece direttamente dal browser.

| Container o sistema | Responsabilità | Tecnologia e interfacce |
| --- | --- | --- |
| Browser / frontend | Rendering delle pagine, routing client-side, form, filtri e ordinamento, mappe, gestione della sessione in memoria, chiamate API e connessione chat. | React 19 e Vite in fase di build; file statici serviti da Nginx 1.27. Porta host `5173`, porta container `80`. |
| Backend | API, autenticazione e autorizzazione, validazione di dominio, orchestrazione dei casi d'uso, accesso ai dati, chat e Swagger UI. | Container Node.js 22 Alpine, Express 5, Socket.IO, Mongoose, JWT e bcrypt. Porta `3000`. |
| MongoDB | Persistenza di utenti, annunci, proposte, recensioni, preferiti, conversazioni, messaggi e refresh token. | Container MongoDB 7, porta `27017` e volume persistente `mongo_data`. |
| Nominatim | Trasformazione di testo libero in coordinate e provincia italiana. | API HTTPS invocata dal client. |
| Provider cartografici | Sfondo cartografico per visualizzazione e selezione delle posizioni. | Tile CARTO con dati/attribuzione OpenStreetMap, consumati tramite Leaflet. |

### 3.3 Struttura logica del frontend

```text
client/src/
├── main.jsx          # bootstrap: tema, router e autenticazione globale
├── routes/           # rotte della SPA
├── layouts/          # struttura comune Navbar + contenuto + Footer
├── pages/            # pagine organizzate per area funzionale
├── components/       # componenti condivisi
├── contexts/         # stato globale della sessione
├── hooks/            # logica riusabile, filtri, geocoding, preferiti e socket
├── services/         # funzioni fetch, un modulo per risorsa backend
└── theme/            # tema Material UI
```

`main.jsx` monta `ThemeProvider`, `BrowserRouter` e `AuthProvider`; `AppRoutes.jsx` associa gli URL alle pagine, tutte contenute nel `MainLayout`. Le pagine delegano le chiamate HTTP ai moduli in `services/` e riusano stato e comportamento tramite context e hook.

La ricerca testuale, i filtri avanzati e l'ordinamento degli annunci sono applicati nel browser da `useAnnunciFiltrati`. L'API pubblica degli annunci filtra lato server soltanto gli elementi aperti e, se richiesto, `tipo` e `tipoLavoro`. I punti GeoJSON e gli indici `2dsphere` predispongono il database a ricerche geospaziali, ma gli endpoint correnti non eseguono query per distanza.

### 3.4 Struttura logica del backend

```text
server/
├── server.js         # composizione dell'app, HTTP server, REST e Socket.IO
├── config/           # connessione MongoDB
├── routes/           # mapping URL → middleware → controller
├── middlewares/      # autenticazione obbligatoria/facoltativa e ruoli
├── controllers/      # casi d'uso e regole applicative
├── models/           # schemi, vincoli e indici Mongoose
├── sockets/          # autenticazione e gestione della chat real-time
├── docs/             # specifica OpenAPI e configurazione Swagger
└── scripts/          # popolamento del database di sviluppo
```

Il flusso tipico di una richiesta REST è:

```text
client service → Express route → middleware di autenticazione
               → controller → modello Mongoose → MongoDB
               ← risposta HTTP JSON
```

`server.js` crea un unico server HTTP, vi collega Express e Socket.IO, configura CORS e cookie, monta Swagger su `/api-docs`, registra le rotte sotto `/api` e avvia la connessione MongoDB.

### 3.5 Moduli e API

| Modulo | Prefisso REST | Responsabilità |
| --- | --- | --- |
| Auth | `/api/auth` | Registrazione, login, profilo corrente, rinnovo dell'access token, logout e revoca della sessione. |
| Users | `/api/users` | Profilo pubblico e aggiornamento del proprio profilo. |
| Annunci | `/api/annunci` | Lista e dettaglio, creazione, modifica, propri annunci, chiusura e conclusione. |
| Proposte | `/api/proposte` | Invio, elenchi ricevute/inviate, accettazione e rifiuto. |
| Recensioni | `/api/recensioni` | Creazione dopo la conclusione e lettura per utente o annuncio. |
| Preferiti | `/api/preferiti` | Creazione, elenco e rimozione di riferimenti ad annunci o profili. |
| Conversazioni | `/api/conversazioni` | Creazione/recupero, elenco, storico dei messaggi e conferma di lettura. |
| Chat | eventi Socket.IO | Ingresso nella stanza, invio e ricezione dei nuovi messaggi. |

La specifica OpenAPI è resa disponibile dal backend in esecuzione all'indirizzo `/api-docs`. L'invio dei messaggi non passa da un endpoint REST.

### 3.6 Flussi di comunicazione

#### Chiamate REST

I service del frontend usano una base URL configurata con `VITE_API_URL` e inviano/ricevono JSON. Le rotte protette aggiungono `Authorization: Bearer <accessToken>`; registrazione, login, refresh e logout abilitano le credenziali del browser per gestire il cookie di refresh.

#### Autenticazione e sessione

1. Registrazione e login verificano i dati e salvano la password con bcrypt, usando un fattore di costo pari a 12.
2. Il backend restituisce un access token JWT valido 15 minuti. Il frontend lo conserva soltanto nello stato React in memoria.
3. Un refresh token casuale valido 7 giorni viene inviato in un cookie `httpOnly`; MongoDB conserva soltanto il suo hash SHA-256, insieme a scadenza e data di eventuale revoca.
4. `AuthContext` tenta il ripristino della sessione al caricamento e rinnova l'access token circa ogni 13 minuti. Nel `localStorage` rimane il solo profilo usato dall'interfaccia, non l'access token.
5. Il logout revoca il refresh token persistito, cancella il cookie e pulisce lo stato locale.

In produzione il cookie è `secure` e `SameSite=None`; in sviluppo usa `SameSite=Lax`. Il CORS del server accetta l'origine configurata da `CLIENT_ORIGIN` e consente le credenziali.

#### Chat real-time

La lista delle conversazioni, lo storico e la marcatura come letti passano da REST. Per il tempo reale, il client autentica il handshake Socket.IO con lo stesso access token, entra in una stanza `conversazione:<id>` e può poi inviare messaggi. Il server verifica nuovamente la partecipazione, salva il messaggio, aggiorna l'anteprima denormalizzata dell'ultimo messaggio e trasmette `messaggio:nuovo` alla stanza. Al rinnovo del JWT il socket viene ricreato e il client rientra nella conversazione attiva.

#### Geocoding e mappe

Il browser interroga Nominatim limitando la ricerca all'Italia, ricava coordinate e sigla della provincia e invia al backend un punto GeoJSON nel formato `[longitudine, latitudine]`. Leaflet visualizza gli annunci e permette di affinare la posizione; la disponibilità e le policy dei servizi cartografici esterni incidono quindi direttamente sulle funzioni di mappa e geocoding.

## 4. Modello dei dati

| Modello | Contenuto principale | Relazioni e vincoli rilevanti |
| --- | --- | --- |
| `User` | Ruoli, anagrafica, credenziali, indirizzo GeoJSON, dati lavoratore/imprenditore, rating medio. | Email univoca; almeno un ruolo; password hash escluso dalle query normali; indice `2dsphere` sull'indirizzo. |
| `Annuncio` | Tipo, autore, titolo, descrizione, luogo, periodo, categoria, competenze, numero di lavoratori, compenso e stato. | Riferimento a `User`; validazioni incrociate su date, compenso e tipo; indice `2dsphere` sul luogo. |
| `Proposta` | Annuncio, proponente, destinatario, messaggio, stato e date di proposta/risposta. | Riferimenti ad `Annuncio` e `User`; vietata sul proprio annuncio; indice univoco parziale che impedisce più proposte attive dello stesso utente sullo stesso annuncio. |
| `Recensione` | Annuncio, autore, destinatario, direzione, stelle e commento. | Riferimenti ad annuncio e utenti; unicità per annuncio/autore/destinatario; vietata verso sé stessi; il rating medio è ricalcolato sul destinatario. |
| `Preferito` | Utente, tipo e riferimento polimorfico. | Il riferimento punta a `Annuncio` o `User`; unicità per utente/tipo/riferimento. |
| `Conversazione` | Due partecipanti, annuncio facoltativo e anteprima dell'ultimo messaggio. | Esattamente due utenti distinti; indice per partecipanti e ultimo aggiornamento. |
| `Messaggio` | Conversazione, mittente, testo e indicatore di lettura. | Riferimenti a conversazione e utente; massimo 2000 caratteri; indice per storico cronologico. |
| `RefreshToken` | Utente, hash del token, scadenza e data di revoca. | Hash univoco; il valore in chiaro esiste soltanto nel cookie del browser. |

MongoDB non impone chiavi esterne tra collection: i riferimenti sono `ObjectId` gestiti da Mongoose e la coerenza delle operazioni tra più documenti è governata dai controller e dagli indici.

## 5. Sicurezza e autorizzazione

I principali controlli presenti sono:

- password memorizzate come hash bcrypt e mai restituite dalle query ordinarie;
- access token JWT breve, verificato dal middleware REST e dal middleware Socket.IO;
- refresh token opaco, conservato come hash, revocabile e trasportato in cookie `httpOnly`;
- verifica dell'esistenza dell'utente a ogni autenticazione REST o socket;
- separazione tra endpoint pubblici, autenticazione facoltativa e endpoint protetti;
- controlli di ruolo per il tipo di annuncio pubblicabile;
- controlli di proprietà per modifica, chiusura e conclusione degli annunci;
- controlli su destinatario, partecipazione alla proposta e appartenenza alle conversazioni;
- validazione nei controller e negli schemi Mongoose, indici univoci per i duplicati;
- CORS ristretto all'origine frontend configurata.

L'interfaccia adatta navigazione e azioni allo stato di autenticazione, ma ogni vincolo sensibile è verificato dal backend. Per un rilascio pubblico devono essere definiti a livello infrastrutturale almeno TLS, gestione dei segreti, logging/monitoraggio, backup, protezione da abuso e policy dei servizi esterni: tali elementi non sono configurati nel repository corrente.

## 6. Configurazione e topologia di esecuzione

### 6.1 Ambiente locale corrente

Docker Compose avvia l'intera applicazione con tre servizi collegati alla rete bridge `taccat-network`:

1. `mongo` usa l'immagine `mongo:7`, espone la porta `27017`, persiste i dati nel volume `mongo_data` ed esegue un healthcheck tramite `mongosh`;
2. `backend` viene costruito da `server/Dockerfile` usando Node.js 22 Alpine, espone la porta `3000` e parte solo quando MongoDB risulta healthy;
3. `frontend` viene costruito da `client/Dockerfile` con una build multi-stage: Node.js 22 compila la SPA con Vite e Nginx 1.27 serve i file statici. La porta `80` del container è pubblicata sulla porta host `5173` e il servizio parte solo quando il backend risulta healthy.

Tutti e tre i servizi hanno un healthcheck e usano la policy di riavvio `unless-stopped`; la catena di dipendenze è quindi `mongo` → `backend` → `frontend`.

Nginx gestisce il fallback verso `index.html` necessario al routing della SPA, ma non svolge il ruolo di proxy per le API. Il browser contatta direttamente il backend su `http://localhost:3000`.

Con Docker e il file `server/.env` configurato, l'ambiente completo si costruisce e si avvia dalla radice con:

```bash
docker compose up --build -d
```

L'applicazione è quindi disponibile su `http://localhost:5173`, il backend su `http://localhost:3000` e MongoDB su `localhost:27017`. Per arrestare i container si usa `docker compose down`; il volume `mongo_data` non viene eliminato da questo comando.

L'esecuzione separata tramite i comandi npm rimane possibile per lo sviluppo, ma non è necessaria quando si utilizza Compose.

### 6.2 Variabili di ambiente

| Componente | Variabile | Scopo |
| --- | --- | --- |
| Frontend | `VITE_API_URL` | Argomento di build incorporato nel bundle per REST e Socket.IO; Compose usa `http://localhost:3000`. |
| Backend | `PORT` | Porta del server HTTP; default `3000`. |
| Backend | `CLIENT_ORIGIN` | Unica origine autorizzata dal CORS. |
| Backend | `NODE_ENV` | Determina, tra l'altro, gli attributi di sicurezza del cookie. |
| Backend | `MONGODB_URI` | Stringa di connessione MongoDB. |
| Backend | `JWT_ACCESS_SECRET` | Segreto di firma degli access token JWT. |

Il file `server/.env.example` documenta le variabili backend; i file `.env` reali non devono essere versionati. Compose legge `server/.env`, usa da lì `JWT_ACCESS_SECRET` e sovrascrive per i container `PORT`, `NODE_ENV`, `CLIENT_ORIGIN` e `MONGODB_URI`. La connessione interna al database usa `mongodb://mongo:27017/taccat`, cioè il nome del servizio Docker invece di `localhost`.

Lo script `npm run seed` crea dati dimostrativi ed è destinato soltanto a database di sviluppo, perché ripopola le collection.

## 7. Qualità, documentazione e limiti operativi

Il repository mette a disposizione:

- build e lint del frontend tramite Vite ed ESLint;
- Swagger UI e specifica OpenAPI per l'esplorazione delle API;
- uno script di seed per sviluppo e dimostrazioni;
- diagrammi UML di sequenza dei flussi principali;
- validazioni applicative e indici MongoDB per diversi vincoli di integrità.

Allo stato attuale non risultano versionate suite di test automatizzate né pipeline CI. Il backend non espone uno script di test. La configurazione Docker comprende frontend, backend e database, ma mantiene impostazioni orientate allo sviluppo locale, tra cui porte pubblicate sull'host, `NODE_ENV=development`, URL locali e assenza di TLS. Test, osservabilità, backup e strategia di scalabilità vanno definiti prima di considerare una topologia di produzione.

Il canale Socket.IO e le stanze risiedono nel singolo processo backend. Un'eventuale scalabilità orizzontale richiederebbe la condivisione degli eventi tra istanze, per esempio tramite un adapter, oltre a una strategia di bilanciamento compatibile con Socket.IO.

## 8. Tracciabilità nel repository

| Aspetto | Fonte principale |
| --- | --- |
| Bootstrap e composizione backend | `server/server.js` |
| Routing e struttura frontend | `client/src/main.jsx`, `client/src/routes/AppRoutes.jsx` |
| Stato di autenticazione frontend | `client/src/contexts/AuthContext.jsx` |
| Chiamate REST | `client/src/services/` |
| Chat client e server | `client/src/hooks/useChatSocket.js`, `server/sockets/` |
| Regole applicative | `server/controllers/` |
| Modello dati | `server/models/` |
| Configurazione Docker e locale | `docker-compose.yaml`, `client/Dockerfile`, `client/nginx.conf`, `server/Dockerfile`, `server/.env.example` |
| OpenAPI | `server/docs/swaggerSpec.js` |

Per ogni approfondimento bisogna fare riferimento ai documenti presenti nella cartella `docs/` e nelle relative sottocartelle. I principali documenti correlati sono:

- [README generale](../README.md)
- [Documentazione del frontend](../client/README.md)
- [Componenti React](./componenti-react.md)
- [API backend](../server/API.md)
- [Diagrammi UML di sequenza](./UML%20sequenza/)
