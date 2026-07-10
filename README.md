# T'ACCAT & T'VENN

Piattaforma universitaria per mettere in contatto lavoratori e imprenditori nel settore agricolo.

Il progetto è diviso in due parti principali:

- `client`: frontend React/Vite
- `server`: backend Node.js/Express collegato a MongoDB

## Frontend

Il frontend si trova nella cartella `client`.

Entrare nella cartella `client`:

```bash
cd client
```

Installare le dipendenze:

```bash
npm install
```

Avviare il frontend in modalità sviluppo:

```bash
npm run dev
```

Una volta avviato, il frontend sarà disponibile di solito su:

```text
http://localhost:5173
```

Il frontend deve rimanere avviato mentre si lavora sull'interfaccia utente.

## Backend

Il backend si trova nella cartella `server`.

### Variabili ambiente

Per avviare il backend è necessario creare un file `.env` dentro la cartella `server`, prendendo come riferimento il file:

```text
server/.env.example
```

Le variabili richieste sono:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
```

Il file `.env` contiene valori privati e non deve essere caricato su GitHub.

## Database con Docker

Il progetto può avviare MongoDB tramite Docker Compose.

Prima di eseguire i comandi Docker, assicurarsi che Docker Desktop sia aperto e in esecuzione.

Avviare MongoDB:

```bash
docker compose up -d
```

Verificare che il container sia attivo:

```bash
docker ps
```

Il container MongoDB si chiama:

```text
taccat-mongo
```

Con backend avviato fuori da Docker, usare nel file `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/taccat
```

Fermare i servizi Docker:

```bash
docker compose down
```

## Avvio backend

Entrare nella cartella `server`:

```bash
cd server
```

Installare le dipendenze:

```bash
npm install
```

Avviare il backend:

```bash
npm run dev
```

Una volta avviato, il backend sarà disponibile su:

```text
http://localhost:3000
```

## Avvio completo in locale

Per avviare tutto il progetto in locale servono tre componenti:

- MongoDB tramite Docker
- backend Express
- frontend React/Vite

### 1. Avviare MongoDB con Docker

Prima di tutto aprire Docker Desktop e assicurarsi che sia in esecuzione.

Dalla cartella principale del progetto:

```bash
docker compose up -d
```

Verificare che il container MongoDB sia attivo:

```bash
docker ps
```

Il container dovrebbe chiamarsi:

```text
taccat-mongo
```

### 2. Avviare il backend

Aprire un terminale ed entrare nella cartella `server`:

```bash
cd server
```

Installare le dipendenze, se non sono già state installate:

```bash
npm install
```

Avviare il backend:

```bash
npm run dev
```

Il backend sarà disponibile su:

```text
http://localhost:3000
```

### 3. Avviare il frontend

Aprire un secondo terminale ed entrare nella cartella `client`:

```bash
cd client
```

Installare le dipendenze, se non sono già state installate:

```bash
npm install
```

Avviare il frontend:

```bash
npm run dev
```

Il frontend sarà disponibile su:

```text
http://localhost:5173
```

### 4. Aprire il progetto

Una volta avviati MongoDB, backend e frontend, aprire nel browser:

```text
http://localhost:5173
```

## Checklist di controllo

Per verificare che il progetto sia avviato correttamente:

- MongoDB deve essere attivo nel container `taccat-mongo`.
- Il backend deve rispondere su `http://localhost:3000`.
- Il frontend deve essere disponibile su `http://localhost:5173`.
- Il file `server/.env` deve esistere solo in locale.
