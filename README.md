# T'ACCAT & T'VENN

**Coltiviamo nuove opportunità di lavoro.**

T'ACCAT & T'VENN è una Single Page Application sviluppata come progetto universitario per mettere in contatto lavoratori e imprenditori del settore agricolo.

La piattaforma supporta entrambe le direzioni dell'incontro tra domanda e offerta: gli imprenditori possono pubblicare richieste di manodopera, mentre i lavoratori possono pubblicare la propria disponibilità.

Ogni account può possedere il ruolo `lavoratore`, `imprenditore` oppure entrambi.

---

## Funzionalità principali

- registrazione, login, rinnovo della sessione e logout;
- autenticazione tramite access token JWT e refresh token `httpOnly`;
- profilo personale e profili pubblici;
- pubblicazione e gestione di richieste di manodopera e disponibilità di lavoro;
- ricerca testuale, filtri, ordinamento e visualizzazione degli annunci su mappa;
- geocoding dei luoghi e memorizzazione delle coordinate GeoJSON;
- salvataggio delle ricerche effettuate sugli annunci;
- modifica, attivazione, disattivazione ed eliminazione delle ricerche salvate;
- matching automatico tra nuovi annunci e ricerche salvate attive;
- notifiche persistenti per nuovi annunci compatibili;
- ricezione real-time delle notifiche tramite Socket.IO;
- menu notifiche con badge delle notifiche non lette;
- proposte inviate e ricevute, con accettazione o rifiuto;
- ciclo di vita degli annunci: `aperto`, `in_corso`, `concluso`, `chiuso`;
- annunci e profili preferiti;
- recensioni reciproche dopo una collaborazione conclusa;
- conversazioni private 1:1;
- storico persistente dei messaggi;
- invio e ricezione di messaggi in tempo reale tramite Socket.IO;
- conferme di lettura dei messaggi;
- documentazione interattiva delle API tramite Swagger UI;
- esecuzione locale tramite Docker Compose;
- deployment dimostrativo tramite Render.

---

## Stack tecnologico

| Area | Tecnologie principali |
| --- | --- |
| Frontend | React 19, Vite, Material UI, React Router, Leaflet, React Leaflet, Socket.IO Client |
| Backend | Node.js 22, Express 5, Mongoose, JSON Web Token, bcrypt, Socket.IO, Swagger UI |
| Database | MongoDB 7 in locale, MongoDB Atlas online, GeoJSON e indici `2dsphere` |
| Infrastruttura | Docker, Docker Compose, Nginx, Render, Git, GitHub |
| Servizi esterni | Nominatim, provider cartografici compatibili con Leaflet |

---

# Avvio rapido con Docker

Docker Compose è il metodo consigliato per eseguire l'intera applicazione.

Avvia:

- frontend;
- backend;
- MongoDB.

Non è necessario avere Node.js o MongoDB installati direttamente sul computer host.

## Prerequisiti

Sono necessari:

- Git;
- Docker Desktop oppure Docker Engine;
- Docker Compose v2 tramite comando `docker compose`;
- porte `5173`, `3000` e `27017` libere.

---

## 1. Clonazione del repository

```bash
git clone --branch develop https://github.com/lup62/T-ACCAT-T-VENN.git
cd T-ACCAT-T-VENN
```

Se il repository è già presente in locale, eseguire i comandi successivi dalla cartella principale.

---

## 2. Configurazione del backend

Creare `server/.env` partendo dal file di esempio.

### PowerShell

```powershell
Copy-Item server/.env.example server/.env
```

### macOS / Linux / Git Bash

```bash
cp server/.env.example server/.env
```

Aprire successivamente `server/.env` e impostare almeno:

```env
JWT_ACCESS_SECRET=inserire_una_chiave_segreta_lunga_e_casuale
```

Il file `server/.env` contiene dati riservati e non deve essere versionato.

Nell'esecuzione tramite Docker Compose, le altre principali impostazioni vengono configurate automaticamente.

---

## 3. Build e avvio

Dalla root del progetto:

```bash
docker compose up --build -d
```

Docker Compose costruisce le immagini applicative e avvia i servizi rispettando le dipendenze:

```text
mongo
  ↓
backend
  ↓
frontend
```

Per verificare lo stato:

```bash
docker compose ps
```

I servizi devono risultare disponibili/healthy.

---

## 4. Indirizzi locali

| Servizio | Indirizzo |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |
| API REST | http://localhost:3000/api |
| MongoDB | mongodb://localhost:27017/taccat |
| Health check | http://localhost:3000/health |

Visitando il backend in ambiente di sviluppo la risposta prevista è:

```text
Backend T'ACCAT attivo!
```

---

# Credenziali demo

Per facilitare il test delle funzionalità sono disponibili account generati tramite lo script di seed.

Tutti gli utenti del dataset dimostrativo utilizzano la password:

```text
Password123!
```

Account consigliati per il test:

| Ruolo | Nome | Email | Password |
| --- | --- | --- | --- |
| Imprenditore | Giovanni Russo | `giovanni.russo@seed.local` | `Password123!` |
| Lavoratore | Luca Moretti | `luca.moretti@seed.local` | `Password123!` |
| Imprenditore + Lavoratore | Paolo Quaranta | `paolo.quaranta@seed.local` | `Password123!` |

Queste credenziali sono destinate esclusivamente all'ambiente dimostrativo.

---

# Dati dimostrativi

Con lo stack già avviato, il database locale può essere popolato tramite:

```bash
docker compose exec backend npm run seed
```

Lo script di seed genera utenti e dati dimostrativi utilizzabili per esplorare le principali funzionalità dell'applicazione.

Il dataset attualmente documentato comprende:

- 20 utenti;
- 36 annunci;
- 25 proposte;
- 12 recensioni;
- 23 preferiti.
- 3 ricerche salvate dimostrative, di cui 2 attive e 1 disattivata.

Il seed non crea conversazioni, messaggi o notifiche dimostrative.

Le notifiche vengono generate realmente quando un nuovo annuncio
corrisponde a una ricerca salvata attiva, così da permettere il test
completo del matching e della consegna real-time tramite Socket.IO.

> **Attenzione:** lo script di seed elimina i dati applicativi gestiti dallo script prima di ricreare il dataset. Deve essere utilizzato esclusivamente su database di sviluppo o dimostrativi.

---

# Flusso consigliato per il test

Per verificare rapidamente le funzionalità principali:

1. effettuare il login con uno degli account demo;
2. consultare gli annunci;
3. utilizzare ricerca e filtri;
4. salvare una ricerca;
5. aprire la sezione `Ricerche salvate`;
6. modificare, attivare o disattivare una ricerca;
7. utilizzare un secondo account per pubblicare un annuncio compatibile;
8. verificare la comparsa della notifica;
9. aprire la notifica dalla Navbar;
10. inviare una proposta;
11. accettare o rifiutare la proposta con l'altro account;
12. aprire una conversazione;
13. verificare l'invio real-time dei messaggi;
14. concludere la collaborazione;
15. inserire una recensione.

Per testare correttamente le funzionalità real-time è consigliabile utilizzare due browser diversi oppure una finestra normale e una finestra privata.

---

# Ricerche salvate e notifiche

Un utente autenticato può salvare i filtri utilizzati durante la ricerca degli annunci.

Una ricerca salvata può contenere:

- tipo di annuncio;
- testo di ricerca;
- tipo di lavoro;
- province;
- fascia di prezzo;
- periodo;
- stato attivo/disattivo.

Quando viene pubblicato un nuovo annuncio, il backend confronta il nuovo documento con le ricerche salvate attive.

Il matching viene gestito attraverso:

```text
server/utils/ricercaSalvataMatcher.js
```

La generazione delle notifiche viene invece orchestrata da:

```text
server/services/notificaRicercaService.js
```

Il flusso è:

```text
Nuovo annuncio
      ↓
Ricerca delle configurazioni attive
      ↓
Matching
      ↓
Creazione Notifica in MongoDB
      ↓
Socket.IO
      ↓
room utente:<userId>
      ↓
evento notifica:nuova
      ↓
NotificheContext
      ↓
NotificationMenu
```

Le notifiche vengono sempre persistite in MongoDB.

Se l'utente è connesso, il backend invia inoltre l'evento real-time:

```text
notifica:nuova
```

alla room personale:

```text
utente:<userId>
```

In questo modo una notifica non viene persa nel caso in cui il destinatario sia offline.

---

# Architettura in breve

```text
Browser
│
├── React SPA
│   ├── React Router
│   ├── Material UI
│   ├── AuthContext
│   ├── RealtimeContext
│   ├── NotificheContext
│   ├── REST services
│   └── Socket.IO client
│
├── Nominatim
└── provider cartografici
        │
        ▼
Backend Node.js / Express / Socket.IO
│
├── routes
├── middlewares
├── controllers
├── services
├── utils
├── sockets
└── models Mongoose
        │
        ▼
MongoDB
```

L'applicazione adotta un'architettura client-server a tre livelli.

Il frontend React gestisce:

- interfaccia;
- routing;
- stato globale;
- form;
- ricerca e filtri;
- mappe;
- notifiche;
- comunicazione REST;
- comunicazione real-time.

Il backend Express gestisce:

- autenticazione;
- autorizzazione;
- API REST;
- logica applicativa;
- matching delle ricerche;
- generazione delle notifiche;
- persistenza;
- Swagger;
- Socket.IO.

MongoDB persiste le 10 principali collezioni:

```text
User
Annuncio
Proposta
Recensione
Preferito
Conversazione
Messaggio
RefreshToken
RicercaSalvata
Notifica
```

---

# Comunicazione real-time

Socket.IO viene utilizzato sia per la chat sia per le notifiche.

## Chat

Ogni conversazione utilizza una room:

```text
conversazione:<idConversazione>
```

Il principale evento inviato dal server è:

```text
messaggio:nuovo
```

## Notifiche

Ogni utente autenticato entra automaticamente nella room:

```text
utente:<userId>
```

Quando viene generata una nuova notifica, il backend invia:

```text
notifica:nuova
```

alla room personale del destinatario.

La connessione Socket.IO viene autenticata tramite access token JWT nel handshake.

---

# Gestione dello stack Docker

I comandi seguenti devono essere eseguiti dalla root del progetto.

| Operazione | Comando |
| --- | --- |
| Build/rebuild e avvio | `docker compose up --build -d` |
| Stato servizi | `docker compose ps` |
| Log servizi | `docker compose logs -f` |
| Log backend | `docker compose logs --tail=100 backend` |
| Arresto temporaneo | `docker compose stop` |
| Ripresa | `docker compose start` |
| Rimozione container e rete | `docker compose down` |

`docker compose down` mantiene il volume MongoDB.

Per eliminare anche i dati:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend npm run seed
```

> **Attenzione:** `docker compose down -v` elimina definitivamente il database MongoDB locale.

I container non utilizzano bind mount o hot reload. Dopo modifiche al codice è quindi necessario ricostruire:

```bash
docker compose up --build -d
```

---

# Container Docker

| Servizio | Immagine / build | Responsabilità |
| --- | --- | --- |
| `frontend` | Build Node.js + runtime Nginx | Build della SPA e servizio dei file statici |
| `backend` | `server/Dockerfile` | Express, API REST, Swagger e Socket.IO |
| `mongo` | `mongo:7` | Persistenza MongoDB |

I servizi condividono la rete:

```text
taccat-network
```

---

# Variabili di ambiente

| Componente | Variabile | Utilizzo |
| --- | --- | --- |
| Backend | `PORT` | Porta HTTP, default `3000` |
| Backend | `CLIENT_ORIGIN` | Origine autorizzata dal CORS |
| Backend | `NODE_ENV` | Ambiente di esecuzione |
| Backend | `MONGODB_URI` | Connessione MongoDB |
| Backend | `JWT_ACCESS_SECRET` | Segreto per gli access token JWT |
| Frontend | `VITE_API_URL` | Base URL per REST e Socket.IO |

Esempio per sviluppo manuale:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taccat
JWT_ACCESS_SECRET=inserire_una_chiave_segreta_lunga_e_casuale
```

`VITE_API_URL` viene incorporata nella build del frontend.

Se viene modificata in ambiente Docker, l'immagine frontend deve essere ricostruita.

---

# Sviluppo manuale senza container applicativi

Per utilizzare direttamente i server di sviluppo sono necessari Node.js e npm.

## 1. Avviare MongoDB

```bash
docker compose up -d mongo
```

## 2. Avviare il backend

```bash
cd server
npm ci
npm run dev
```

## 3. Avviare il frontend

In un altro terminale:

```bash
cd client
npm ci
npm run dev
```

Con il backend sulla porta standard, il frontend utilizza:

```text
http://localhost:3000
```

come fallback.

Per utilizzare un backend differente configurare `VITE_API_URL`.

---

# Comandi npm

## Backend

Eseguire da `server/`.

| Comando | Descrizione |
| --- | --- |
| `npm start` | Avvia backend Express e Socket.IO |
| `npm run dev` | Avvia il backend in modalità sviluppo |
| `npm run seed` | Ripopola il database dimostrativo |

## Frontend

Eseguire da `client/`.

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia Vite |
| `npm run build` | Genera la build di produzione |
| `npm run lint` | Esegue ESLint |
| `npm run preview` | Serve la build localmente |

---

# Deployment online

Il repository contiene:

```text
render.yaml
```

per il deployment dimostrativo su Render.

Il servizio Render costruisce il frontend e lo serve tramite Express insieme a:

- API REST;
- Swagger UI;
- Socket.IO.

La persistenza online utilizza MongoDB Atlas.

La procedura dettagliata è disponibile in:

[Deployment dimostrativo su Render](./docs/deployment-render.md)

L'endpoint utilizzato per l'health check è:

```text
/health
```

Il seed non viene eseguito automaticamente durante il deployment.

---

# Struttura del repository

```text
T-ACCAT-T-VENN/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── theme/
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── docs/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   ├── Dockerfile
│   └── server.js
│
├── docs/
│   ├── UML uso/
│   ├── UML sequenza/
│   ├── componenti-react.md
│   ├── deployment-render.md
│   ├── modello-dati.md
│   ├── modello-dati-diagramma-er.pdf
│   └── scenario-applicativo-e-architettura.md
│
├── docker-compose.yaml
├── render.yaml
└── README.md
```

---

# Documentazione

La documentazione principale del progetto è disponibile nella cartella `docs/`.

Documenti principali:

- [Scenario applicativo e architettura](./docs/scenario-applicativo-e-architettura.md)
- [Modello dei dati](./docs/modello-dati.md)
- [Diagramma ER](./docs/modello-dati-diagramma-er.pdf)
- [Componenti React](./docs/componenti-react.md)
- [UML casi d'uso](./docs/UML%20uso/)
- [UML di sequenza](./docs/UML%20sequenza/)
- [Deployment Render](./docs/deployment-render.md)
- [Documentazione frontend](./client/README.md)
- [Riepilogo API backend](./server/API.md)

Con il backend avviato, Swagger UI è disponibile su:

```text
http://localhost:3000/api-docs
```

La specifica OpenAPI completa si trova in:

```text
server/docs/swaggerSpec.js
```

---

# Risoluzione dei problemi

## I container non diventano healthy

Controllare:

```bash
docker compose ps
docker compose logs --tail=100 mongo
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

Il frontend dipende dal backend e il backend dipende da MongoDB.

---

## `server/.env` non esiste

Crearlo da:

```text
server/.env.example
```

e valorizzare almeno:

```text
JWT_ACCESS_SECRET
```

---

## Il backend non si collega a MongoDB

Dentro Docker utilizzare:

```text
mongodb://mongo:27017/taccat
```

Avviando il backend direttamente sull'host utilizzare:

```text
mongodb://localhost:27017/taccat
```

---

## Una porta è già occupata

Arrestare lo stack precedente:

```bash
docker compose down
```

oppure terminare il processo che utilizza la porta interessata.

---

## Il frontend non mostra le ultime modifiche

Ricostruire le immagini:

```bash
docker compose up --build -d
```

---

## Il frontend non comunica con il backend

Verificare:

- stato del backend;
- `VITE_API_URL`;
- `CLIENT_ORIGIN`;
- eventuali errori CORS;
- corretta ricostruzione della build frontend.

---

## Le notifiche real-time non arrivano

Verificare:

- login dell'utente;
- validità dell'access token;
- connessione Socket.IO;
- presenza della ricerca salvata;
- `attiva = true`;
- compatibilità del nuovo annuncio con i filtri;
- log del backend.

Per controllare il backend:

```bash
docker compose logs --tail=100 backend
```

---

# Sicurezza e limiti

Non devono essere versionati file `.env` contenenti segreti.

Utilizzare un `JWT_ACCESS_SECRET` lungo e casuale.

Gli account seed e la password:

```text
Password123!
```

sono destinati esclusivamente all'ambiente dimostrativo.

La configurazione Docker locale è pensata per sviluppo e dimostrazione e non rappresenta una configurazione completa di produzione.

Il progetto non include attualmente una suite completa di test automatizzati o una pipeline CI.

Socket.IO utilizza un singolo processo backend. Una futura scalabilità orizzontale richiederebbe un meccanismo di condivisione degli eventi tra istanze.