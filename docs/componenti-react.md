# Componenti React — T'ACCAT & T'VENN

Il frontend di T'ACCAT & T'VENN è realizzato come Single Page Application con React.

La navigazione è gestita tramite React Router, mentre Material UI viene utilizzato per i componenti grafici e per il tema generale dell'applicazione.

Lo stato condiviso dell'applicazione viene gestito tramite Context API e hook custom. Le comunicazioni con il backend REST sono separate nei file presenti nella cartella `services`.

## Struttura generale

### `main.jsx`

È il punto di ingresso dell'applicazione React.

Monta l'applicazione e configura i provider globali:

- `ThemeProvider`, per il tema Material UI;
- `BrowserRouter`, per la navigazione client-side;
- `AuthProvider`, per lo stato di autenticazione;
- `RealtimeProvider`, per la connessione Socket.IO;
- `NotificheProvider`, per lo stato globale delle notifiche.

La disposizione dei provider permette ai componenti interni di accedere contemporaneamente allo stato dell'utente autenticato, alla connessione real-time e alle notifiche.

### `AppRoutes.jsx`

Definisce le rotte principali della Single Page Application tramite React Router.

Le pagine sono inserite all'interno di `MainLayout`, che contiene gli elementi comuni dell'interfaccia.

Tra le principali rotte sono presenti:

- home;
- login e registrazione;
- ricerca e visualizzazione degli annunci;
- pubblicazione e gestione degli annunci personali;
- profilo personale e profili pubblici;
- proposte;
- preferiti;
- chat;
- ricerche salvate.

La pagina delle ricerche salvate è raggiungibile tramite la rotta `/ricerche-salvate`.

## Layout e componenti condivisi

### `MainLayout`

Definisce la struttura grafica comune alle principali pagine dell'applicazione.

Contiene gli elementi condivisi, come la barra di navigazione e il footer, e utilizza React Router per visualizzare al proprio interno la pagina corrispondente alla rotta corrente.

### `Navbar`

È la barra di navigazione principale.

Permette di raggiungere le principali sezioni dell'applicazione e adatta le funzionalità disponibili in base allo stato di autenticazione dell'utente.

Integra inoltre:

- il collegamento alla pagina dei preferiti;
- il collegamento alle ricerche salvate;
- il menu delle notifiche.

### `Footer`

Contiene le informazioni e i collegamenti comuni visualizzati nella parte inferiore dell'applicazione.

### `SnackbarAvviso`

Componente condiviso utilizzato per mostrare messaggi temporanei di successo o errore a seguito delle operazioni eseguite dall'utente.

### `ScrollToTop`

Gestisce il riposizionamento della pagina all'inizio durante la navigazione tra rotte diverse.

## Autenticazione e stato globale

### `AuthContext`

Gestisce lo stato globale relativo all'utente autenticato.

Rende disponibili alle pagine e ai componenti le informazioni necessarie per conoscere lo stato della sessione e utilizzare l'access token nelle richieste verso le API protette.

### `useAuth`

Hook custom utilizzato dai componenti per accedere in modo semplificato alle informazioni esposte da `AuthContext`.

## Comunicazione real-time

### `RealtimeContext`

Centralizza la connessione Socket.IO utilizzata dalle funzionalità real-time dell'applicazione.

La connessione può essere condivisa tra più componenti senza creare socket separati per ogni pagina.

### `useRealtime`

Hook custom che permette ai componenti di accedere alla connessione Socket.IO gestita dal `RealtimeContext`.

### `useChatSocket`

Hook dedicato alle operazioni Socket.IO relative alla chat.

Permette di separare la logica real-time della messaggistica dai componenti grafici della chat.

## Annunci

### `ListaAnnunciPage`

È il componente principale utilizzato per la ricerca e la visualizzazione degli annunci.

Gestisce:

- caricamento degli annunci;
- filtri;
- ricerca testuale;
- ordinamento;
- scelta tra differenti modalità di visualizzazione;
- salvataggio della ricerca corrente.

Quando l'utente autenticato salva una ricerca, il componente raccoglie il tipo di annuncio, il testo ricercato e i filtri correnti e li invia al backend tramite il service `ricercheSalvate.js`.

### `AnnunciLavoroPage`

Configura la lista degli annunci relativi alle offerte di lavoro pubblicate dagli imprenditori.

### `AnnunciLavoratoriPage`

Configura la lista degli annunci relativi alla disponibilità pubblicata dai lavoratori.

### `AnnuncioCard`

Visualizza in forma sintetica le principali informazioni di un annuncio all'interno delle liste.

### `FiltriAnnunci`

Gestisce i controlli utilizzati dall'utente per filtrare gli annunci.

### `MappaAnnunci`

Visualizza geograficamente gli annunci attraverso la mappa prevista dall'applicazione.

### `DettaglioAnnuncioPage`

Mostra le informazioni complete relative a un singolo annuncio e le operazioni disponibili in base all'utente autenticato.

### `InviaPropostaDialog`

Dialog utilizzato per inviare una proposta relativa a un annuncio.

### `PubblicaAnnuncioPage`

Contiene il form utilizzato per la pubblicazione di un nuovo annuncio.

### `MieiAnnunciPage`

Mostra gli annunci pubblicati dall'utente autenticato e permette di gestirne lo stato.

## Ricerche salvate

### `RicercheSalvatePage`

È la pagina dedicata alla gestione delle ricerche memorizzate dall'utente.

Al caricamento recupera tramite API le ricerche appartenenti all'utente autenticato.

Permette di:

- visualizzare le ricerche salvate;
- modificare nome e filtri;
- modificare il testo di ricerca;
- attivare o disattivare una ricerca;
- eliminare una ricerca.

Lo stato locale React viene utilizzato per gestire caricamento, errori, operazioni in corso, form di modifica e messaggi di conferma.

Le operazioni verso il backend vengono effettuate tramite il service `ricercheSalvate.js`.

### `services/ricercheSalvate.js`

Contiene le funzioni utilizzate dal frontend per comunicare con le API REST delle ricerche salvate.

Gestisce le operazioni:

- recupero delle ricerche dell'utente;
- creazione;
- modifica;
- eliminazione.

Le richieste includono il Bearer access token perché gli endpoint sono protetti da autenticazione.

## Notifiche

### `NotificheContext`

Gestisce globalmente le notifiche dell'utente autenticato.

Mantiene nello stato React:

- elenco delle notifiche;
- numero di notifiche non lette;
- stato di caricamento;
- eventuali errori.

Al momento dell'autenticazione recupera le notifiche persistenti attraverso le API REST.

Il Context ascolta inoltre l'evento Socket.IO `notifica:nuova`. Quando il backend invia una nuova notifica real-time, questa viene aggiunta allo stato senza richiedere il refresh della pagina.

Prima dell'inserimento viene controllato l'identificativo della notifica per evitare duplicazioni nello stato client.

Il Context espone inoltre le operazioni per:

- segnare una notifica come letta;
- segnare tutte le notifiche come lette;
- eliminare una notifica.

### `useNotifiche`

Hook custom utilizzato per accedere alle funzionalità esposte dal `NotificheContext`.

Permette ai componenti grafici di utilizzare lo stato delle notifiche senza dipendere direttamente dall'implementazione del Context.

### `NotificationMenu`

Componente Material UI inserito nella barra di navigazione.

Visualizza un'icona con badge contenente il numero delle notifiche non lette.

Il menu permette di:

- visualizzare le notifiche più recenti;
- distinguere graficamente quelle lette da quelle non lette;
- segnare tutte le notifiche come lette;
- eliminare una singola notifica;
- selezionare una notifica.

Quando l'utente seleziona una notifica non letta, questa viene prima segnata come letta e successivamente React Router porta l'utente al dettaglio dell'annuncio associato.

### `services/notifiche.js`

Contiene le chiamate REST verso le API delle notifiche.

Gestisce:

- recupero delle notifiche;
- marcatura di una singola notifica come letta;
- marcatura di tutte le notifiche come lette;
- eliminazione di una notifica.

Tutte le richieste utilizzano l'access token dell'utente autenticato.

## Preferiti

### `PreferitiPage`

Mostra gli elementi salvati dall'utente e consente la gestione dei preferiti.

### `usePreferitiAnnunci`

Hook custom utilizzato per isolare la logica relativa ai preferiti degli annunci dai componenti grafici.

## Proposte e recensioni

### `PropostePage`

Gestisce la visualizzazione delle proposte inviate e ricevute dall'utente e le operazioni disponibili in base allo stato della proposta.

### `PropostaCard`

Rappresenta graficamente una singola proposta.

### `RecensioneDialog`

Dialog utilizzato per inserire una recensione al termine della collaborazione prevista dall'applicazione.

### `RecensioneItem`

Componente condiviso per la visualizzazione di una singola recensione.

## Chat

### `ChatPage`

È la pagina principale della funzionalità di messaggistica.

Coordina la lista delle conversazioni e la conversazione attualmente selezionata.

### `ListaConversazioni`

Visualizza le conversazioni disponibili per l'utente.

### `ThreadMessaggi`

Visualizza lo storico dei messaggi della conversazione selezionata e gestisce l'interazione con la chat real-time.

La chat combina persistenza tramite backend e aggiornamenti in tempo reale tramite Socket.IO.

## Profilo

### `ProfiloPage`

Visualizza il profilo dell'utente autenticato.

### `ProfiloPubblicoPage`

Visualizza le informazioni pubbliche relative a un altro utente.

### `ModificaProfiloForm`

Gestisce la modifica dei dati del profilo.

### `ProfiloCampi`

Componente riutilizzabile per la visualizzazione dei diversi campi associati al profilo.

## Service layer

Le chiamate HTTP verso il backend sono separate dai componenti React e raccolte nella cartella `services`.

Sono presenti service dedicati a:

- annunci;
- conversazioni;
- geocoding;
- notifiche;
- preferiti;
- proposte;
- recensioni;
- ricerche salvate;
- utenti.

Questa separazione evita di inserire direttamente nei componenti grafici tutta la logica relativa alle richieste HTTP e rende più chiara la divisione tra interfaccia e comunicazione con il backend.

## Hook custom

La cartella `hooks` contiene hook custom utilizzati per isolare logiche riutilizzabili.

Tra i principali sono presenti:

- `useAuth`;
- `useRealtime`;
- `useNotifiche`;
- `useChatSocket`;
- `useAnnunciFiltrati`;
- `useGeocodingLuogo`;
- `usePreferitiAnnunci`.

L'utilizzo di Context API, hook custom e service separati permette di mantenere i componenti React maggiormente focalizzati sulla gestione dell'interfaccia e dello stato locale.