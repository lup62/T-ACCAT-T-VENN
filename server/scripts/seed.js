/**
 * seed.js — ripulisce il database e lo popola con dati di sviluppo realistici.
 *
 * Uso (dalla cartella server/):
 *   node scripts/seed.js
 *
 * ATTENZIONE: svuota TUTTE le collection (utenti, annunci, proposte,
 * preferiti, recensioni, conversazioni, refresh token) prima di ricreare
 * i dati. Da usare solo sul database di sviluppo.
 *
 * Cosa crea:
 *   - 10 utenti (4 imprenditori, 5 lavoratori, 1 con doppio ruolo),
 *     tutti con password "Password123!"
 *   - 16 annunci tra richieste di manodopera e disponibilità, con stati
 *     misti (aperto, in_corso, concluso, chiuso) e prezzi di ogni tipo
 *   - proposte coerenti con gli stati (accettate sugli in_corso/conclusi,
 *     in attesa sugli aperti, qualche rifiutata)
 *   - recensioni reciproche sugli annunci conclusi, con ratingMedio
 *     ricalcolato come fa il controller (media arrotondata a 1 decimale)
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
const Conversazione = require("../models/Conversazione");
const RefreshToken = require("../models/RefreshToken");

const PASSWORD = "Password123!";

// [longitudine, latitudine]
const CITTA = {
    bari: { testo: "Bari, Italia", coord: [16.8719, 41.1171] },
    andria: { testo: "Andria, Italia", coord: [16.2917, 41.2317] },
    foggia: { testo: "Foggia, Italia", coord: [15.5444, 41.4621] },
    cerignola: { testo: "Cerignola, Italia", coord: [15.8996, 41.2656] },
    lecce: { testo: "Lecce, Italia", coord: [18.1743, 40.3529] },
    taranto: { testo: "Taranto, Italia", coord: [17.2470, 40.4644] },
    ostuni: { testo: "Ostuni, Italia", coord: [17.5786, 40.7295] },
    monopoli: { testo: "Monopoli, Italia", coord: [17.3040, 40.9556] },
    altamura: { testo: "Altamura, Italia", coord: [16.5533, 40.8266] },
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
    const collections = [User, Annuncio, Proposta, Preferito, Recensione, Conversazione, RefreshToken];
    for (const model of collections) {
        const { deletedCount } = await model.deleteMany({});
        console.log(`  svuotata ${model.collection.collectionName}: ${deletedCount} documenti rimossi`);
    }

    // ── 2. Utenti ────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(PASSWORD, 12);

    const base = (u) => ({ ...u, passwordHash });

    const [giovanni, maria, antonio, francesca, luca, sara, ahmed, elena, marco, paolo] =
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
            })
        );
    console.log("  creati 10 utenti");

    // ── 3. Annunci ───────────────────────────────────────────────────────
    // Date relative a luglio 2026: conclusi nel passato, aperti nel futuro.
    const prezzo = (min, max, unita = "giornata") => ({ min, max, unita });
    const daConcordare = { min: null, max: null, unita: "da_concordare" };

    const [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, b1, b2, b3, b4, b5, b6] =
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
            }
        );
    console.log("  creati 16 annunci (10 richieste, 6 disponibilità)");

    // ── 4. Proposte ──────────────────────────────────────────────────────
    const risposta = (giorniFa) => new Date(Date.now() - giorniFa * 86400000);

    await Proposta.create(
        // aperti: in attesa
        { annuncio: a1._id, proponente: luca._id, destinatario: giovanni._id, messaggio: "Buongiorno, ho dieci anni di esperienza nella raccolta con abbacchiatore. Disponibile per tutta la stagione." },
        { annuncio: a1._id, proponente: sara._id, destinatario: giovanni._id, messaggio: "Salve, sarei interessata. Ho fatto due stagioni di raccolta nel leccese." },
        { annuncio: a3._id, proponente: ahmed._id, destinatario: maria._id, messaggio: "Disponibile per tutta la campagna del pomodoro, conosco bene la zona." },
        { annuncio: a6._id, proponente: elena._id, destinatario: francesca._id, messaggio: "Tre vendemmie di esperienza, disponibile anche per la cantina." },
        { annuncio: a8._id, proponente: elena._id, destinatario: paolo._id, messaggio: "Non ho esperienza di stalla ma imparo in fretta, posso fare una prova?" },
        // in_corso: accettata + una rifiutata
        { annuncio: a4._id, proponente: ahmed._id, destinatario: maria._id, stato: "accettata", dataRisposta: risposta(12), messaggio: "Patentino in corso di validità, posso iniziare subito." },
        { annuncio: a4._id, proponente: marco._id, destinatario: maria._id, stato: "rifiutata", dataRisposta: risposta(12), messaggio: "Guido il trattore da 15 anni, disponibile da subito." },
        // conclusi: accettate (+ una rifiutata)
        { annuncio: a7._id, proponente: luca._id, destinatario: francesca._id, stato: "accettata", dataRisposta: risposta(160), messaggio: "Specializzato in potatura secca su Guyot." },
        { annuncio: a10._id, proponente: sara._id, destinatario: maria._id, stato: "accettata", dataRisposta: risposta(95), messaggio: "Esperienza di confezionamento in cooperativa." },
        { annuncio: a10._id, proponente: elena._id, destinatario: maria._id, stato: "rifiutata", dataRisposta: risposta(95) }
    );
    console.log("  create 10 proposte (5 in attesa, 3 accettate, 2 rifiutate)");

    // ── 5. Recensioni (solo su annunci conclusi) + ratingMedio ──────────
    await Recensione.create(
        { annuncio: a7._id, autore: francesca._id, destinatario: luca._id, direzione: "imprenditore_a_lavoratore", stelle: 5, commento: "Preciso e veloce, il vigneto non è mai stato potato così bene. Lo richiamerò." },
        { annuncio: a7._id, autore: luca._id, destinatario: francesca._id, direzione: "lavoratore_a_imprenditore", stelle: 5, commento: "Azienda seria, pagamento puntuale e attrezzatura in ordine." },
        { annuncio: a10._id, autore: maria._id, destinatario: sara._id, direzione: "imprenditore_a_lavoratore", stelle: 4, commento: "Ottimo lavoro sulla linea, qualche ritardo la mattina ma grande affidabilità." },
        { annuncio: a10._id, autore: sara._id, destinatario: maria._id, direzione: "lavoratore_a_imprenditore", stelle: 5, commento: "Ambiente organizzato e turni rispettati, esperienza positiva." }
    );

    // Stessa formula del recensioneController: media arrotondata a 1 decimale.
    for (const utente of [luca, francesca, sara, maria]) {
        const recensioni = await Recensione.find({ destinatario: utente._id });
        const media = recensioni.reduce((somma, r) => somma + r.stelle, 0) / recensioni.length;
        await User.findByIdAndUpdate(utente._id, { ratingMedio: Math.round(media * 10) / 10 });
    }
    console.log("  create 4 recensioni e aggiornato il ratingMedio");

    // ── 6. Preferiti ─────────────────────────────────────────────────────
    await Preferito.create(
        { utente: luca._id, tipo: "annuncio", riferimento: a2._id },
        { utente: luca._id, tipo: "annuncio", riferimento: a6._id },
        { utente: sara._id, tipo: "annuncio", riferimento: a3._id },
        { utente: elena._id, tipo: "annuncio", riferimento: a6._id },
        { utente: elena._id, tipo: "annuncio", riferimento: a9._id }, // annuncio chiuso: nei preferiti mostra il chip di stato
        { utente: marco._id, tipo: "annuncio", riferimento: a1._id },
        { utente: giovanni._id, tipo: "annuncio", riferimento: b1._id },
        { utente: giovanni._id, tipo: "profilo", riferimento: luca._id },
        { utente: maria._id, tipo: "profilo", riferimento: ahmed._id }
    );
    console.log("  creati 9 preferiti (7 annunci, 2 profili)");

    console.log("\nSeed completato. Tutti gli utenti hanno password: " + PASSWORD);
    console.log("Email: giovanni.russo@seed.local, maria.desantis@seed.local, antonio.greco@seed.local, francesca.lorusso@seed.local, luca.moretti@seed.local, sara.romano@seed.local, ahmed.benali@seed.local, elena.carrieri@seed.local, marco.palmisano@seed.local, paolo.quaranta@seed.local");

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
