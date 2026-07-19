/**
 * seed.js — ripulisce il database e lo popola con dati di sviluppo realistici.
 *
 * Uso (dalla cartella server/):
 *   node scripts/seed.js
 *
 * ATTENZIONE: svuota TUTTE le collection (utenti, annunci, proposte,
 * preferiti, recensioni, messaggi, conversazioni, refresh token) prima di ricreare
 * i dati. Da usare solo sul database di sviluppo.
 *
 * Cosa crea:
 *   - 20 utenti (8 imprenditori, 10 lavoratori, 2 con doppio ruolo),
 *     tutti con password "Password123!"
 *   - 36 annunci tra richieste di manodopera e disponibilità, su tutte le
 *     categorie di lavoro (compresi Apicoltura e Altro), con stati misti
 *     (aperto, in_corso, concluso, chiuso) e prezzi di ogni tipo
 *   - proposte coerenti con gli stati (accettate sugli in_corso/conclusi,
 *     in attesa sugli aperti, qualche rifiutata), incluso il flusso
 *     inverso: un imprenditore che propone su una disponibilità
 *   - recensioni sugli annunci conclusi (anche non reciproche e con voti
 *     variabili), con ratingMedio ricalcolato come fa il controller
 *   - preferiti di tipo "annuncio" e "profilo"
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Annuncio = require("../models/Annuncio");
const Proposta = require("../models/Proposta");
const Preferito = require("../models/Preferito");
const Recensione = require("../models/Recensione");
const Messaggio = require("../models/Messaggio");
const Conversazione = require("../models/Conversazione");
const RefreshToken = require("../models/RefreshToken");

const PASSWORD = "Password123!";

// [longitudine, latitudine]
const CITTA = {
    bari: { testo: "Bari (BA)", coord: [16.8719, 41.1171] },
    andria: { testo: "Andria (BT)", coord: [16.2917, 41.2317] },
    foggia: { testo: "Foggia (FG)", coord: [15.5444, 41.4621] },
    cerignola: { testo: "Cerignola (FG)", coord: [15.8996, 41.2656] },
    lecce: { testo: "Lecce (LE)", coord: [18.1743, 40.3529] },
    taranto: { testo: "Taranto (TA)", coord: [17.2470, 40.4644] },
    ostuni: { testo: "Ostuni (BR)", coord: [17.5786, 40.7295] },
    monopoli: { testo: "Monopoli (BA)", coord: [17.3040, 40.9556] },
    altamura: { testo: "Altamura (BA)", coord: [16.5533, 40.8266] },
    brindisi: { testo: "Brindisi (BR)", coord: [17.9460, 40.6327] },
    trani: { testo: "Trani (BT)", coord: [16.4179, 41.2770] },
    barletta: { testo: "Barletta (BT)", coord: [16.2811, 41.3196] },
    gallipoli: { testo: "Gallipoli (LE)", coord: [17.9926, 40.0559] },
    manfredonia: { testo: "Manfredonia (FG)", coord: [15.9195, 41.6304] },
    gioia: { testo: "Gioia del Colle (BA)", coord: [16.9226, 40.7982] },
    canosa: { testo: "Canosa di Puglia (BT)", coord: [16.0669, 41.2225] },
    nardo: { testo: "Nardò (LE)", coord: [18.0327, 40.1795] },
    manduria: { testo: "Manduria (TA)", coord: [17.6339, 40.3990] },
};

function posizione(citta) {
    return { type: "Point", coordinates: CITTA[citta].coord };
}

function luogo(citta, raggioKm = 0) {
    return { testo: CITTA[citta].testo, posizione: posizione(citta), raggioKm };
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connesso al database "${mongoose.connection.name}"`);

    // ── 1. Pulizia totale ────────────────────────────────────────────────
    const collections = [
        User,
        Annuncio,
        Proposta,
        Preferito,
        Recensione,
        Messaggio,
        Conversazione,
        RefreshToken,
    ];
    for (const model of collections) {
        const { deletedCount } = await model.deleteMany({});
        console.log(`  svuotata ${model.collection.collectionName}: ${deletedCount} documenti rimossi`);
    }

    // ── 2. Utenti ────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(PASSWORD, 12);

    const base = (u) => ({ ...u, passwordHash });

    const [
        giovanni, maria, antonio, francesca, luca, sara, ahmed, elena, marco, paolo,
        vito, rosa, domenico, carmela, giulia, youssef, nicola, anna, stefano, teresa,
    ] =
        await User.create(
            base({
                ruoli: ["imprenditore"], nome: "Giovanni", cognome: "Russo",
                dataNascita: "1978-05-12", email: "giovanni.russo@seed.local", telefono: "3391000001",
                indirizzo: { testo: CITTA.bari.testo, posizione: posizione("bari") },
                datiImprenditore: { nomeAzienda: "Azienda Agricola Russo", pIva: "07211830722" },
            }),
            base({
                ruoli: ["imprenditore"], nome: "Maria", cognome: "De Santis",
                dataNascita: "1983-11-02", email: "maria.desantis@seed.local", telefono: "3391000002",
                indirizzo: { testo: CITTA.cerignola.testo, posizione: posizione("cerignola") },
                datiImprenditore: { nomeAzienda: "Masseria De Santis", pIva: "04588210713" },
            }),
            base({
                ruoli: ["imprenditore"], nome: "Antonio", cognome: "Greco",
                dataNascita: "1969-02-27", email: "antonio.greco@seed.local", telefono: "3391000003",
                indirizzo: { testo: CITTA.ostuni.testo, posizione: posizione("ostuni") },
                datiImprenditore: { nomeAzienda: "Oleificio Greco", pIva: "02914760748" },
            }),
            base({
                ruoli: ["imprenditore"], nome: "Francesca", cognome: "Lorusso",
                dataNascita: "1987-08-19", email: "francesca.lorusso@seed.local", telefono: "3391000004",
                indirizzo: { testo: CITTA.andria.testo, posizione: posizione("andria") },
                datiImprenditore: { nomeAzienda: "Vigneti Lorusso", sitoWeb: "https://vignetilorusso.example" },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Luca", cognome: "Moretti",
                dataNascita: "1992-03-08", email: "luca.moretti@seed.local", telefono: "3391000005",
                indirizzo: { testo: CITTA.bari.testo, posizione: posizione("bari") },
                datiLavoratore: { competenze: ["Potatura", "Raccolta olive", "Uso abbacchiatore"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Sara", cognome: "Romano",
                dataNascita: "1998-12-01", email: "sara.romano@seed.local", telefono: "3391000006",
                indirizzo: { testo: CITTA.lecce.testo, posizione: posizione("lecce") },
                datiLavoratore: { competenze: ["Raccolta ortaggi", "Lavoro in serra", "Confezionamento"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Ahmed", cognome: "Ben Ali",
                dataNascita: "1990-06-15", email: "ahmed.benali@seed.local", telefono: "3391000007",
                indirizzo: { testo: CITTA.foggia.testo, posizione: posizione("foggia") },
                datiLavoratore: { competenze: ["Guida trattore", "Aratura", "Raccolta pomodori"], certificazioni: ["Patentino trattore"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Elena", cognome: "Carrieri",
                dataNascita: "1995-09-23", email: "elena.carrieri@seed.local", telefono: "3391000008",
                indirizzo: { testo: CITTA.taranto.testo, posizione: posizione("taranto") },
                datiLavoratore: { competenze: ["Vendemmia", "Lavori di cantina"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Marco", cognome: "Palmisano",
                dataNascita: "1988-01-30", email: "marco.palmisano@seed.local", telefono: "3391000009",
                indirizzo: { testo: CITTA.monopoli.testo, posizione: posizione("monopoli") },
                datiLavoratore: { competenze: ["Impianti di irrigazione", "Guida trattore"] },
            }),
            base({
                ruoli: ["imprenditore", "lavoratore"], nome: "Paolo", cognome: "Quaranta",
                dataNascita: "1975-04-04", email: "paolo.quaranta@seed.local", telefono: "3391000010",
                indirizzo: { testo: CITTA.altamura.testo, posizione: posizione("altamura") },
                datiImprenditore: { nomeAzienda: "Allevamento Quaranta" },
                datiLavoratore: { competenze: ["Mungitura", "Gestione stalla"] },
            }),
            base({
                ruoli: ["imprenditore"], nome: "Vito", cognome: "Colucci",
                dataNascita: "1981-07-09", email: "vito.colucci@seed.local", telefono: "3391000011",
                indirizzo: { testo: CITTA.gioia.testo, posizione: posizione("gioia") },
                datiImprenditore: { nomeAzienda: "Apicoltura Colucci", pIva: "08133290725" },
            }),
            base({
                ruoli: ["imprenditore"], nome: "Rosa", cognome: "Semeraro",
                dataNascita: "1972-12-18", email: "rosa.semeraro@seed.local", telefono: "3391000012",
                indirizzo: { testo: CITTA.trani.testo, posizione: posizione("trani") },
                datiImprenditore: { nomeAzienda: "Frutteti Semeraro", pIva: "06544310721", sitoWeb: "https://fruttetisemeraro.example" },
            }),
            base({
                ruoli: ["imprenditore"], nome: "Domenico", cognome: "Fumarola",
                dataNascita: "1985-03-25", email: "domenico.fumarola@seed.local", telefono: "3391000013",
                indirizzo: { testo: CITTA.brindisi.testo, posizione: posizione("brindisi") },
                datiImprenditore: { nomeAzienda: "Ortofrutta Fumarola" },
            }),
            base({
                ruoli: ["imprenditore"], nome: "Carmela", cognome: "Vitti",
                dataNascita: "1968-10-30", email: "carmela.vitti@seed.local", telefono: "3391000014",
                indirizzo: { testo: CITTA.manfredonia.testo, posizione: posizione("manfredonia") },
                datiImprenditore: { nomeAzienda: "Cerealicola Vitti", pIva: "03877650717" },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Giulia", cognome: "Perrone",
                dataNascita: "1999-04-14", email: "giulia.perrone@seed.local", telefono: "3391000015",
                indirizzo: { testo: CITTA.nardo.testo, posizione: posizione("nardo") },
                datiLavoratore: { competenze: ["Raccolta frutta", "Diradamento", "Potatura verde"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Youssef", cognome: "El Amrani",
                dataNascita: "1993-08-07", email: "youssef.elamrani@seed.local", telefono: "3391000016",
                indirizzo: { testo: CITTA.barletta.testo, posizione: posizione("barletta") },
                datiLavoratore: { competenze: ["Vendemmia", "Raccolta uva da tavola", "Legatura"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Nicola", cognome: "De Giorgi",
                dataNascita: "1986-01-21", email: "nicola.degiorgi@seed.local", telefono: "3391000017",
                indirizzo: { testo: CITTA.brindisi.testo, posizione: posizione("brindisi") },
                datiLavoratore: { competenze: ["Smielatura", "Gestione arnie"], certificazioni: ["Corso di apicoltura base"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Anna", cognome: "Mastrangelo",
                dataNascita: "1996-06-03", email: "anna.mastrangelo@seed.local", telefono: "3391000018",
                indirizzo: { testo: CITTA.gallipoli.testo, posizione: posizione("gallipoli") },
                datiLavoratore: { competenze: ["Lavoro in serra", "Trapianti", "Raccolta ortaggi"] },
            }),
            base({
                ruoli: ["lavoratore"], nome: "Stefano", cognome: "Leone",
                dataNascita: "1984-11-11", email: "stefano.leone@seed.local", telefono: "3391000019",
                indirizzo: { testo: CITTA.canosa.testo, posizione: posizione("canosa") },
                datiLavoratore: { competenze: ["Mietitrebbia", "Guida trattore", "Manutenzione mezzi"], certificazioni: ["Patentino trattore", "Patente C"] },
            }),
            base({
                ruoli: ["imprenditore", "lavoratore"], nome: "Teresa", cognome: "Caputo",
                dataNascita: "1979-09-16", email: "teresa.caputo@seed.local", telefono: "3391000020",
                indirizzo: { testo: CITTA.manduria.testo, posizione: posizione("manduria") },
                datiImprenditore: { nomeAzienda: "Cantina Caputo", pIva: "05122980733" },
                datiLavoratore: { competenze: ["Vinificazione", "Potatura", "Innesti"] },
            })
        );
    console.log("  creati 20 utenti");

    // ── 3. Annunci ───────────────────────────────────────────────────────
    // Date relative a luglio 2026: conclusi nel passato, aperti nel futuro.
    const prezzo = (min, max, unita = "giornata") => ({ min, max, unita });
    const daConcordare = { min: null, max: null, unita: "da_concordare" };

    const [
        a1, a2, a3, a4, a5, a6, a7, a8, a9, a10,
        b1, b2, b3, b4, b5, b6,
        c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12,
        d1, d2, d3, d4, d5, d6, d7, d8,
    ] =
        await Annuncio.create(
            {
                tipo: "richiesta_manodopera", autore: giovanni._id,
                titolo: "Raccolta olive — stagione 2026",
                descrizione: "Cerchiamo squadra per la raccolta in un oliveto di 12 ettari a coltivazione tradizionale. Vitto a carico nostro, si richiede esperienza con teli e abbacchiatore.",
                luogo: luogo("bari"), periodo: { dataInizio: "2026-10-15", dataFine: "2026-12-05" },
                orarioLavorativo: "7:00 - 15:00", tipoLavoro: "Olivicoltura",
                competenze: ["Raccolta olive", "Uso abbacchiatore"],
                numeroLavoratoriRichiesti: 8, prezzo: prezzo(60, 75),
            },
            {
                tipo: "richiesta_manodopera", autore: giovanni._id,
                titolo: "Potatura oliveto secolare",
                descrizione: "Potatura di riforma su piante secolari, zona Bari sud. Richiesta esperienza dimostrabile su potatura a vaso policonico.",
                luogo: luogo("bari"), periodo: { dataInizio: "2027-01-10", dataFine: "2027-02-28" },
                tipoLavoro: "Olivicoltura", competenze: ["Potatura", "Vaso policonico"],
                numeroLavoratoriRichiesti: 3, prezzo: prezzo(80, 100),
            },
            {
                tipo: "richiesta_manodopera", autore: maria._id,
                titolo: "Raccolta pomodori luglio-agosto",
                descrizione: "Raccolta pomodoro da industria su 30 ettari nel foggiano. Turni mattutini, trasporto dal centro di Cerignola organizzato dall'azienda.",
                luogo: luogo("cerignola"), periodo: { dataInizio: "2026-07-20", dataFine: "2026-08-31" },
                orarioLavorativo: "5:30 - 12:30", tipoLavoro: "Orticoltura",
                competenze: ["Raccolta ortaggi"],
                numeroLavoratoriRichiesti: 15, prezzo: prezzo(55, 65),
            },
            {
                tipo: "richiesta_manodopera", autore: maria._id,
                titolo: "Trattorista per aratura e semina",
                descrizione: "Serve trattorista esperto con patentino per lavorazioni estive e semina autunnale. Mezzi aziendali recenti, contratto stagionale.",
                luogo: luogo("cerignola"), periodo: { dataInizio: "2026-07-01", dataFine: "2026-10-31" },
                tipoLavoro: "Cerealicoltura", competenze: ["Guida trattore", "Aratura"],
                numeroLavoratoriRichiesti: 1, prezzo: prezzo(90, 110),
                stato: "in_corso",
            },
            {
                tipo: "richiesta_manodopera", autore: antonio._id,
                titolo: "Addetti frangitura al frantoio",
                descrizione: "Per la campagna olearia cerchiamo due addetti alla linea di frangitura: carico tramogge, controllo gramole, pulizia impianto a fine turno.",
                luogo: luogo("ostuni"), periodo: { dataInizio: "2026-10-20", dataFine: "2026-12-20" },
                orarioLavorativo: "Turni 8h, anche notturni", tipoLavoro: "Olivicoltura",
                competenze: ["Lavoro al frantoio"],
                numeroLavoratoriRichiesti: 2, prezzo: prezzo(1500, 1800, "lavoro_completo"),
            },
            {
                tipo: "richiesta_manodopera", autore: francesca._id,
                titolo: "Vendemmia 2026 — Nero di Troia",
                descrizione: "Vendemmia manuale su 18 ettari tra Andria e Corato. Cassette da 20kg, squadre da 5 con caposquadra. Gradita esperienza.",
                luogo: luogo("andria"), periodo: { dataInizio: "2026-09-05", dataFine: "2026-10-10" },
                orarioLavorativo: "6:00 - 13:00", tipoLavoro: "Viticoltura",
                competenze: ["Vendemmia"],
                numeroLavoratoriRichiesti: 10, prezzo: prezzo(60, 70),
            },
            {
                tipo: "richiesta_manodopera", autore: francesca._id,
                titolo: "Potatura invernale vigneto a spalliera",
                descrizione: "Potatura secca su impianto a controspalliera, sistema Guyot. Lavoro concluso, annuncio archiviato.",
                luogo: luogo("andria"), periodo: { dataInizio: "2026-01-15", dataFine: "2026-03-01" },
                tipoLavoro: "Viticoltura", competenze: ["Potatura", "Guyot"],
                numeroLavoratoriRichiesti: 4, prezzo: prezzo(75, 85),
                stato: "concluso",
            },
            {
                tipo: "richiesta_manodopera", autore: paolo._id,
                titolo: "Aiuto stalla e mungitura",
                descrizione: "Allevamento bovino da latte sulla Murgia cerca aiuto per mungitura serale e governo della stalla, anche part-time. Compenso da definire in base all'esperienza.",
                luogo: luogo("altamura"), periodo: { dataInizio: "2026-08-01", dataFine: "2027-07-31" },
                orarioLavorativo: "16:00 - 20:00", tipoLavoro: "Zootecnia",
                competenze: ["Mungitura", "Gestione stalla"],
                numeroLavoratoriRichiesti: 2, prezzo: daConcordare,
            },
            {
                tipo: "richiesta_manodopera", autore: antonio._id,
                titolo: "Raccolta mandorle — annullata",
                descrizione: "Raccolta mandorle in agro di Ostuni. Annuncio chiuso: la raccolta è stata affidata a un contoterzista.",
                luogo: luogo("ostuni"), periodo: { dataInizio: "2026-08-20", dataFine: "2026-09-15" },
                tipoLavoro: "Frutticoltura", competenze: ["Raccolta con scuotitore"],
                numeroLavoratoriRichiesti: 5, prezzo: prezzo(55, 60),
                stato: "chiuso",
            },
            {
                tipo: "richiesta_manodopera", autore: maria._id,
                titolo: "Confezionamento ortaggi in magazzino",
                descrizione: "Linea di confezionamento ortaggi freschi: cernita, pesatura, etichettatura. Lavoro concluso a giugno.",
                luogo: luogo("cerignola"), periodo: { dataInizio: "2026-04-01", dataFine: "2026-06-15" },
                orarioLavorativo: "8:00 - 14:00", tipoLavoro: "Orticoltura",
                competenze: ["Confezionamento"],
                numeroLavoratoriRichiesti: 6, prezzo: prezzo(58, 62),
                stato: "concluso",
            },
            // ── Disponibilità dei lavoratori ──
            {
                tipo: "disponibilita_lavoro", autore: luca._id,
                titolo: "Potatore esperto disponibile da gennaio",
                descrizione: "Potatore con 10 anni di esperienza su olivo (vaso policonico) e mandorlo. Automunito, disponibile nel raggio di 50 km da Bari.",
                luogo: luogo("bari", 50), periodo: { dataInizio: "2027-01-01", dataFine: "2027-03-31" },
                tipoLavoro: "Olivicoltura", competenze: ["Potatura", "Vaso policonico", "Raccolta olive"],
                prezzo: prezzo(80, 90),
            },
            {
                tipo: "disponibilita_lavoro", autore: sara._id,
                titolo: "Operaia agricola per serre e raccolta",
                descrizione: "Esperienza in serra (trapianti, legatura, raccolta) e confezionamento. Disponibile da subito nel Salento.",
                luogo: luogo("lecce", 30), periodo: { dataInizio: "2026-07-15", dataFine: "2026-12-31" },
                tipoLavoro: "Orticoltura", competenze: ["Lavoro in serra", "Raccolta ortaggi", "Confezionamento"],
                prezzo: daConcordare,
            },
            {
                tipo: "disponibilita_lavoro", autore: ahmed._id,
                titolo: "Trattorista con patentino — Capitanata",
                descrizione: "Trattorista con patentino e esperienza su aratura, erpicatura e semina. Disponibile anche per raccolta pomodoro. Zona Foggia e provincia.",
                luogo: luogo("foggia", 80), periodo: { dataInizio: "2026-07-15", dataFine: "2026-11-30" },
                tipoLavoro: "Cerealicoltura", competenze: ["Guida trattore", "Aratura", "Semina"],
                prezzo: prezzo(90, 100),
            },
            {
                tipo: "disponibilita_lavoro", autore: elena._id,
                titolo: "Vendemmia e lavori di cantina",
                descrizione: "Tre stagioni di vendemmia alle spalle e un anno in cantina (pulizia vasche, travasi, imbottigliamento). Cerco ingaggio per la stagione 2026.",
                luogo: luogo("taranto", 60), periodo: { dataInizio: "2026-08-25", dataFine: "2026-11-15" },
                tipoLavoro: "Viticoltura", competenze: ["Vendemmia", "Lavori di cantina"],
                prezzo: prezzo(65, 75),
            },
            {
                tipo: "disponibilita_lavoro", autore: marco._id,
                titolo: "Manutenzione impianti di irrigazione",
                descrizione: "Progetto, installo e riparo impianti a goccia e subirrigazione. Preventivo a corpo per impianto, sopralluogo gratuito.",
                luogo: luogo("monopoli", 40), periodo: { dataInizio: "2026-07-15", dataFine: "2027-06-30" },
                tipoLavoro: "Orticoltura", competenze: ["Impianti di irrigazione"],
                prezzo: prezzo(800, 1200, "lavoro_completo"),
            },
            {
                tipo: "disponibilita_lavoro", autore: paolo._id,
                titolo: "Disponibile per mungitura nei weekend",
                descrizione: "Allevatore con impianto proprio, disponibile ad aiutare altre aziende della Murgia nella mungitura del fine settimana.",
                luogo: luogo("altamura", 30), periodo: { dataInizio: "2026-08-01", dataFine: "2026-12-31" },
                tipoLavoro: "Zootecnia", competenze: ["Mungitura"],
                prezzo: daConcordare,
            },
            // ── Nuove richieste di manodopera ──
            {
                tipo: "richiesta_manodopera", autore: vito._id,
                titolo: "Aiuto smielatura estate 2026",
                descrizione: "Apicoltura con 250 arnie cerca aiuto per la smielatura di luglio e agosto: disopercolatura, centrifuga, invasettamento. Laboratorio attrezzato a Gioia del Colle.",
                luogo: luogo("gioia"), periodo: { dataInizio: "2026-07-20", dataFine: "2026-08-30" },
                orarioLavorativo: "6:00 - 13:00", tipoLavoro: "Apicoltura",
                competenze: ["Smielatura"],
                numeroLavoratoriRichiesti: 2, prezzo: prezzo(60, 70),
            },
            {
                tipo: "richiesta_manodopera", autore: vito._id,
                titolo: "Nomadismo arnie per fioritura agrumi",
                descrizione: "Spostamento notturno di 80 arnie verso gli agrumeti del metapontino e ritorno a fine fioritura. Servono braccia ferme e niente paura delle api. Lavoro concluso.",
                luogo: luogo("gioia"), periodo: { dataInizio: "2026-04-10", dataFine: "2026-05-20" },
                orarioLavorativo: "Notturno", tipoLavoro: "Apicoltura",
                competenze: ["Gestione arnie"],
                numeroLavoratoriRichiesti: 1, prezzo: prezzo(400, 500, "lavoro_completo"),
                stato: "concluso",
            },
            {
                tipo: "richiesta_manodopera", autore: rosa._id,
                titolo: "Diradamento pesche e nettarine",
                descrizione: "Diradamento manuale dei frutti su 8 ettari di pescheto tra Trani e Barletta. Lavoro concluso a giugno con squadra di quattro persone.",
                luogo: luogo("trani"), periodo: { dataInizio: "2026-05-05", dataFine: "2026-06-10" },
                orarioLavorativo: "6:30 - 13:30", tipoLavoro: "Frutticoltura",
                competenze: ["Diradamento"],
                numeroLavoratoriRichiesti: 4, prezzo: prezzo(60, 70),
                stato: "concluso",
            },
            {
                tipo: "richiesta_manodopera", autore: rosa._id,
                titolo: "Raccolta uva da tavola Italia e Vittoria",
                descrizione: "Raccolta e confezionamento in campo di uva da tavola sotto tendone. Si lavora in squadra con carrelli, gradita esperienza su taglio e pulizia del grappolo.",
                luogo: luogo("trani"), periodo: { dataInizio: "2026-08-25", dataFine: "2026-10-20" },
                orarioLavorativo: "6:00 - 13:00", tipoLavoro: "Frutticoltura",
                competenze: ["Raccolta uva da tavola", "Confezionamento"],
                numeroLavoratoriRichiesti: 8, prezzo: prezzo(60, 70),
            },
            {
                tipo: "richiesta_manodopera", autore: domenico._id,
                titolo: "Trapianti carciofi brindisini",
                descrizione: "Trapianto ovoli di carciofo su 10 ettari in agro di Brindisi. Lavoro a squadre con trapiantatrice agevolatrice, si inizia a Ferragosto.",
                luogo: luogo("brindisi"), periodo: { dataInizio: "2026-08-16", dataFine: "2026-09-20" },
                orarioLavorativo: "6:00 - 12:00", tipoLavoro: "Orticoltura",
                competenze: ["Trapianti"],
                numeroLavoratoriRichiesti: 6, prezzo: prezzo(55, 62),
            },
            {
                tipo: "richiesta_manodopera", autore: domenico._id,
                titolo: "Raccolta finocchi invernali",
                descrizione: "Raccolta e prima pulizia dei finocchi da novembre a gennaio. Si lavora anche con pioggia leggera, forniamo dispositivi impermeabili.",
                luogo: luogo("brindisi"), periodo: { dataInizio: "2026-11-02", dataFine: "2027-01-31" },
                orarioLavorativo: "7:00 - 14:00", tipoLavoro: "Orticoltura",
                competenze: ["Raccolta ortaggi"],
                numeroLavoratoriRichiesti: 5, prezzo: prezzo(58, 65),
            },
            {
                tipo: "richiesta_manodopera", autore: carmela._id,
                titolo: "Trebbiatura grano duro — Tavoliere",
                descrizione: "Campagna di trebbiatura su 60 ettari di grano duro. Cerchiamo operatore per mietitrebbia aziendale e un autista per il trasporto alla cooperativa.",
                luogo: luogo("manfredonia"), periodo: { dataInizio: "2026-06-20", dataFine: "2026-07-25" },
                orarioLavorativo: "Giornata piena, festivi compresi", tipoLavoro: "Cerealicoltura",
                competenze: ["Mietitrebbia", "Patente C"],
                numeroLavoratoriRichiesti: 2, prezzo: prezzo(100, 120),
                stato: "in_corso",
            },
            {
                tipo: "richiesta_manodopera", autore: carmela._id,
                titolo: "Pulizia e preparazione silos",
                descrizione: "Pulizia dei silos aziendali prima del nuovo raccolto. Annuncio chiuso: abbiamo risolto internamente.",
                luogo: luogo("manfredonia"), periodo: { dataInizio: "2026-06-01", dataFine: "2026-06-15" },
                tipoLavoro: "Cerealicoltura", competenze: [],
                numeroLavoratoriRichiesti: 3, prezzo: prezzo(50, 55),
                stato: "chiuso",
            },
            {
                tipo: "richiesta_manodopera", autore: teresa._id,
                titolo: "Vendemmia Primitivo di Manduria",
                descrizione: "Vendemmia manuale del Primitivo su vigneti ad alberello. Raccolta in cassette da 15kg nelle ore fresche, esperienza gradita ma non indispensabile.",
                luogo: luogo("manduria"), periodo: { dataInizio: "2026-08-28", dataFine: "2026-09-25" },
                orarioLavorativo: "5:30 - 11:30", tipoLavoro: "Viticoltura",
                competenze: ["Vendemmia"],
                numeroLavoratoriRichiesti: 12, prezzo: prezzo(65, 75),
            },
            {
                tipo: "richiesta_manodopera", autore: giovanni._id,
                titolo: "Ripristino muretti a secco",
                descrizione: "Ripristino di circa 300 metri di muretti a secco crollati lungo i confini dell'oliveto. Tecnica tradizionale, pietra recuperata in loco. Compenso da concordare in base all'esperienza.",
                luogo: luogo("bari"), periodo: { dataInizio: "2026-09-01", dataFine: "2026-11-30" },
                tipoLavoro: "Altro", competenze: ["Muretti a secco"],
                numeroLavoratoriRichiesti: 2, prezzo: daConcordare,
            },
            {
                tipo: "richiesta_manodopera", autore: antonio._id,
                titolo: "Raccolta fichi e fioroni",
                descrizione: "Raccolta mattutina di fioroni e fichi da mensa negli impianti di Ostuni, con selezione e incassettamento in campo. Lavoro concluso a luglio.",
                luogo: luogo("ostuni"), periodo: { dataInizio: "2026-06-10", dataFine: "2026-07-10" },
                orarioLavorativo: "5:30 - 11:00", tipoLavoro: "Frutticoltura",
                competenze: ["Raccolta frutta"],
                numeroLavoratoriRichiesti: 3, prezzo: prezzo(55, 60),
                stato: "concluso",
            },
            {
                tipo: "richiesta_manodopera", autore: paolo._id,
                titolo: "Tosatura gregge — maggio 2026",
                descrizione: "Tosatura di 200 capi ovini. Annuncio chiuso: ci siamo accordati con una squadra di tosatori professionisti.",
                luogo: luogo("altamura"), periodo: { dataInizio: "2026-05-10", dataFine: "2026-05-25" },
                tipoLavoro: "Zootecnia", competenze: ["Tosatura"],
                numeroLavoratoriRichiesti: 2, prezzo: prezzo(600, 800, "lavoro_completo"),
                stato: "chiuso",
            },
            // ── Nuove disponibilità dei lavoratori ──
            {
                tipo: "disponibilita_lavoro", autore: giulia._id,
                titolo: "Raccolta frutta estiva nel Salento",
                descrizione: "Due stagioni di raccolta tra pesche, albicocche e uva da tavola. Veloce e attenta alla selezione, automunita, disponibile da subito.",
                luogo: luogo("nardo", 50), periodo: { dataInizio: "2026-07-15", dataFine: "2026-09-30" },
                tipoLavoro: "Frutticoltura", competenze: ["Raccolta frutta", "Diradamento"],
                prezzo: prezzo(55, 65),
            },
            {
                tipo: "disponibilita_lavoro", autore: youssef._id,
                titolo: "Vendemmiatore esperto — nord barese",
                descrizione: "Cinque vendemmie tra Castel del Monte e la Valle d'Itria, esperienza anche su uva da tavola sotto tendone. Disponibile per tutta la stagione.",
                luogo: luogo("barletta", 60), periodo: { dataInizio: "2026-08-20", dataFine: "2026-10-31" },
                tipoLavoro: "Viticoltura", competenze: ["Vendemmia", "Raccolta uva da tavola"],
                prezzo: prezzo(60, 70),
            },
            {
                tipo: "disponibilita_lavoro", autore: nicola._id,
                titolo: "Aiuto apicoltore con corso base",
                descrizione: "Ho seguito il corso base di apicoltura e ho fatto una stagione di smielatura. Cerco apicoltori della zona per crescere nel mestiere, anche solo per i lavori pesanti.",
                luogo: luogo("brindisi", 70), periodo: { dataInizio: "2026-07-15", dataFine: "2027-06-30" },
                tipoLavoro: "Apicoltura", competenze: ["Smielatura", "Gestione arnie"],
                prezzo: daConcordare,
            },
            {
                tipo: "disponibilita_lavoro", autore: anna._id,
                titolo: "Serre e trapianti — basso Salento",
                descrizione: "Esperienza in serra fredda e tunnel: trapianti, legatura pomodoro, raccolta. Cerco impieghi da settembre in poi, zona Gallipoli e dintorni.",
                luogo: luogo("gallipoli", 40), periodo: { dataInizio: "2026-09-01", dataFine: "2027-05-31" },
                tipoLavoro: "Orticoltura", competenze: ["Lavoro in serra", "Trapianti"],
                prezzo: prezzo(55, 60),
            },
            {
                tipo: "disponibilita_lavoro", autore: stefano._id,
                titolo: "Operatore mietitrebbia e trattorista",
                descrizione: "Opero mietitrebbie New Holland e Claas, patente C per il trasporto granella. Disponibile per campagne di trebbiatura in tutta la Puglia nord.",
                luogo: luogo("canosa", 100), periodo: { dataInizio: "2026-06-01", dataFine: "2026-08-31" },
                tipoLavoro: "Cerealicoltura", competenze: ["Mietitrebbia", "Guida trattore", "Patente C"],
                prezzo: prezzo(110, 130),
            },
            {
                tipo: "disponibilita_lavoro", autore: teresa._id,
                titolo: "Aiuto in cantina per la vinificazione",
                descrizione: "Vinifico da vent'anni il Primitivo di famiglia: follature, rimontaggi, travasi e igiene di cantina. Disponibile a dare una mano ad altre cantine della zona dopo la mia vendemmia.",
                luogo: luogo("manduria", 40), periodo: { dataInizio: "2026-09-20", dataFine: "2026-11-30" },
                tipoLavoro: "Viticoltura", competenze: ["Vinificazione", "Lavori di cantina"],
                prezzo: daConcordare,
            },
            {
                tipo: "disponibilita_lavoro", autore: luca._id,
                titolo: "Raccolta ciliegie e mandorle — primavera",
                descrizione: "Disponibilità per la raccolta di ciliegie e mandorle tra Bari e la Valle d'Itria. Collaborazione conclusa con soddisfazione reciproca.",
                luogo: luogo("bari", 40), periodo: { dataInizio: "2026-05-01", dataFine: "2026-06-30" },
                tipoLavoro: "Frutticoltura", competenze: ["Raccolta frutta"],
                prezzo: prezzo(60, 70),
                stato: "concluso",
            },
            {
                tipo: "disponibilita_lavoro", autore: marco._id,
                titolo: "Recinzioni e piccole manutenzioni aziendali",
                descrizione: "Monto recinzioni elettrificate e tradizionali, sistemo cancelli, tettoie e piccole opere aziendali. Preventivo dopo sopralluogo.",
                luogo: luogo("monopoli", 50), periodo: { dataInizio: "2026-08-01", dataFine: "2027-07-31" },
                tipoLavoro: "Altro", competenze: ["Recinzioni", "Manutenzioni"],
                prezzo: daConcordare,
            }
        );
    console.log("  creati 36 annunci (22 richieste, 14 disponibilità)");

    // ── 4. Proposte ──────────────────────────────────────────────────────
    const risposta = (giorniFa) => new Date(Date.now() - giorniFa * 86400000);

    await Proposta.create(
        // aperti: in attesa
        { annuncio: a1._id, proponente: luca._id, destinatario: giovanni._id, messaggio: "Buongiorno, ho dieci anni di esperienza nella raccolta con abbacchiatore. Disponibile per tutta la stagione." },
        { annuncio: a1._id, proponente: sara._id, destinatario: giovanni._id, messaggio: "Salve, sarei interessata. Ho fatto due stagioni di raccolta nel leccese." },
        { annuncio: a3._id, proponente: ahmed._id, destinatario: maria._id, messaggio: "Disponibile per tutta la campagna del pomodoro, conosco bene la zona." },
        { annuncio: a6._id, proponente: elena._id, destinatario: francesca._id, messaggio: "Tre vendemmie di esperienza, disponibile anche per la cantina." },
        { annuncio: a8._id, proponente: elena._id, destinatario: paolo._id, messaggio: "Non ho esperienza di stalla ma imparo in fretta, posso fare una prova?" },
        { annuncio: c1._id, proponente: nicola._id, destinatario: vito._id, messaggio: "Ho fatto una stagione di smielatura e il corso base di apicoltura. Sarebbe l'occasione che cerco." },
        { annuncio: c4._id, proponente: youssef._id, destinatario: rosa._id, messaggio: "Esperienza su uva da tavola sotto tendone, conosco taglio e pulizia del grappolo." },
        { annuncio: c4._id, proponente: giulia._id, destinatario: rosa._id, messaggio: "Ho già lavorato con voi al diradamento, sarei felice di tornare per la raccolta." },
        { annuncio: c5._id, proponente: anna._id, destinatario: domenico._id, messaggio: "Trapianti in serra e in pieno campo, disponibile da Ferragosto senza problemi." },
        { annuncio: c9._id, proponente: youssef._id, destinatario: teresa._id, messaggio: "Cinque vendemmie alle spalle, abituato alle cassette e alle ore fresche." },
        { annuncio: c9._id, proponente: elena._id, destinatario: teresa._id, messaggio: "Vendemmia e cantina: se serve una mano anche dopo la raccolta, ci sono." },
        { annuncio: c10._id, proponente: marco._id, destinatario: giovanni._id, messaggio: "Ho rifatto i muretti della masseria di famiglia, posso passare per un sopralluogo." },
        // disponibilità: un imprenditore si propone al lavoratore
        { annuncio: b3._id, proponente: carmela._id, destinatario: ahmed._id, messaggio: "Per la prossima semina ci servirebbe un trattorista affidabile: le va di sentirci?" },
        // in_corso: accettate + rifiutate
        { annuncio: a4._id, proponente: ahmed._id, destinatario: maria._id, stato: "accettata", dataRisposta: risposta(12), messaggio: "Patentino in corso di validità, posso iniziare subito." },
        { annuncio: a4._id, proponente: marco._id, destinatario: maria._id, stato: "rifiutata", dataRisposta: risposta(12), messaggio: "Guido il trattore da 15 anni, disponibile da subito." },
        { annuncio: c7._id, proponente: stefano._id, destinatario: carmela._id, stato: "accettata", dataRisposta: risposta(20), messaggio: "Opero mietitrebbie da dodici anni e ho la patente C per la granella." },
        { annuncio: c7._id, proponente: ahmed._id, destinatario: carmela._id, stato: "rifiutata", dataRisposta: risposta(20), messaggio: "Trattorista esperto, mai usato la mietitrebbia ma imparo in fretta." },
        // conclusi: accettate (+ rifiutate)
        { annuncio: a7._id, proponente: luca._id, destinatario: francesca._id, stato: "accettata", dataRisposta: risposta(160), messaggio: "Specializzato in potatura secca su Guyot." },
        { annuncio: a10._id, proponente: sara._id, destinatario: maria._id, stato: "accettata", dataRisposta: risposta(95), messaggio: "Esperienza di confezionamento in cooperativa." },
        { annuncio: a10._id, proponente: elena._id, destinatario: maria._id, stato: "rifiutata", dataRisposta: risposta(95) },
        { annuncio: c2._id, proponente: nicola._id, destinatario: vito._id, stato: "accettata", dataRisposta: risposta(85), messaggio: "Nessun problema con il lavoro notturno, ho già spostato arnie con il mio istruttore." },
        { annuncio: c3._id, proponente: giulia._id, destinatario: rosa._id, stato: "accettata", dataRisposta: risposta(60), messaggio: "Diradamento fatto per due stagioni su pescheto, so dosare la carica per pianta." },
        { annuncio: c3._id, proponente: sara._id, destinatario: rosa._id, stato: "rifiutata", dataRisposta: risposta(60), messaggio: "Mai fatto diradamento ma ho manualità con la raccolta." },
        { annuncio: c11._id, proponente: anna._id, destinatario: antonio._id, stato: "accettata", dataRisposta: risposta(30), messaggio: "Raccolgo fichi da quando sono bambina, disponibile alle 5:30 senza problemi." },
        // disponibilità conclusa: proposta dell'imprenditore accettata dal lavoratore
        { annuncio: d7._id, proponente: rosa._id, destinatario: luca._id, stato: "accettata", dataRisposta: risposta(55), messaggio: "Avremmo un ciliegeto a Turi da raccogliere a maggio, le interessa?" }
    );
    console.log("  create 25 proposte (13 in attesa, 8 accettate, 4 rifiutate)");

    // ── 5. Recensioni (solo su annunci conclusi) + ratingMedio ──────────
    await Recensione.create(
        { annuncio: a7._id, autore: francesca._id, destinatario: luca._id, direzione: "imprenditore_a_lavoratore", stelle: 5, commento: "Preciso e veloce, il vigneto non è mai stato potato così bene. Lo richiamerò." },
        { annuncio: a7._id, autore: luca._id, destinatario: francesca._id, direzione: "lavoratore_a_imprenditore", stelle: 5, commento: "Azienda seria, pagamento puntuale e attrezzatura in ordine." },
        { annuncio: a10._id, autore: maria._id, destinatario: sara._id, direzione: "imprenditore_a_lavoratore", stelle: 4, commento: "Ottimo lavoro sulla linea, qualche ritardo la mattina ma grande affidabilità." },
        { annuncio: a10._id, autore: sara._id, destinatario: maria._id, direzione: "lavoratore_a_imprenditore", stelle: 5, commento: "Ambiente organizzato e turni rispettati, esperienza positiva." },
        { annuncio: c2._id, autore: vito._id, destinatario: nicola._id, direzione: "imprenditore_a_lavoratore", stelle: 5, commento: "Mano ferma e delicata con le famiglie, nemmeno un telaino rovesciato in due notti di lavoro." },
        { annuncio: c2._id, autore: nicola._id, destinatario: vito._id, direzione: "lavoratore_a_imprenditore", stelle: 4, commento: "Ho imparato tantissimo sul nomadismo, orari duri ma pattuiti in anticipo." },
        { annuncio: c3._id, autore: rosa._id, destinatario: giulia._id, direzione: "imprenditore_a_lavoratore", stelle: 4, commento: "Diradamento accurato e carico ben dosato, la richiameremo per la raccolta." },
        { annuncio: c3._id, autore: giulia._id, destinatario: rosa._id, direzione: "lavoratore_a_imprenditore", stelle: 5, commento: "Squadra ben organizzata e pause rispettate, tra i migliori frutteti dove ho lavorato." },
        { annuncio: c11._id, autore: antonio._id, destinatario: anna._id, direzione: "imprenditore_a_lavoratore", stelle: 3, commento: "Buona manualità sulla raccolta, ma sulla selezione in cassetta serve più attenzione." },
        { annuncio: c11._id, autore: anna._id, destinatario: antonio._id, direzione: "lavoratore_a_imprenditore", stelle: 4, commento: "Ritmi sostenuti ma ambiente corretto, pagamento come da accordi." },
        { annuncio: d7._id, autore: rosa._id, destinatario: luca._id, direzione: "imprenditore_a_lavoratore", stelle: 5, commento: "Il ciliegeto raccolto in tempo record e senza sprechi, professionista vero." },
        { annuncio: d7._id, autore: luca._id, destinatario: rosa._id, direzione: "lavoratore_a_imprenditore", stelle: 4, commento: "Bella collaborazione, unico neo la logistica delle cassette il primo giorno." }
    );

    // Stessa formula del recensioneController: media arrotondata a 1 decimale.
    for (const utente of [luca, francesca, sara, maria, vito, nicola, rosa, giulia, antonio, anna]) {
        const recensioni = await Recensione.find({ destinatario: utente._id });
        const media = recensioni.reduce((somma, r) => somma + r.stelle, 0) / recensioni.length;
        await User.findByIdAndUpdate(utente._id, { ratingMedio: Math.round(media * 10) / 10 });
    }
    console.log("  create 12 recensioni e aggiornato il ratingMedio");

    // ── 6. Preferiti ─────────────────────────────────────────────────────
    await Preferito.create(
        { utente: luca._id, tipo: "annuncio", riferimento: a2._id },
        { utente: luca._id, tipo: "annuncio", riferimento: a6._id },
        { utente: sara._id, tipo: "annuncio", riferimento: a3._id },
        { utente: elena._id, tipo: "annuncio", riferimento: a6._id },
        { utente: elena._id, tipo: "annuncio", riferimento: a9._id }, // annuncio chiuso: nei preferiti mostra il chip di stato
        { utente: marco._id, tipo: "annuncio", riferimento: a1._id },
        { utente: giovanni._id, tipo: "annuncio", riferimento: b1._id },
        { utente: giulia._id, tipo: "annuncio", riferimento: c4._id },
        { utente: giulia._id, tipo: "annuncio", riferimento: a3._id },
        { utente: youssef._id, tipo: "annuncio", riferimento: c9._id },
        { utente: youssef._id, tipo: "annuncio", riferimento: a6._id },
        { utente: anna._id, tipo: "annuncio", riferimento: c6._id },
        { utente: nicola._id, tipo: "annuncio", riferimento: c1._id },
        { utente: stefano._id, tipo: "annuncio", riferimento: b3._id },
        { utente: rosa._id, tipo: "annuncio", riferimento: d1._id },
        { utente: vito._id, tipo: "annuncio", riferimento: d3._id },
        { utente: carmela._id, tipo: "annuncio", riferimento: d5._id },
        { utente: teresa._id, tipo: "annuncio", riferimento: d2._id },
        { utente: giovanni._id, tipo: "profilo", riferimento: luca._id },
        { utente: maria._id, tipo: "profilo", riferimento: ahmed._id },
        { utente: rosa._id, tipo: "profilo", riferimento: giulia._id },
        { utente: teresa._id, tipo: "profilo", riferimento: youssef._id },
        { utente: domenico._id, tipo: "profilo", riferimento: anna._id }
    );
    console.log("  creati 23 preferiti (18 annunci, 5 profili)");

    console.log("\nSeed completato. Tutti gli utenti hanno password: " + PASSWORD);
    console.log("Email: giovanni.russo@seed.local, maria.desantis@seed.local, antonio.greco@seed.local, francesca.lorusso@seed.local, luca.moretti@seed.local, sara.romano@seed.local, ahmed.benali@seed.local, elena.carrieri@seed.local, marco.palmisano@seed.local, paolo.quaranta@seed.local, vito.colucci@seed.local, rosa.semeraro@seed.local, domenico.fumarola@seed.local, carmela.vitti@seed.local, giulia.perrone@seed.local, youssef.elamrani@seed.local, nicola.degiorgi@seed.local, anna.mastrangelo@seed.local, stefano.leone@seed.local, teresa.caputo@seed.local");

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error("Seed fallito:", error.message);
    if (error.errors) {
        for (const [campo, dettaglio] of Object.entries(error.errors)) {
            console.error(`  - ${campo}: ${dettaglio.message}`);
        }
    }
    await mongoose.disconnect();
    process.exit(1);
});
