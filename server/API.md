# API Backend — T'ACCAT

Base URL locale:

```text
http://localhost:3000/api
```

Le rotte protette richiedono:

```text
Authorization: Bearer <accessToken>
```

Il refresh token è gestito tramite cookie httpOnly.

---

## Auth

### POST `/auth/register`

Registra un utente.

Auth: no

Body minimo:

```json
{
  "ruoli": ["lavoratore"],
  "nome": "Mario",
  "cognome": "Rossi",
  "dataNascita": "1998-05-10",
  "email": "mario.rossi@example.com",
  "telefono": "3331234567",
  "password": "Password123!",
  "indirizzo": {
    "testo": "Lecce",
    "posizione": {
      "type": "Point",
      "coordinates": [18.172, 40.353]
    }
  },
  "datiLavoratore": {
    "competenze": ["Raccolta", "Potatura"],
    "cv": "",
    "certificazioni": []
  }
}
```

Risposte principali:

```text
201 Created
400 Bad Request
409 Conflict
500 Internal Server Error
```

---

### POST `/auth/login`

Login utente.

Auth: no

Body:

```json
{
  "email": "mario.rossi@example.com",
  "password": "Password123!"
}
```

Risposta:

```text
200 OK
```

Restituisce `accessToken` e dati base dell’utente.

---

### POST `/auth/refresh`

Rinnova l’access token usando il refresh token nel cookie httpOnly.

Auth: cookie refresh token

Risposte:

```text
200 OK
401 Unauthorized
```

---

### POST `/auth/logout`

Revoca il refresh token e pulisce il cookie.

Auth: cookie refresh token se presente

Risposta:

```text
200 OK
```

---

### GET `/auth/me`

Restituisce il profilo completo dell’utente autenticato.

Auth: sì

Campi restituiti:

```text
id
ruoli
nome
cognome
dataNascita
email
telefono
indirizzo
datiLavoratore
datiImprenditore
ratingMedio
createdAt
updatedAt
```

Campi non restituiti:

```text
passwordHash
oauth
immagineProfilo
```

---

## Utenti

### GET `/users/:id`

Restituisce il profilo pubblico di un utente.

Auth: no

Usato dal frontend per:
- pagina profilo pubblica
- autore annuncio
- preferiti di tipo profilo

Campi restituiti:

```text
id
nome
cognome
ruoli
ratingMedio
indirizzo.testo
datiLavoratore.competenze
datiLavoratore.certificazioni
datiImprenditore.nomeAzienda
datiImprenditore.sitoWeb
```

Campi non pubblici:

```text
email
telefono
passwordHash
oauth
indirizzo.posizione
immagineProfilo
```

Risposte:

```text
200 OK
400 Bad Request
404 Not Found
```

---

### PATCH `/users/me`

Modifica il profilo dell’utente autenticato.

Auth: sì

Campi modificabili:

```text
nome
cognome
telefono
indirizzo
datiLavoratore
datiImprenditore
```

Campi bloccati:

```text
email
password
passwordHash
ruoli
ratingMedio
oauth
immagineProfilo
```

Body esempio:

```json
{
  "telefono": "3331234567",
  "datiLavoratore": {
    "competenze": ["Raccolta", "Potatura"],
    "cv": "",
    "certificazioni": []
  }
}
```

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
404 Not Found
```

---

## Annunci

### GET `/annunci`

Lista annunci pubblici aperti.

Auth: no

Query opzionali:

```text
tipo
tipoLavoro
```

Esempio:

```text
GET /api/annunci?tipo=richiesta_manodopera&tipoLavoro=Olivicoltura
```

Risposta:

```text
200 OK
```

---

### GET `/annunci/miei`

Lista annunci creati dall’utente autenticato.

Auth: sì

Include annunci in stato:

```text
aperto
in_corso
concluso
chiuso
```

Query opzionali:

```text
stato
tipo
tipoLavoro
```

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
```

---

### GET `/annunci/:id`

Dettaglio annuncio.

Auth:
- no, se l’annuncio è `aperto`
- sì, se l’annuncio è `in_corso`, `concluso` o `chiuso`

Visibilità per annunci non aperti:
- autore dell’annuncio
- proponente con proposta accettata

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

---

### POST `/annunci`

Crea un annuncio.

Auth: sì

Regole ruolo:
- `richiesta_manodopera` richiede ruolo `imprenditore`
- `disponibilita_lavoro` richiede ruolo `lavoratore`

Valori consentiti per `tipoLavoro`:

```text
Olivicoltura
Viticoltura
Frutticoltura
Orticoltura
Cerealicoltura
Apicoltura
Zootecnia
Altro
```

Valori vecchi o sporchi vengono normalizzati a `Altro`.

Body esempio:

```json
{
  "tipo": "disponibilita_lavoro",
  "titolo": "Disponibilità per lavori agricoli",
  "descrizione": "Sono disponibile per lavori agricoli stagionali.",
  "luogo": {
    "testo": "Lecce",
    "raggioKm": 20
  },
  "periodo": {
    "dataInizio": "2026-08-01",
    "dataFine": "2026-08-20"
  },
  "orario": "Mattina",
  "tipoLavoro": "Olivicoltura",
  "competenzeRichieste": ["raccolta"],
  "prezzo": {
    "min": null,
    "max": null,
    "unita": "da_concordare"
  }
}
```

Risposte:

```text
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
```

---

### PATCH `/annunci/:id`

Modifica un annuncio.

Auth: sì

Solo autore.

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

---

### PATCH `/annunci/:id/chiudi`

Chiude un annuncio aperto.

Auth: sì

Solo autore.

Effetti:
- annuncio → `chiuso`
- proposte `in_attesa` collegate → `rifiutata`

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

---

### PATCH `/annunci/:id/concludi`

Conclude un annuncio in corso.

Auth: sì

Solo autore.

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

---

## Proposte

### POST `/proposte`

Invia una proposta su un annuncio aperto.

Auth: sì

Body:

```json
{
  "annuncio": "ID_ANNUNCIO",
  "messaggio": "Sono disponibile per questo lavoro."
}
```

Regole:
- non si può inviare proposta al proprio annuncio
- duplicati bloccati per proposta attiva sullo stesso annuncio

Risposte:

```text
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
```

---

### GET `/proposte/ricevute`

Lista proposte ricevute.

Auth: sì

Risposta:

```text
200 OK
```

---

### GET `/proposte/inviate`

Lista proposte inviate.

Auth: sì

Risposta:

```text
200 OK
```

---

### PATCH `/proposte/:id/accetta`

Accetta una proposta ricevuta.

Auth: sì

Solo destinatario della proposta.

Effetti:
- proposta → `accettata`
- annuncio → `in_corso`
- altre proposte `in_attesa` sullo stesso annuncio → `rifiutata`

La logica usa update condizionale per ridurre il rischio di doppia accettazione.

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

---

### PATCH `/proposte/:id/rifiuta`

Rifiuta una proposta ricevuta.

Auth: sì

Solo destinatario della proposta.

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

---

## Recensioni

### POST `/recensioni`

Crea una recensione su annuncio concluso.

Auth: sì

Regole:
- annuncio deve essere `concluso`
- autore e destinatario devono essere coinvolti nella collaborazione
- una recensione per coppia annuncio/autore/destinatario
- stelle da 1 a 5

Body:

```json
{
  "annuncio": "ID_ANNUNCIO",
  "destinatario": "ID_UTENTE",
  "stelle": 5,
  "commento": "Ottima collaborazione."
}
```

Risposte:

```text
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
```

---

### GET `/recensioni/utente/:utenteId`

Lista recensioni ricevute da un utente.

Auth: no

Risposte:

```text
200 OK
400 Bad Request
```

---

### GET `/recensioni/annuncio/:annuncioId`

Lista recensioni collegate a un annuncio.

Auth: no

Risposte:

```text
200 OK
400 Bad Request
```

---

## Preferiti

### POST `/preferiti`

Aggiunge un preferito.

Auth: sì

Tipi supportati:

```text
annuncio
profilo
```

Body annuncio:

```json
{
  "tipo": "annuncio",
  "riferimento": "ID_ANNUNCIO"
}
```

Body profilo:

```json
{
  "tipo": "profilo",
  "riferimento": "ID_UTENTE"
}
```

Regole:
- non si può salvare il proprio annuncio
- non si può salvare il proprio profilo
- duplicati bloccati

Risposte:

```text
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
409 Conflict
```

---

### GET `/preferiti`

Lista preferiti dell’utente autenticato.

Auth: sì

Query opzionale:

```text
tipo=annuncio
tipo=profilo
```

Risposte:

```text
200 OK
401 Unauthorized
```

---

### DELETE `/preferiti/:id`

Rimuove un preferito.

Auth: sì

Solo proprietario.

Risposte:

```text
200 OK
400 Bad Request
401 Unauthorized
404 Not Found
```

---

## Seed dati demo

Script:

```text
npm run seed
```

Da eseguire dentro:

```text
server/
```

Su PowerShell usare:

```text
npm.cmd run seed
```

Attenzione: lo script svuota le collection e ripopola il DB. Usare solo su database di sviluppo.

Password utenti seed:

```text
Password123!
```

Lo script stampa in console l’elenco delle email seed disponibili.