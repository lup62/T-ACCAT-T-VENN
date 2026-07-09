# T'ACCAT & T'VENN

Piattaforma universitaria per mettere in contatto lavoratori e imprenditori nel settore agricolo.

Il progetto è diviso in due parti principali:

- `client`: frontend React/Vite
- `server`: backend Node.js/Express collegato a MongoDB

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