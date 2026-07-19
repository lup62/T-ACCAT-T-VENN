# T'ACCAT & T'VENN

**Coltiviamo nuove opportunità di lavoro.**

T'ACCAT & T'VENN è una piattaforma web universitaria pensata per mettere in contatto lavoratori e imprenditori del settore agricolo.

Gli imprenditori possono pubblicare opportunità di lavoro, mentre i lavoratori possono cercare gli annunci disponibili, inviare proposte e comunicare direttamente con gli autori.

## Funzionalità principali

- registrazione e autenticazione degli utenti;
- gestione dei profili lavoratore e imprenditore;
- pubblicazione e gestione degli annunci di lavoro;
- ricerca degli annunci anche tramite posizione geografica;
- invio, accettazione e rifiuto delle proposte;
- salvataggio degli annunci preferiti;
- gestione delle recensioni;
- conversazioni private tra utenti;
- messaggistica in tempo reale tramite Socket.IO;
- conferme di lettura dei messaggi;
- documentazione interattiva delle API tramite Swagger.

## Tecnologie utilizzate

### Frontend

- React
- Vite
- Material UI
- React Router
- Leaflet
- React Leaflet

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token
- bcrypt
- Socket.IO
- Swagger UI

### Infrastruttura

- Docker
- Docker Compose
- Git e GitHub

## Struttura del progetto

```text
T-ACCAT-T-VENN/
├── client/                 # Frontend React/Vite
├── server/                 # Backend Node.js/Express
│   ├── config/             # Configurazione del database
│   ├── controllers/        # Logica degli endpoint
│   ├── docs/               # Configurazione Swagger
│   ├── middlewares/        # Autenticazione e autorizzazione
│   ├── models/             # Modelli Mongoose
│   ├── routes/             # Rotte REST
│   ├── scripts/            # Script di popolamento del database
│   ├── sockets/            # Gestione della chat real-time
│   └── server.js           # Punto di ingresso del backend
├── docker-compose.yaml     # Configurazione MongoDB
└── README.md
```

## Prerequisiti

Prima di avviare il progetto è necessario avere installato:

- Node.js e npm;
- Docker Desktop;
- Git.

Docker Desktop deve essere aperto e in esecuzione prima di avviare MongoDB.

## Configurazione del backend

Entrare nella cartella del backend:

```bash
cd server
```

Installare le dipendenze:

```bash
npm install
```

Creare il file `.env` partendo dal modello disponibile:

```text
server/.env.example
```

Configurazione consigliata per l'esecuzione locale:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taccat
JWT_ACCESS_SECRET=inserire_una_chiave_segreta_sicura
```

Il file `.env` contiene informazioni riservate e non deve essere caricato su GitHub.

## Avvio di MongoDB con Docker

Dalla cartella principale del progetto eseguire:

```bash
docker compose up -d
```

Docker avvierà:

- il servizio `mongo`;
- il container `taccat-mongo`;
- MongoDB sulla porta `27017`;
- il volume persistente `mongo_data`.

Controllare che il container sia attivo:

```bash
docker ps
```

Per fermare MongoDB:

```bash
docker compose down
```

I dati memorizzati nel volume Docker non vengono eliminati dal normale comando `docker compose down`.

## Popolamento del database

Con MongoDB attivo, entrare nella cartella `server` ed eseguire:

```bash
npm run seed
```

Lo script inserisce utenti, annunci, proposte, recensioni, preferiti e conversazioni dimostrative.

Tutti gli utenti creati dal seed utilizzano la password:

```text
Password123!
```

Alcuni account disponibili:

| Ruolo | Nome | Email |
|---|---|---|
| Imprenditore | Giovanni Russo | `giovanni.russo@seed.local` |
| Lavoratore | Luca Moretti | `luca.moretti@seed.local` |
| Imprenditore e lavoratore | Paolo Quaranta | `paolo.quaranta@seed.local` |

Gli account del seed sono destinati esclusivamente allo sviluppo e alle dimostrazioni locali.

## Avvio del backend

Dalla cartella `server`:

```bash
npm run dev
```

Il backend sarà disponibile su:

```text
http://localhost:3000
```

Per controllare che sia attivo, aprire l'indirizzo nel browser. La risposta prevista è:

```text
Backend T'ACCAT attivo!
```

## Documentazione delle API

Con il backend avviato, Swagger è disponibile su:

```text
http://localhost:3000/api-docs
```

La documentazione descrive le principali API relative a:

- autenticazione;
- utenti;
- annunci;
- proposte;
- recensioni;
- preferiti;
- conversazioni.

Nel backend è presente anche il file:

```text
server/API.md
```

## Avvio del frontend

Aprire un secondo terminale ed entrare nella cartella del frontend:

```bash
cd client
```

Installare le dipendenze:

```bash
npm install
```

Avviare il server di sviluppo:

```bash
npm run dev
```

Il frontend sarà normalmente disponibile su:

```text
http://localhost:5173
```

MongoDB e backend devono rimanere attivi durante l'utilizzo completo della piattaforma.

## Avvio completo in locale

Servono tre terminali o processi distinti.

### Terminale 1 — Database

Dalla cartella principale:

```bash
docker compose up -d
```

### Terminale 2 — Backend

```bash
cd server
npm install
npm run dev
```

### Terminale 3 — Frontend

```bash
cd client
npm install
npm run dev
```

Aprire quindi:

```text
http://localhost:5173
```

## Comandi disponibili

### Backend

Dalla cartella `server`:

```bash
npm run dev
```

Avvia il backend Express e il server Socket.IO.

```bash
npm run seed
```

Popola il database con dati dimostrativi.

### Frontend

Dalla cartella `client`:

```bash
npm run dev
```

Avvia il frontend in modalità sviluppo.

```bash
npm run build
```

Genera la build di produzione.

```bash
npm run lint
```

Esegue il controllo ESLint.

```bash
npm run preview
```

Avvia localmente l'anteprima della build di produzione.

## Risoluzione dei problemi

### Il backend non si collega a MongoDB

Controllare che Docker Desktop sia attivo e verificare il container:

```bash
docker ps
```

Nel file `server/.env` deve essere presente:

```env
MONGODB_URI=mongodb://localhost:27017/taccat
```

### La porta 3000 è già occupata

Modificare `PORT` nel file `server/.env` e aggiornare di conseguenza gli indirizzi utilizzati dal frontend.

### La porta 5173 è già occupata

Vite può scegliere automaticamente un'altra porta. In questo caso aggiornare anche `CLIENT_ORIGIN` nel file `server/.env`.

### Il frontend non comunica con il backend

Controllare che:

- il backend sia attivo;
- `CLIENT_ORIGIN` corrisponda all'indirizzo del frontend;
- il browser non segnali errori CORS;
- MongoDB sia correttamente collegato.

### Il database non contiene dati dimostrativi

Dalla cartella `server` eseguire:

```bash
npm run seed
```

## Checklist di controllo

Prima di utilizzare la piattaforma verificare che:

- Docker Desktop sia attivo;
- il container `taccat-mongo` sia in esecuzione;
- il file `server/.env` sia configurato;
- il backend risponda su `http://localhost:3000`;
- Swagger sia disponibile su `http://localhost:3000/api-docs`;
- il frontend sia disponibile su `http://localhost:5173`.

## Sicurezza

- Non pubblicare mai il file `.env`.
- Non utilizzare la password degli account seed in produzione.
- Utilizzare una chiave JWT lunga e non prevedibile.
- Gli account e i dati creati dal seed sono esclusivamente dimostrativi.

## Stato del progetto

Il progetto è sviluppato a scopo universitario ed è attualmente in fase di completamento e verifica.
