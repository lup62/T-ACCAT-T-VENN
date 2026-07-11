/**
 * pubblicaAnnuncioForm.js
 *
 * Modello del form di pubblicazione annuncio: stato iniziale, validazione
 * e costruzione del payload per POST /api/annunci. Funzioni pure, separate
 * dalla UI di PubblicaAnnuncioPage per essere testabili in isolamento.
 */

export const STATO_INIZIALE = {
    tipo: "",
    titolo: "",
    descrizione: "",
    tipoLavoro: "",
    luogoTesto: "",
    raggioKm: "",
    posizione: null,       // { lat, lng } — impostato via geocoding o click mappa
    dataInizio: "",
    dataFine: "",
    orario: "",
    competenzeRichieste: [],
    prezzoMin: "",
    prezzoMax: "",
    unitaPrezzo: "",
    numeroLavoratoriRichiesti: "",
};

export const ERRORI_INIZIALI = {
    tipo: "",
    titolo: "",
    descrizione: "",
    tipoLavoro: "",
    luogoTesto: "",
    dataInizio: "",
    dataFine: "",
    prezzoMin: "",
    prezzoMax: "",
    unitaPrezzo: "",
    numeroLavoratoriRichiesti: "",
};

export function valida(form) {
    const errori = { ...ERRORI_INIZIALI };
    let valido = true;

    const segna = (campo, messaggio) => {
        errori[campo] = messaggio;
        valido = false;
    };

    if (!form.tipo)
        segna("tipo", "Seleziona il tipo di annuncio");
    if (!form.titolo || form.titolo.length < 5)
        segna("titolo", "Il titolo deve avere almeno 5 caratteri");
    if (form.titolo && form.titolo.length > 120)
        segna("titolo", "Il titolo non può superare i 120 caratteri");
    if (!form.descrizione || form.descrizione.length < 10)
        segna("descrizione", "La descrizione deve avere almeno 10 caratteri");
    if (form.descrizione && form.descrizione.length > 2000)
        segna("descrizione", "La descrizione non può superare i 2000 caratteri");
    if (!form.tipoLavoro)
        segna("tipoLavoro", "Inserisci il tipo di lavoro");
    if (!form.luogoTesto)
        segna("luogoTesto", "Inserisci il luogo (es. Bari (BA))");
    if (!form.dataInizio)
        segna("dataInizio", "Inserisci la data di inizio");
    if (!form.dataFine)
        segna("dataFine", "Inserisci la data di fine");
    if (form.dataInizio && form.dataFine && form.dataFine < form.dataInizio)
        segna("dataFine", "La data di fine non può essere precedente alla data di inizio");
    // Compenso opzionale, ma il backend accetta solo "entrambi i prezzi"
    // oppure "nessuno" (= da concordare): la compilazione parziale va bloccata qui.
    if (form.prezzoMin !== "" && Number(form.prezzoMin) < 0)
        segna("prezzoMin", "Il prezzo minimo non può essere negativo");
    if (form.prezzoMax !== "" && Number(form.prezzoMax) < 0)
        segna("prezzoMax", "Il prezzo massimo non può essere negativo");
    if (form.prezzoMin !== "" && form.prezzoMax !== "" && Number(form.prezzoMax) < Number(form.prezzoMin))
        segna("prezzoMax", "Il prezzo massimo non può essere minore del minimo");
    if (form.prezzoMin !== "" && form.prezzoMax === "")
        segna("prezzoMax", "Indica anche il prezzo massimo (o lascia entrambi vuoti)");
    if (form.prezzoMax !== "" && form.prezzoMin === "")
        segna("prezzoMin", "Indica anche il prezzo minimo (o lascia entrambi vuoti)");
    const prezziCompilati = form.prezzoMin !== "" || form.prezzoMax !== "";
    if (prezziCompilati && !form.unitaPrezzo)
        segna("unitaPrezzo", "Seleziona l'unità di prezzo");
    if (form.tipo === "richiesta_manodopera" && (!form.numeroLavoratoriRichiesti || Number(form.numeroLavoratoriRichiesti) < 1))
        segna("numeroLavoratoriRichiesti", "Inserisci il numero di lavoratori (almeno 1)");

    return { errori, valido };
}

export function costruisciPayload(form) {
    const luogo = { testo: form.luogoTesto.trim() };
    if (form.posizione) {
        luogo.posizione = {
            type: "Point",
            coordinates: [form.posizione.lng, form.posizione.lat],
        };
    }
    if (form.raggioKm !== "") {
        luogo.raggioKm = Number(form.raggioKm);
    }

    const payload = {
        tipo: form.tipo,
        titolo: form.titolo.trim(),
        descrizione: form.descrizione.trim(),
        luogo,
        periodo: {
            dataInizio: form.dataInizio,
            dataFine: form.dataFine,
        },
        orario: form.orario.trim(),
        tipoLavoro: form.tipoLavoro.trim(),
        competenzeRichieste: form.competenzeRichieste,
        // Se nessun campo prezzo è compilato → da concordare (anche se
        // l'utente ha toccato l'unità: il backend vuole min+max null in quel caso)
        prezzo: (form.prezzoMin === "" && form.prezzoMax === "")
            ? { min: null, max: null, unita: "da_concordare" }
            : {
                min: Number(form.prezzoMin),
                max: Number(form.prezzoMax),
                unita: form.unitaPrezzo,
            },
    };

    if (form.tipo === "richiesta_manodopera") {
        payload.numeroLavoratoriRichiesti = Number(form.numeroLavoratoriRichiesti);
    }

    return payload;
}
