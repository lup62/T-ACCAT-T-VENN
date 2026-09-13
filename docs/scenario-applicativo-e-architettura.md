# Scenario applicativo e architettura — T'ACCAT & T'VENN

## 1. Scopo del documento

Questo documento descrive lo scenario applicativo e l'architettura attualmente implementata di **T'ACCAT & T'VENN**.

La piattaforma mette in contatto lavoratori e imprenditori del settore agricolo attraverso annunci geolocalizzati, proposte di collaborazione, chat privata, preferiti, ricerche salvate e notifiche.

L'applicazione è realizzata come **Single Page Application con client-side rendering** e utilizza:

- React per il frontend;
- Node.js ed Express per il backend;
- MongoDB con Mongoose per la persistenza;
- Socket.IO per le funzionalità real-time;
- Material UI per l'interfaccia;
- Leaflet per la visualizzazione cartografica;
- Docker per l'esecuzione containerizzata;
- Swagger/OpenAPI per la documentazione delle API.

Per gli approfondimenti progettuali e per i diagrammi bisogna fare riferimento ai documenti presenti nella cartella [`docs/`](./) e nelle relative sottocartelle.

In particolare:

- la descrizione dettagliata del frontend è contenuta in [`componenti-react.md`](./componenti-react.md);
- il modello dei dati è descritto in [`modello-dati.md`](./modello-dati.md);
- il diagramma ER è disponibile in [`modello-dati-diagramma-er.pdf`](./modello-dati-diagramma-er.pdf);
- i diagrammi UML dei casi d'uso sono raccolti nella cartella [`UML uso`](./UML%20uso/);
- i diagrammi UML di sequenza sono raccolti nella cartella [`UML sequenza`](./UML%20sequenza/).

I diagrammi non vengono duplicati all'interno di questo documento.

---

## 2. Scenario applicativo

### 2.1 Contesto e obiettivo

Nel lavoro agricolo la domanda di manodopera e la disponibilità dei lavoratori sono spesso stagionali, locali e legate a competenze specifiche.

T'ACCAT & T'VENN supporta entrambi i versi dell'incontro tra domanda e offerta:

- un imprenditore può pubblicare una **richiesta di manodopera**;
- un lavoratore può pubblicare una **disponibilità di lavoro**;
- gli utenti possono cercare opportunità per categoria, provincia, periodo e fascia di prezzo;
- gli annunci possono essere consultati sia tramite lista sia tramite mappa;
- un utente autenticato può salvare una configurazione di ricerca;
- le ricerche salvate attive vengono confrontate automaticamente con i nuovi annunci pubblicati;
- in caso di corrispondenza viene generata una notifica persistente e, se l'utente è connesso, anche una notifica real-time;
- gli utenti possono salvare annunci e profili tra i preferiti;
- le parti possono formalizzare l'interesse mediante una proposta;
- gli utenti coinvolti possono comunicare attraverso una chat privata 1:1;
- dopo la conclusione del rapporto di lavoro possono recensirsi reciprocamente.

Un singolo account può possedere il ruolo `lavoratore`, il ruolo `imprenditore` oppure entrambi.

I ruoli determinano il tipo di annuncio pubblicabile, mentre l'autorizzazione delle altre operazioni dipende anche dall'autenticazione, dalla proprietà delle risorse e dalla partecipazione alla collaborazione.

Non rientrano nel perimetro attuale:

- pagamenti;
- fatturazione;
- amministrazione della piattaforma;
- gestione contrattuale;
- selezione automatica dei candidati.

---

### 2.2 Attori

| Attore | Obiettivi e operazioni principali |
| --- | --- |
| Visitatore | Consultare gli annunci aperti, vedere dettagli pubblici, profili pubblici e recensioni; registrarsi o accedere per utilizzare le funzionalità riservate. Nell'interfaccia, alcune funzionalità avanzate sono disponibili soltanto dopo l'autenticazione. |
| Lavoratore | Gestire il proprio profilo e le competenze, pubblicare disponibilità di lavoro, consultare richieste di manodopera, utilizzare ricerca e filtri, salvare ricerche, ricevere notifiche, gestire preferiti, inviare proposte, usare la chat e lasciare o ricevere recensioni. |
| Imprenditore | Gestire il proprio profilo e i dati aziendali, pubblicare richieste di manodopera, consultare disponibilità di lavoratori, utilizzare ricerca e filtri, salvare ricerche, ricevere notifiche, gestire preferiti, accettare o rifiutare proposte, utilizzare la chat e lasciare o ricevere recensioni. |
| Utente con doppio ruolo | Svolgere entrambe le famiglie di operazioni utilizzando lo stesso account. |
| Servizi cartografici esterni | Nominatim converte un luogo testuale in coordinate geografiche; i provider cartografici forniscono i tile utilizzati dalle mappe Leaflet. Le richieste partono direttamente dal browser. |

Il backend rimane l'autorità per autenticazione, autorizzazione e regole di dominio.

Le limitazioni presenti esclusivamente nell'interfaccia grafica non vengono considerate un confine di sicurezza.

---

### 2.3 Casi d'uso principali

| Area | Casi d'uso |
| --- | --- |
| Identità | Registrazione con uno o due ruoli, login, rinnovo della sessione, logout, lettura e modifica del profilo, consultazione dei profili pubblici. |
| Annunci | Pubblicazione, consultazione in lista o su mappa, ricerca, filtri, dettaglio, modifica da parte dell'autore, elenco dei propri annunci, chiusura e conclusione. |
| Ricerche salvate | Salvataggio della ricerca corrente, consultazione delle ricerche salvate, modifica dei filtri, attivazione o disattivazione ed eliminazione. |
| Notifiche | Ricezione di notifiche per nuovi annunci compatibili, consultazione delle notifiche, marcatura come letta, marcatura di tutte come lette ed eliminazione. |
| Proposte | Invio di una proposta su un annuncio altrui, elenco delle proposte inviate e ricevute, accettazione o rifiuto da parte dell'autore dell'annuncio. |
| Comunicazione | Creazione o recupero di una conversazione 1:1, lettura dello storico, invio e ricezione di messaggi in tempo reale e marcatura dei messaggi come letti. |
| Fiducia | Recensioni reciproche dopo una collaborazione conclusa e aggiornamento del rating medio dell'utente. |
| Organizzazione personale | Aggiunta, consultazione e rimozione di annunci o profili preferiti; l'interfaccia corrente espone principalmente i preferiti relativi agli annunci. |

---

### 2.4 Flusso applicativo principale

1. L'utente si registra selezionando uno o entrambi i ruoli. L'indirizzo viene geocodificato e memorizzato sia come testo sia come punto GeoJSON.

2. Un imprenditore pubblica una richiesta di manodopera oppure un lavoratore pubblica la propria disponibilità, specificando luogo, periodo, categoria, competenze e compenso.

3. Gli altri utenti esplorano gli annunci aperti attraverso ricerca testuale, filtri, ordinamento, lista o mappa.

4. Un utente autenticato può salvare la configurazione corrente della ricerca, memorizzando tipo di annuncio, testo e filtri applicati.

5. Una ricerca salvata può essere successivamente modificata, attivata, disattivata oppure eliminata.

6. Quando viene pubblicato un nuovo annuncio, il backend confronta l'annuncio con le ricerche salvate attive compatibili.

7. Se viene rilevata una corrispondenza, il backend crea una notifica persistente per l'utente interessato. Se più ricerche dello stesso utente corrispondono allo stesso annuncio, vengono aggregate all'interno della stessa notifica.

8. Se il destinatario è online, la notifica viene trasmessa anche tramite Socket.IO e compare nel menu notifiche senza necessità di ricaricare la pagina.

9. Un utente autenticato può inviare una proposta su un annuncio non proprio.

10. L'autore dell'annuncio accetta o rifiuta la proposta. L'accettazione porta l'annuncio nello stato `in_corso`; sullo stesso annuncio possono essere accettate più proposte e quelle ancora in attesa non vengono rifiutate automaticamente in questa fase.

11. Le parti possono aprire una conversazione collegata facoltativamente all'annuncio e comunicare in tempo reale.

12. L'autore conclude il lavoro. L'annuncio passa allo stato `concluso` e le proposte rimaste `in_attesa` vengono rifiutate.

13. In alternativa, un annuncio ancora `aperto` può essere chiuso senza avviare una collaborazione.

14. Dopo la conclusione, i partecipanti a una collaborazione accettata possono recensirsi reciprocamente; il backend ricalcola il rating medio del destinatario.

---

### 2.5 Stati di annunci e proposte

| Stato annuncio | Significato | Transizioni ammesse |
| --- | --- | --- |
| `aperto` | Visibile nella lista pubblica e disponibile per nuove proposte. | `in_corso` con un'accettazione; `chiuso` per decisione dell'autore. |
| `in_corso` | Esiste almeno una proposta accettata; altre proposte possono ancora essere gestite. | Resta `in_corso` con ulteriori accettazioni; passa a `concluso` quando l'autore termina il lavoro. |
| `concluso` | La collaborazione è terminata e può essere recensita. | Stato terminale nel flusso corrente. |
| `chiuso` | L'annuncio è stato ritirato prima dell'avvio del lavoro. | Stato terminale nel flusso corrente. |

Una proposta nasce nello stato `in_attesa` e può successivamente diventare:

- `accettata`;
- `rifiutata`.

La chiusura di un annuncio aperto e la conclusione di un annuncio in corso trasformano automaticamente in `rifiutata` ogni proposta ancora in attesa.

Gli annunci non più aperti sono visibili secondo le regole applicative definite dal backend.

---

## 3. Architettura dell'applicazione

### 3.1 Stile architetturale

L'applicazione segue un'architettura client-server a tre livelli:

1. una **Single Page Application React** gestisce presentazione, navigazione e stato dell'interfaccia;
2. un **monolite backend modulare Node.js** espone API REST e Socket.IO attraverso lo stesso server HTTP;
3. **MongoDB** persiste dati applicativi e informazioni necessarie al mantenimento della sessione.

Il backend è organizzato per responsabilità attraverso cartelle dedicate a:

- routes;
- middlewares;
- controllers;
- models;
- services;
- utils;
- sockets.

La struttura presenta una separazione simile a MVC per la parte REST, integrata con service applicativi per logiche che coinvolgono più modelli.

Non sono presenti microservizi.

API REST, autenticazione, regole applicative, documentazione Swagger, matching delle ricerche salvate, notifiche e messaggistica real-time appartengono allo stesso processo Node.js.

---

### 3.2 Vista di contesto e container

Nell'ambiente Docker locale, il browser raggiunge il frontend statico servito da Nginx sulla porta host `5173`.

Il bundle React comunica tramite REST e Socket.IO con il backend esposto sulla porta `3000`.

Il backend comunica con MongoDB utilizzando il nome del servizio `mongo` all'interno della rete Docker.

Le richieste a Nominatim e ai provider cartografici partono invece direttamente dal browser.

| Container o sistema | Responsabilità | Tecnologia e interfacce |
| --- | --- | --- |
| Browser / frontend | Rendering delle pagine, routing client-side, form, ricerca, filtri, ordinamento, mappe, gestione della sessione in memoria, ricerche salvate, notifiche, chiamate REST e connessioni real-time. | React 19 e Vite in fase di build; file statici serviti da Nginx 1.27. Porta host `5173`, porta container `80`. |
| Backend | API, autenticazione, autorizzazione, validazione di dominio, orchestrazione dei casi d'uso, accesso ai dati, matching delle ricerche, notifiche, chat e Swagger UI. | Container Node.js 22 Alpine, Express 5, Socket.IO, Mongoose, JWT e bcrypt. Porta `3000`. |
| MongoDB | Persistenza di utenti, annunci, proposte, recensioni, preferiti, conversazioni, messaggi, refresh token, ricerche salvate e notifiche. | Container MongoDB 7, porta `27017` e volume persistente `mongo_data`. |
| Nominatim | Trasformazione di testo libero in coordinate e provincia italiana. | API HTTPS invocata dal client. |
| Provider cartografici | Sfondo cartografico per visualizzazione e selezione delle posizioni. | Tile cartografici consumati tramite Leaflet. |

---

### 3.3 Struttura logica del frontend

```text
client/src/
├── main.jsx          # bootstrap dell'applicazione e provider globali
├── routes/           # rotte della SPA
├── layouts/          # struttura comune Navbar + contenuto + Footer
├── pages/            # pagine organizzate per area funzionale
├── components/       # componenti condivisi
├── contexts/         # autenticazione, real-time e notifiche
├── hooks/            # logica riusabile
├── services/         # comunicazione REST con il backend
└── theme/            # tema Material UI