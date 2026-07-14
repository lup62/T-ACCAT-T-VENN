const bearerSecurity = [{ bearerAuth: [] }];

const idParam = (name = "id") => ({
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
});

const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "T'ACCAT API",
        version: "1.0.0",
        description: "Documentazione API backend del progetto T'ACCAT.",
    },
    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Server locale",
        },
    ],
    tags: [
        { name: "Auth" },
        { name: "Users" },
        { name: "Annunci" },
        { name: "Proposte" },
        { name: "Recensioni" },
        { name: "Preferiti" },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    paths: {
        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Registrazione utente",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            example: {
                                ruoli: ["lavoratore"],
                                nome: "Mario",
                                cognome: "Rossi",
                                dataNascita: "1998-05-10",
                                email: "mario.rossi@example.com",
                                telefono: "3331234567",
                                password: "Password123!",
                                indirizzo: {
                                    testo: "Lecce",
                                    posizione: {
                                        type: "Point",
                                        coordinates: [18.172, 40.353],
                                    },
                                },
                                datiLavoratore: {
                                    competenze: ["Raccolta", "Potatura"],
                                    cv: "",
                                    certificazioni: [],
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Registrazione completata" },
                    400: { description: "Dati non validi" },
                    409: { description: "Email già registrata" },
                },
            },
        },

        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login utente",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            example: {
                                email: "giovanni.russo@seed.local",
                                password: "Password123!",
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Login effettuato" },
                    400: { description: "Email e password obbligatorie" },
                    401: { description: "Credenziali non valide" },
                },
            },
        },

        "/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Profilo completo utente autenticato",
                security: bearerSecurity,
                responses: {
                    200: { description: "Utente autenticato" },
                    401: { description: "Token mancante o non valido" },
                },
            },
        },

        "/auth/refresh": {
            post: {
                tags: ["Auth"],
                summary: "Rinnova access token tramite refresh cookie",
                responses: {
                    200: { description: "Access token rinnovato" },
                    401: { description: "Refresh token non valido" },
                },
            },
        },

        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Logout e revoca refresh token",
                responses: {
                    200: { description: "Logout effettuato" },
                },
            },
        },

        "/users/{id}": {
            get: {
                tags: ["Users"],
                summary: "Profilo pubblico utente",
                parameters: [idParam()],
                responses: {
                    200: { description: "Profilo pubblico recuperato" },
                    400: { description: "ID utente non valido" },
                    404: { description: "Utente non trovato" },
                },
            },
        },

        "/users/me": {
            patch: {
                tags: ["Users"],
                summary: "Modifica profilo utente autenticato",
                security: bearerSecurity,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            example: {
                                telefono: "3331234567",
                                datiLavoratore: {
                                    competenze: ["Raccolta", "Potatura"],
                                    cv: "",
                                    certificazioni: [],
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Profilo aggiornato" },
                    400: { description: "Dati non validi o campi vietati" },
                    401: { description: "Token mancante o non valido" },
                    404: { description: "Utente non trovato" },
                },
            },
        },

        "/annunci": {
            get: {
                tags: ["Annunci"],
                summary: "Lista annunci pubblici aperti",
                parameters: [
                    {
                        name: "tipo",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["richiesta_manodopera", "disponibilita_lavoro"],
                        },
                    },
                    {
                        name: "tipoLavoro",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: [
                                "Olivicoltura",
                                "Viticoltura",
                                "Frutticoltura",
                                "Orticoltura",
                                "Cerealicoltura",
                                "Apicoltura",
                                "Zootecnia",
                                "Altro",
                            ],
                        },
                    },
                ],
                responses: {
                    200: { description: "Annunci recuperati" },
                },
            },
            post: {
                tags: ["Annunci"],
                summary: "Crea annuncio",
                security: bearerSecurity,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            example: {
                                tipo: "disponibilita_lavoro",
                                titolo: "Disponibilità per lavori agricoli",
                                descrizione: "Sono disponibile per lavori agricoli stagionali.",
                                luogo: {
                                    testo: "Lecce",
                                    raggioKm: 20,
                                },
                                periodo: {
                                    dataInizio: "2026-08-01",
                                    dataFine: "2026-08-20",
                                },
                                orario: "Mattina",
                                tipoLavoro: "Olivicoltura",
                                competenzeRichieste: ["raccolta"],
                                prezzo: {
                                    min: null,
                                    max: null,
                                    unita: "da_concordare",
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Annuncio creato" },
                    400: { description: "Dati non validi" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Ruolo non autorizzato" },
                },
            },
        },

        "/annunci/miei": {
            get: {
                tags: ["Annunci"],
                summary: "Lista annunci creati dall'utente autenticato",
                security: bearerSecurity,
                parameters: [
                    {
                        name: "stato",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["aperto", "in_corso", "concluso", "chiuso"],
                        },
                    },
                ],
                responses: {
                    200: { description: "Annunci personali recuperati" },
                    400: { description: "Filtro non valido" },
                    401: { description: "Token mancante o non valido" },
                },
            },
        },

        "/annunci/{id}": {
            get: {
                tags: ["Annunci"],
                summary: "Dettaglio annuncio",
                parameters: [idParam()],
                responses: {
                    200: { description: "Annuncio recuperato" },
                    400: { description: "ID non valido" },
                    401: { description: "Accesso richiesto" },
                    403: { description: "Utente non autorizzato" },
                    404: { description: "Annuncio non trovato" },
                },
            },
            patch: {
                tags: ["Annunci"],
                summary: "Modifica annuncio",
                security: bearerSecurity,
                parameters: [idParam()],
                responses: {
                    200: { description: "Annuncio aggiornato" },
                    400: { description: "Dati non validi" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Solo autore" },
                    404: { description: "Annuncio non trovato" },
                },
            },
        },

        "/annunci/{id}/chiudi": {
            patch: {
                tags: ["Annunci"],
                summary: "Chiude annuncio aperto",
                security: bearerSecurity,
                parameters: [idParam()],
                responses: {
                    200: { description: "Annuncio chiuso" },
                    400: { description: "Annuncio non chiudibile" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Solo autore" },
                    404: { description: "Annuncio non trovato" },
                },
            },
        },

        "/annunci/{id}/concludi": {
            patch: {
                tags: ["Annunci"],
                summary: "Conclude annuncio in corso",
                security: bearerSecurity,
                parameters: [idParam()],
                responses: {
                    200: { description: "Annuncio concluso" },
                    400: { description: "Annuncio non concludibile" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Solo autore" },
                    404: { description: "Annuncio non trovato" },
                },
            },
        },

        "/proposte": {
            post: {
                tags: ["Proposte"],
                summary: "Invia proposta",
                security: bearerSecurity,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            example: {
                                annuncio: "ID_ANNUNCIO",
                                messaggio: "Sono disponibile per questo lavoro.",
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Proposta inviata" },
                    400: { description: "Dati non validi" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Proposta sul proprio annuncio" },
                    404: { description: "Annuncio non trovato" },
                    409: { description: "Proposta duplicata" },
                },
            },
        },

        "/proposte/ricevute": {
            get: {
                tags: ["Proposte"],
                summary: "Lista proposte ricevute",
                security: bearerSecurity,
                responses: {
                    200: { description: "Proposte ricevute recuperate" },
                    401: { description: "Token mancante o non valido" },
                },
            },
        },

        "/proposte/inviate": {
            get: {
                tags: ["Proposte"],
                summary: "Lista proposte inviate",
                security: bearerSecurity,
                responses: {
                    200: { description: "Proposte inviate recuperate" },
                    401: { description: "Token mancante o non valido" },
                },
            },
        },

        "/proposte/{id}/accetta": {
            patch: {
                tags: ["Proposte"],
                summary: "Accetta proposta ricevuta",
                security: bearerSecurity,
                parameters: [idParam()],
                responses: {
                    200: { description: "Proposta accettata" },
                    400: { description: "Proposta non accettabile" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Solo destinatario" },
                    404: { description: "Proposta o annuncio non trovato" },
                },
            },
        },

        "/proposte/{id}/rifiuta": {
            patch: {
                tags: ["Proposte"],
                summary: "Rifiuta proposta ricevuta",
                security: bearerSecurity,
                parameters: [idParam()],
                responses: {
                    200: { description: "Proposta rifiutata" },
                    400: { description: "Proposta non rifiutabile" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Solo destinatario" },
                    404: { description: "Proposta non trovata" },
                },
            },
        },

        "/recensioni": {
            post: {
                tags: ["Recensioni"],
                summary: "Crea recensione",
                security: bearerSecurity,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            example: {
                                annuncio: "ID_ANNUNCIO",
                                destinatario: "ID_UTENTE",
                                stelle: 5,
                                commento: "Ottima collaborazione.",
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Recensione creata" },
                    400: { description: "Dati non validi" },
                    401: { description: "Token mancante o non valido" },
                    403: { description: "Utente non autorizzato" },
                    404: { description: "Risorsa non trovata" },
                    409: { description: "Recensione duplicata" },
                },
            },
        },

        "/recensioni/utente/{utenteId}": {
            get: {
                tags: ["Recensioni"],
                summary: "Recensioni ricevute da un utente",
                parameters: [idParam("utenteId")],
                responses: {
                    200: { description: "Recensioni utente recuperate" },
                    400: { description: "ID utente non valido" },
                },
            },
        },

        "/recensioni/annuncio/{annuncioId}": {
            get: {
                tags: ["Recensioni"],
                summary: "Recensioni collegate a un annuncio",
                parameters: [idParam("annuncioId")],
                responses: {
                    200: { description: "Recensioni annuncio recuperate" },
                    400: { description: "ID annuncio non valido" },
                },
            },
        },

        "/preferiti": {
            get: {
                tags: ["Preferiti"],
                summary: "Lista preferiti utente autenticato",
                security: bearerSecurity,
                parameters: [
                    {
                        name: "tipo",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["annuncio", "profilo"],
                        },
                    },
                ],
                responses: {
                    200: { description: "Preferiti recuperati" },
                    401: { description: "Token mancante o non valido" },
                },
            },
            post: {
                tags: ["Preferiti"],
                summary: "Aggiunge preferito",
                security: bearerSecurity,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            example: {
                                tipo: "profilo",
                                riferimento: "ID_UTENTE",
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Preferito aggiunto" },
                    400: { description: "Dati non validi" },
                    401: { description: "Token mancante o non valido" },
                    404: { description: "Risorsa non trovata" },
                    409: { description: "Preferito duplicato" },
                },
            },
        },

        "/preferiti/{id}": {
            delete: {
                tags: ["Preferiti"],
                summary: "Rimuove preferito",
                security: bearerSecurity,
                parameters: [idParam()],
                responses: {
                    200: { description: "Preferito rimosso" },
                    400: { description: "ID non valido" },
                    401: { description: "Token mancante o non valido" },
                    404: { description: "Preferito non trovato" },
                },
            },
        },
    },
};

module.exports = swaggerSpec;