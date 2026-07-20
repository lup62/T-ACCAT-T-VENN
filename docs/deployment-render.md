# Deployment dimostrativo su Render

Questa configurazione pubblica frontend React, API Express, Swagger e Socket.IO in un'unica Web Service Render. L'applicazione usa quindi un solo URL HTTPS e continua a collegarsi al database MongoDB Atlas già esistente.

Il file [`render.yaml`](../render.yaml) descrive il servizio e rende ripetibile il deployment dal branch `develop`. Il seed non viene eseguito durante build o avvio.

## Prerequisiti

- repository aggiornato su GitHub, incluso `render.yaml`;
- account Render collegato a GitHub;
- connection string di MongoDB Atlas, comprensiva del nome del database;
- utente Atlas con i permessi necessari sul database applicativo.

La URI Atlas ha una forma simile a questa:

```text
mongodb+srv://UTENTE:PASSWORD@CLUSTER.mongodb.net/taccat?retryWrites=true&w=majority
```

Non inserire la URI reale in file versionati.

## Creazione del servizio

1. Accedere alla Dashboard Render e scegliere **New > Blueprint**.
2. Collegare il repository `T-ACCAT-T-VENN`.
3. Se richiesto, selezionare `develop` come branch del Blueprint e lasciare `render.yaml` come percorso.
4. Inserire la connection string Atlas nel valore richiesto per `MONGODB_URI`.
5. Applicare il Blueprint e attendere build e avvio.

`JWT_ACCESS_SECRET` viene generato automaticamente. L'URL pubblico assegnato da Render viene invece usato automaticamente sia dal frontend sia dal CORS del backend.

## Autorizzazione della rete Atlas

Se Atlas limita gli indirizzi autorizzati, il primo avvio può fallire finché Render non è presente nella IP Access List:

1. aprire il servizio nella Dashboard Render;
2. scegliere **Connect > Outbound** e copiare tutti gli intervalli CIDR mostrati;
3. in Atlas aprire **Network Access > IP Access List** e aggiungere quegli intervalli;
4. tornare su Render e scegliere **Manual Deploy > Deploy latest commit**.

Per una demo è possibile che Atlas sia già configurato per consentire connessioni da qualsiasi indirizzo. È più sicuro autorizzare soltanto gli intervalli in uscita indicati da Render.

## Verifica

Quando il deploy risulta `Live`, controllare:

- `https://NOME-SERVIZIO.onrender.com/` per l'applicazione;
- `https://NOME-SERVIZIO.onrender.com/health` per lo stato del backend;
- `https://NOME-SERVIZIO.onrender.com/api-docs` per Swagger UI;
- registrazione o login, caricamento annunci, filtri e chat.

Ogni push successivo su `develop` avvia automaticamente un nuovo deploy. Sul piano gratuito il servizio può sospendersi dopo un periodo senza traffico: prima di una presentazione conviene aprire il sito e attendere il completamento del primo caricamento.

## Seed del database

Il seed è intenzionalmente escluso dal deployment perché elimina i dati gestiti dallo script prima di ricreare il dataset dimostrativo. Non eseguire `npm run seed` sull'Atlas già in uso, a meno che un reset completo sia davvero voluto e sia disponibile un backup.

Se il database Atlas contiene già i dati desiderati, non è necessaria alcuna inizializzazione aggiuntiva.

## Aggiornamenti e problemi comuni

- **Build fallita:** controllare i log Render e verificare che il commit con `render.yaml` sia su `develop`.
- **Errore MongoDB:** verificare `MONGODB_URI`, credenziali dell'utente Atlas e IP Access List.
- **Primo caricamento lento:** è il normale risveglio del servizio gratuito; attendere e ricaricare.
- **Variabile modificata:** salvare la modifica nella sezione **Environment** e avviare un nuovo deploy.
- **Nuova versione:** è sufficiente effettuare il push su `develop`; non serve ricreare il Blueprint.
