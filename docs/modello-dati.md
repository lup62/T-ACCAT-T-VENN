# Modello dei dati — T'ACCAT & T'VENN

Il backend usa MongoDB con Mongoose. Le collezioni sono otto; MongoDB non impone chiavi esterne, quindi i riferimenti tra collezioni sono `ObjectId` gestiti da Mongoose e la coerenza tra più documenti è garantita dai controller e dagli indici.

## Collezioni

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

## Diagramma delle relazioni

Il diagramma ER è esportato in [`modello-dati-diagramma-er.pdf`](./modello-dati-diagramma-er.pdf).

`Preferito` ha un riferimento polimorfico (`modelloRiferimento`): punta ad `Annuncio` quando `tipo = "annuncio"`, a `User` quando `tipo = "profilo"` — nel diagramma sono per questo due relazioni distinte verso la stessa collezione `Preferito`.
