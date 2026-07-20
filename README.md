# T'ACCAT & T'VENN

**Coltiviamo nuove opportunità di lavoro.**

T'ACCAT & T'VENN è una piattaforma web universitaria che mette in contatto lavoratori e imprenditori del settore agricolo.

La piattaforma supporta entrambe le direzioni dell'incontro tra domanda e offerta: gli imprenditori pubblicano richieste di manodopera, mentre i lavoratori pubblicano la propria disponibilità. Ogni account può avere il ruolo `lavoratore`, `imprenditore` oppure entrambi.

## Funzionalità principali

- registrazione, login, rinnovo della sessione e logout;
- profilo personale e profili pubblici di lavoratori e imprenditori;
- pubblicazione e gestione di richieste di manodopera e disponibilità di lavoro;
- ricerca testuale, filtri, ordinamento e visualizzazione degli annunci su mappa;
- geocoding dei luoghi e memorizzazione delle coordinate GeoJSON;
- proposte inviate e ricevute, con accettazione o rifiuto;
- gestione del ciclo di vita degli annunci: `aperto`, `in_corso`, `concluso`, `chiuso`;
- annunci e profili preferiti, con interfaccia corrente focalizzata sugli annunci;
- recensioni reciproche dopo una collaborazione conclusa;
- conversazioni private 1:1 e storico dei messaggi;
- invio e ricezione dei messaggi in tempo reale tramite Socket.IO;
- conferme di lettura dei messaggi;
- documentazione interattiva delle API tramite Swagger UI.

## Avvio rapido con Docker

Docker Compose è il metodo consigliato per eseguire l'intera applicazione. Avvia frontend, backend e MongoDB senza richiedere Node.js o MongoDB installati sul computer host.

### Prerequisiti

- Git;
- Docker Desktop oppure Docker Engine;
- Docker Compose v2, disponibile tramite il comando `docker compose`;
- porte `5173`, `3000` e `27017` libere.

### 1. Clonazione del repository

```bash
git clone --branch develop https://github.com/lup62/T-ACCAT-T-VENN.git
cd T-ACCAT-T-VENN
```

Se il repository è già presente in locale, eseguire i comandi successivi dalla sua cartella principale.

### 2. Configurazione del backend

Creare `server/.env` partendo dal file di esempio.

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

macOS/Linux:

```bash
cp server/.env.example server/.env
```

Aprire `server/.env` e impostare almeno una chiave JWT lunga e casuale:

```env
JWT_ACCESS_SECRET=inserire_una_chiave_segreta_lunga_e_casuale
```

Il file `server/.env` è richiesto da Compose, contiene dati riservati ed è escluso da Git. In ambiente Docker, Compose imposta direttamente porta, origine frontend, ambiente e indirizzo MongoDB; il valore indispensabile fornito dal file è `JWT_ACCESS_SECRET`.

### 3. Build e avvio

```bash
docker compose up --build -d
```

Compose costruisce le immagini applicative, avvia i servizi e aspetta che ogni dipendenza sia healthy secondo l'ordine `mongo` → `backend` → `frontend`.

Controllare lo stato:

```bash
docker compose ps
```

I tre servizi devono risultare `healthy`.

### 4. Indirizzi locali

| Servizio | Indirizzo | Mapping Docker |
| --- | --- | --- |
| Frontend | [http://localhost:5173](http://localhost:5173) | host `5173` → container `80` |
| Backend | [http://localhost:3000](http://localhost:3000) | host `3000` → container `3000` |
| Swagger UI | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | servito dal backend |
| API REST | `http://localhost:3000/api` | servita dal backend |
| MongoDB | `mongodb://localhost:27017/taccat` | host `27017` → container `27017` |

La risposta prevista visitando il backend è:

```text
Backend T'ACCAT attivo!
```

## Dati dimostrativi

Con lo stack avviato, eseguire il seed dentro il container del backend:

```bash
docker compose exec backend npm run seed
```

> **Attenzione:** il seed elimina i dati applicativi gestiti dallo script prima di ricreare il dataset dimostrativo. Usarlo esclusivamente sul database di sviluppo.

Il dataset corrente crea:

- 20 utenti;
- 36 annunci;
- 25 proposte;
- 12 recensioni;
- 23 preferiti.

Il seed non crea conversazioni o messaggi dimostrativi. Tutti gli utenti generati usano la password:

```text
Password123!
```

Account di esempio:

| Ruolo | Nome | Email |
| --- | --- | --- |
| Imprenditore | Giovanni Russo | `giovanni.russo@seed.local` |
| Lavoratore | Luca Moretti | `luca.moretti@seed.local` |
| Imprenditore e lavoratore | Paolo Quaranta | `paolo.quaranta@seed.local` |

## Gestione dello stack Docker

Eseguire i comandi dalla cartella principale del progetto.

| Operazione | Comando |
| --- | --- |
| Build o rebuild e avvio | `docker compose up --build -d` |
| Stato dei servizi | `docker compose ps` |
| Log di tutti i servizi | `docker compose logs -f` |
| Ultime 100 righe del backend | `docker compose logs --tail=100 backend` |
| Arresto temporaneo | `docker compose stop` |
| Ripresa dei container arrestati | `docker compose start` |
| Arresto e rimozione di container e rete | `docker compose down` |

`docker compose down` conserva il volume `mongo_data` e quindi i dati MongoDB.

Per eliminare anche il database persistente ed eseguire un reset completo:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend npm run seed
```

> **Attenzione:** `docker compose down -v` elimina definitivamente il volume `mongo_data`.

Il codice viene copiato nelle immagini e non sono configurati bind mount o hot reload nei container. Dopo una modifica al codice o alla configurazione occorre quindi ricostruire con `docker compose up --build -d`.

## Architettura in breve

```text
Browser
├── frontend React/Vite servito da Nginx
├── chiamate REST e Socket.IO verso il backend
└── chiamate HTTPS a Nominatim e ai provider cartografici

Backend Node.js/Express/Socket.IO
└── Mongoose → MongoDB
```

L'applicazione adotta un'architettura client-server a tre livelli:

1. la Single Page Application React gestisce interfaccia, routing, stato della sessione, filtri e mappe;
2. il backend modulare Express espone API REST, autenticazione, regole applicative, Swagger e Socket.IO sullo stesso server HTTP;
3. MongoDB persiste utenti, annunci, proposte, preferiti, recensioni, conversazioni, messaggi e refresh token.

La chat usa REST per apertura delle conversazioni, storico e conferme di lettura; invio e ricezione dei nuovi messaggi passano invece da Socket.IO. Il frontend interroga direttamente Nominatim per il geocoding e usa tile CARTO con dati OpenStreetMap per le mappe.

### Container Docker

| Servizio | Immagine o build | Responsabilità |
| --- | --- | --- |
| `frontend` | build Node.js 22, runtime Nginx 1.27 | Compila la SPA con Vite e serve i file statici con fallback verso `index.html`. |
| `backend` | `server/Dockerfile`, Node.js 22 Alpine | Esegue Express, API REST, Swagger e Socket.IO sulla porta `3000`. |
| `mongo` | `mongo:7` | Persiste i dati nel volume `mongo_data`. |

Tutti i servizi usano la rete bridge `taccat-network`, la policy di riavvio `unless-stopped` e healthcheck dedicati.

## Stack tecnologico

| Area | Tecnologie principali |
| --- | --- |
| Frontend | React 19, Vite 8, Material UI, React Router, Leaflet, React Leaflet, Socket.IO Client |
| Backend | Node.js 22, Express 5, Mongoose, JSON Web Token, bcrypt, Socket.IO, Swagger UI |
| Database | MongoDB 7 in locale, MongoDB Atlas online, GeoJSON e indici geospaziali `2dsphere` |
| Infrastruttura | Docker, Docker Compose, Nginx 1.27, Render, Git e GitHub |
| Servizi esterni | Nominatim, CARTO e OpenStreetMap |

## Variabili di ambiente

| Componente | Variabile | Uso |
| --- | --- | --- |
| Backend | `PORT` | Porta HTTP. Compose usa `3000`. |
| Backend | `CLIENT_ORIGIN` | Origine autorizzata dal CORS. Compose usa `http://localhost:5173`. |
| Backend | `NODE_ENV` | Ambiente di esecuzione. Compose usa `development`. |
| Backend | `MONGODB_URI` | Connessione al database. Compose usa `mongodb://mongo:27017/taccat`. |
| Backend | `JWT_ACCESS_SECRET` | Segreto obbligatorio per firmare gli access token JWT. |
| Frontend | `VITE_API_URL` | URL base per REST e Socket.IO. Compose usa `http://localhost:3000`. |

`VITE_API_URL` è un argomento di build: viene incorporato nel bundle frontend. Se cambia, l'immagine `frontend` deve essere ricostruita.

## Deployment online con Render

Per la pubblicazione dimostrativa è disponibile il Blueprint [`render.yaml`](./render.yaml). Il servizio gratuito esegue frontend, API, Swagger e Socket.IO sullo stesso URL HTTPS e usa il database MongoDB Atlas esistente.

La procedura completa, inclusi configurazione di `MONGODB_URI`, IP Access List di Atlas, verifica e avvertenze sul seed, è descritta in [Deployment dimostrativo su Render](./docs/deployment-render.md).

In sintesi:

1. creare un Blueprint Render collegato al repository e al branch `develop`;
2. inserire `MONGODB_URI` quando richiesto;
3. autorizzare in Atlas gli indirizzi in uscita mostrati da Render;
4. aprire l'URL `onrender.com` assegnato al servizio.

Il seed non parte automaticamente e non deve essere lanciato sull'Atlas già popolato, perché esegue un reset dei dati applicativi.

## Sviluppo manuale senza container applicativi

Per lavorare con i server di sviluppo npm servono Node.js 22 e npm. Non avviare contemporaneamente lo stack Docker completo, perché frontend e backend userebbero le stesse porte.

### 1. Avviare soltanto MongoDB

```bash
docker compose up -d mongo
```

Per questa modalità, in `server/.env` usare:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taccat
JWT_ACCESS_SECRET=inserire_una_chiave_segreta_lunga_e_casuale
```

### 2. Avviare il backend

```bash
cd server
npm ci
npm run dev
```

### 3. Avviare il frontend

In un secondo terminale:

```bash
cd client
npm ci
npm run dev
```

Con il backend sulla porta standard non è necessario creare `client/.env`, perché il frontend usa il fallback `http://localhost:3000`. Per un backend differente impostare `VITE_API_URL` in `client/.env`.

## Comandi npm disponibili

### Backend

Eseguire dalla cartella `server/`.

| Comando | Descrizione |
| --- | --- |
| `npm start` | Avvia Express e Socket.IO in modalità standard. |
| `npm run dev` | Avvia Express e Socket.IO tramite `node server.js`. |
| `npm run seed` | Svuota e ripopola il database di sviluppo con dati dimostrativi. |

### Frontend

Eseguire dalla cartella `client/`.

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia Vite con hot reload. |
| `npm run build` | Genera la build statica in `dist/`. |
| `npm run lint` | Esegue ESLint sul frontend. |
| `npm run preview` | Serve localmente la build generata. |

## Struttura del repository

```text
T-ACCAT-T-VENN/
├── client/                     # Frontend React/Vite
│   ├── src/                    # Pagine, componenti, hook, context e service
│   ├── Dockerfile              # Build Vite e runtime Nginx
│   └── nginx.conf              # Configurazione SPA fallback
├── server/                     # Backend Node.js/Express
│   ├── config/                 # Connessione MongoDB
│   ├── controllers/            # Casi d'uso e regole applicative
│   ├── docs/                   # Specifica OpenAPI/Swagger
│   ├── middlewares/            # Autenticazione e autorizzazione
│   ├── models/                 # Schemi e indici Mongoose
│   ├── routes/                 # Rotte REST
│   ├── scripts/                # Seed del database
│   ├── sockets/                # Autenticazione e chat real-time
│   ├── Dockerfile              # Immagine backend Node.js
│   └── server.js               # Entry point del server
├── docs/                       # Documentazione progettuale e diagrammi UML
├── docker-compose.yaml         # Orchestrazione dell'intero stack
├── render.yaml                 # Blueprint del deployment dimostrativo
└── README.md
```

## Documentazione

Per gli approfondimenti progettuali bisogna fare riferimento ai documenti presenti nella cartella [`docs/`](./docs/) e nelle relative sottocartelle.

- [Scenario applicativo e architettura](./docs/scenario-applicativo-e-architettura.md)
- [Componenti React](./docs/componenti-react.md)
- [Deployment dimostrativo su Render](./docs/deployment-render.md)
- [Diagrammi UML di sequenza](./docs/UML%20sequenza/)
- [Documentazione del frontend](./client/README.md)
- [Riepilogo delle API backend](./server/API.md)
- [Swagger UI](http://localhost:3000/api-docs), disponibile con il backend avviato

La documentazione Swagger comprende anche le API delle conversazioni. Il file `server/API.md` è un riepilogo statico e potrebbe non coprire ogni endpoint presente nella specifica interattiva.

## Risoluzione dei problemi

### Uno o più container non diventano healthy

Controllare stato e log:

```bash
docker compose ps
docker compose logs --tail=100 mongo
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

Il frontend parte dopo il backend e il backend parte dopo MongoDB; un errore in un servizio blocca quindi quelli dipendenti.

### Compose segnala che `server/.env` non esiste

Crearlo da `server/.env.example` e valorizzare `JWT_ACCESS_SECRET`, come descritto nell'avvio rapido.

### Il backend non si collega a MongoDB

- dentro Docker l'URI deve usare il nome del servizio: `mongodb://mongo:27017/taccat`;
- con backend avviato sull'host deve usare `mongodb://localhost:27017/taccat`.

Compose imposta automaticamente il primo valore per il container backend.

### Una porta è già occupata

Arrestare eventuali processi locali o un precedente stack:

```bash
docker compose down
```

Se si modificano i mapping di porta in `docker-compose.yaml`, aggiornare anche `CLIENT_ORIGIN` e il build argument `VITE_API_URL`, quindi ricostruire le immagini.

### Il frontend non riflette le ultime modifiche

I container non usano hot reload. Ricostruire le immagini:

```bash
docker compose up --build -d
```

### Il frontend non comunica con il backend

Controllare che:

- `backend` sia healthy;
- `VITE_API_URL` punti all'indirizzo raggiungibile dal browser;
- `CLIENT_ORIGIN` corrisponda all'indirizzo del frontend;
- il browser non segnali errori CORS;
- dopo una modifica a `VITE_API_URL` sia stata ricostruita l'immagine frontend.

### Serve un database completamente pulito

Usare il reset con volume soltanto se la perdita dei dati locali è accettabile:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend npm run seed
```

## Sicurezza e limiti dell'ambiente locale

- non versionare mai `server/.env`;
- usare un `JWT_ACCESS_SECRET` lungo, casuale e diverso tra ambienti;
- non usare gli account e la password del seed in produzione;
- la configurazione Compose è pensata per sviluppo locale: usa `NODE_ENV=development`, non configura TLS ed espone le tre porte sull'host;
- Nominatim e i provider cartografici sono dipendenze esterne soggette alle rispettive policy e disponibilità;
- il repository non include attualmente una suite di test automatizzata o una pipeline CI.

## Autori

Il progetto è sviluppato a scopo universitario ed è stato sviluppato da Oronzo Franchini, Giovanni Pastore e Pasquale Lorusso
