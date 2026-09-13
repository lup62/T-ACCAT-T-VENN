# Modello dei dati — T'ACCAT & T'VENN

Il backend utilizza MongoDB tramite Mongoose.

Il modello dei dati è composto da dieci collezioni principali. MongoDB non impone vincoli di chiave esterna come un database relazionale; i collegamenti tra le diverse entità sono quindi realizzati mediante riferimenti `ObjectId` gestiti da Mongoose.

La coerenza dei dati tra più documenti viene garantita attraverso le validazioni definite negli schema, la logica applicativa dei controller e gli indici MongoDB.

## Collezioni

| Modello | Contenuto principale | Relazioni e vincoli rilevanti |
| --- | --- | --- |
| `User` | Ruoli, dati anagrafici, credenziali, indirizzo GeoJSON, dati specifici del lavoratore o dell'imprenditore e rating medio. | Email univoca; almeno un ruolo; password hash escluso dalle query normali; indice `2dsphere` sull'indirizzo. |
| `Annuncio` | Tipo, autore, titolo, descrizione, luogo, periodo, categoria, competenze, numero di lavoratori, compenso e stato. | Riferimento a `User`; validazioni incrociate su date, compenso e tipo di annuncio; indice `2dsphere` sul luogo. |
| `Proposta` | Annuncio, proponente, destinatario, messaggio, stato e date di proposta e risposta. | Riferimenti ad `Annuncio` e `User`; non è possibile inviare una proposta sul proprio annuncio; indice univoco parziale per impedire più proposte attive dello stesso utente sullo stesso annuncio. |
| `Recensione` | Annuncio, autore, destinatario, direzione della recensione, stelle e commento. | Riferimenti ad `Annuncio` e `User`; unicità per annuncio, autore e destinatario; non è possibile recensire sé stessi; il rating medio del destinatario viene aggiornato sulla base delle recensioni ricevute. |
| `Preferito` | Utente, tipo di elemento salvato e riferimento polimorfico all'elemento preferito. | Il riferimento può puntare ad `Annuncio` oppure `User`; unicità per utente, tipo e riferimento. |
| `Conversazione` | Due partecipanti, eventuale annuncio di riferimento e anteprima dell'ultimo messaggio. | La conversazione contiene esattamente due utenti distinti; sono presenti indici utili alla ricerca per partecipanti e ultimo aggiornamento. |
| `Messaggio` | Conversazione, mittente, testo e stato di lettura. | Riferimenti a `Conversazione` e `User`; testo con lunghezza massima prevista dall'applicazione; indice per il recupero cronologico dello storico dei messaggi. |
| `RefreshToken` | Utente, hash del refresh token, scadenza e informazioni relative alla revoca. | Riferimento a `User`; hash del token univoco; il refresh token in chiaro viene mantenuto esclusivamente nel cookie del browser. |
| `RicercaSalvata` | Utente proprietario, nome della ricerca, tipo di annuncio, testo libero, filtri applicati e stato di attivazione. | Riferimento a `User`; i filtri comprendono tipi di lavoro, province, fascia di prezzo e periodo; soltanto le ricerche con `attiva = true` partecipano al matching automatico. |
| `Notifica` | Destinatario, tipo di evento, annuncio associato, una o più ricerche salvate che hanno prodotto il match, titolo, messaggio e stato di lettura. | Riferimenti a `User`, `Annuncio` e `RicercaSalvata`; indice per destinatario, stato di lettura e data; indice univoco su destinatario, tipo e annuncio per evitare notifiche duplicate. |

## User

La collezione `User` rappresenta tutti gli utenti della piattaforma.

Gli utenti possono assumere il ruolo di lavoratore o imprenditore e condividono le informazioni di base necessarie all'autenticazione e alla gestione del profilo.

I dati specifici dei diversi ruoli vengono mantenuti nello stesso modello tramite campi dedicati.

L'indirizzo dell'utente contiene inoltre una rappresentazione geografica in formato GeoJSON, sulla quale viene creato un indice `2dsphere`. Questo consente al backend di effettuare ricerche geografiche e calcolare la distanza tra utenti e annunci.

Il campo relativo al rating medio viene mantenuto direttamente nel documento dell'utente in forma denormalizzata, evitando di dover ricalcolare continuamente la media delle recensioni durante le operazioni di lettura.

## Annuncio

La collezione `Annuncio` rappresenta entrambe le tipologie di annuncio presenti nella piattaforma:

- richiesta di manodopera pubblicata da un imprenditore;
- disponibilità di lavoro pubblicata da un lavoratore.

Ogni annuncio mantiene il riferimento all'utente autore e contiene le informazioni necessarie alla ricerca e alla visualizzazione, tra cui luogo, periodo, tipo di lavoro, competenze richieste e compenso.

Il luogo viene memorizzato anche tramite coordinate GeoJSON.

Un indice `2dsphere` permette di utilizzare query geospaziali per individuare gli annunci vicini a una determinata posizione.

Lo stato dell'annuncio permette inoltre di rappresentarne il ciclo di vita all'interno dell'applicazione.

## Proposta

La collezione `Proposta` rappresenta una candidatura o una proposta di collaborazione inviata da un utente in relazione a un annuncio.

Ogni proposta contiene:

- l'annuncio interessato;
- l'utente proponente;
- l'utente destinatario;
- un eventuale messaggio;
- lo stato della proposta;
- le date relative alla proposta e alla risposta.

Un utente non può inviare una proposta a un annuncio di cui è autore.

Un indice univoco parziale impedisce inoltre allo stesso utente di avere contemporaneamente più proposte attive sullo stesso annuncio.

## Recensione

La collezione `Recensione` implementa il sistema di reputazione bidirezionale della piattaforma.

Al termine di un rapporto di lavoro, sia il lavoratore sia l'imprenditore possono lasciare una recensione alla controparte.

Ogni recensione mantiene:

- il riferimento all'annuncio;
- l'autore;
- il destinatario;
- la direzione della recensione;
- il numero di stelle;
- il commento.

Un indice composto garantisce che lo stesso autore non possa recensire più volte lo stesso destinatario per il medesimo annuncio.

Dopo la creazione o modifica delle recensioni ricevute, il rating medio del destinatario viene aggiornato.

## Preferito

La collezione `Preferito` permette a un utente di salvare elementi di interesse.

Il riferimento è polimorfico e può rappresentare:

- un annuncio;
- un profilo utente.

Il tipo dell'elemento salvato determina quindi il modello verso cui punta il riferimento.

La combinazione tra utente, tipo e riferimento è univoca, impedendo allo stesso utente di salvare più volte lo stesso elemento.

## Conversazione

La collezione `Conversazione` rappresenta una chat privata tra due utenti.

Ogni conversazione contiene esattamente due partecipanti distinti e può essere associata facoltativamente all'annuncio che ha originato il contatto.

La conversazione mantiene inoltre alcune informazioni relative all'ultimo messaggio, utili per mostrare rapidamente l'anteprima nella lista delle chat senza dover interrogare ogni volta la collezione dei messaggi.

## Messaggio

La collezione `Messaggio` contiene i messaggi persistenti delle conversazioni.

Ogni documento mantiene:

- la conversazione di appartenenza;
- il mittente;
- il testo;
- lo stato di lettura;
- le informazioni temporali associate al messaggio.

I messaggi vengono memorizzati in MongoDB e contemporaneamente trasmessi in tempo reale tramite Socket.IO agli utenti connessi alla relativa conversazione.

Un indice permette di recuperare efficientemente lo storico dei messaggi in ordine cronologico.

## RefreshToken

La collezione `RefreshToken` viene utilizzata per il mantenimento sicuro della sessione.

Il refresh token non viene memorizzato nel database in chiaro.

Il backend salva esclusivamente il relativo hash, mentre il valore originale viene conservato nel browser tramite cookie.

Il modello mantiene inoltre il riferimento all'utente, la scadenza e le informazioni relative all'eventuale revoca del token.

Questo meccanismo permette di invalidare un refresh token lato server durante il logout.

## RicercaSalvata

La collezione `RicercaSalvata` permette a un utente autenticato di memorizzare una configurazione di ricerca degli annunci.

Una ricerca salvata contiene:

- il riferimento all'utente proprietario;
- un nome descrittivo;
- il tipo di annuncio ricercato;
- un eventuale testo libero;
- i filtri relativi al tipo di lavoro;
- le province selezionate;
- la fascia di prezzo;
- il periodo temporale;
- il campo booleano `attiva`.

Il campo `attiva` permette all'utente di decidere se una determinata ricerca deve essere utilizzata anche dal sistema automatico di matching.

Soltanto le ricerche salvate attive vengono quindi considerate durante la verifica dei nuovi annunci pubblicati.

## Notifica

La collezione `Notifica` mantiene in modo persistente gli eventi che devono essere mostrati agli utenti.

Nel caso delle ricerche salvate, quando viene pubblicato un nuovo annuncio il backend confronta le caratteristiche dell'annuncio con le ricerche salvate attive.

Se viene individuata una corrispondenza, viene creata una notifica associata all'utente interessato.

La notifica mantiene:

- il destinatario;
- il tipo di evento;
- l'annuncio che ha generato il match;
- una o più ricerche salvate compatibili;
- il titolo;
- il messaggio;
- lo stato di lettura.

Se più ricerche salvate appartenenti allo stesso utente risultano compatibili con il medesimo annuncio, viene generata una sola notifica contenente i riferimenti a tutte le ricerche che hanno prodotto il match.

Un indice univoco basato su destinatario, tipo di evento e annuncio impedisce la generazione di notifiche duplicate per lo stesso evento.

## Ricerche salvate e matching automatico

Il sistema di ricerche salvate permette di trasformare una normale ricerca degli annunci in una ricerca persistente.

L'utente può memorizzare i filtri utilizzati e decidere se mantenere attiva la ricerca.

Quando viene pubblicato un nuovo annuncio, il backend verifica la compatibilità dell'annuncio con le ricerche salvate attive.

Il confronto può considerare i principali parametri disponibili, tra cui:

- tipo di annuncio;
- testo della ricerca;
- tipo di lavoro;
- provincia;
- fascia di prezzo;
- periodo.

Se l'annuncio soddisfa i criteri di una o più ricerche salvate, viene generata una notifica persistente.

## Persistenza e consegna real-time delle notifiche

La persistenza delle notifiche e la loro consegna in tempo reale sono due aspetti distinti.

La `Notifica` viene sempre salvata in MongoDB, indipendentemente dallo stato di connessione dell'utente.

Se il destinatario è online, Socket.IO può inviare immediatamente l'evento al frontend, permettendo l'aggiornamento in tempo reale del centro notifiche.

Se il destinatario è offline, la notifica rimane memorizzata nel database.

Quando l'utente accede nuovamente alla piattaforma, il frontend può recuperare le notifiche persistenti tramite le API REST.

Questo approccio evita la perdita degli eventi nel caso in cui il destinatario non sia connesso al momento della loro generazione.

## Diagramma delle relazioni

Il diagramma ER del modello dei dati è esportato nel file:

[`modello-dati-diagramma-er.pdf`](./modello-dati-diagramma-er.pdf)

Il diagramma rappresenta le principali relazioni tra le collezioni MongoDB utilizzate dall'applicazione.

`Preferito` utilizza un riferimento polimorfico (`modelloRiferimento`):

- punta ad `Annuncio` quando il tipo del preferito è un annuncio;
- punta a `User` quando il tipo del preferito è un profilo.

Nel diagramma queste due possibilità sono rappresentate mediante due relazioni distinte verso l'entità `Preferito`.

Sono inoltre rappresentate le relazioni introdotte dalle funzionalità di ricerche salvate e notifiche:

- `User` → `RicercaSalvata`: un utente può possedere più ricerche salvate;
- `User` → `Notifica`: un utente può ricevere più notifiche;
- `Annuncio` → `Notifica`: una notifica può fare riferimento all'annuncio che ha prodotto il match;
- `RicercaSalvata` → `Notifica`: una notifica può essere associata a una o più ricerche salvate compatibili.

In questo modo il diagramma ER rispecchia sia le funzionalità principali della piattaforma sia le funzionalità aggiuntive relative alle ricerche salvate, ai preferiti e alle notifiche persistenti.