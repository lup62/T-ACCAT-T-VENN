/**
 * mockAnnunci.js
 *
 * Dati fittizi degli annunci agricoli usati dal frontend finché non sarà
 * disponibile una API reale. Tutti i componenti che mostrano annunci
 * importano da qui — niente array locali nelle pagine.
 *
 * Ogni annuncio ha due possibili valori di `tipo`:
 *   - "disponibilita_lavoro"  → un lavoratore che si propone
 *                               mostrato nella pagina /annunci/cercasi
 *   - "richiesta_manodopera"  → un datore di lavoro che cerca persone
 *                               mostrato nella pagina /annunci/offerte
 *
 * ATTENZIONE: la corrispondenza tipo → rotta sembra invertita,
 * ma è corretta: /annunci/offerte mostra le OFFERTE DI LAVORO dei datori,
 * ovvero le "richieste_manodopera".
 *
 * Struttura di ogni annuncio:
 *   id                        numero univoco
 *   tipo                      "disponibilita_lavoro" | "richiesta_manodopera"
 *   titolo                    testo breve mostrato nella card
 *   descrizione               testo lungo mostrato nel dettaglio
 *   autore.nome               nome del lavoratore o dell'azienda
 *   autore.ruolo              ruolo/qualifica dell'autore
 *   luogo.testo               città e provincia (solo testo, niente coordinate)
 *   periodo.dataInizio        data ISO "YYYY-MM-DD"
 *   periodo.dataFine          data ISO "YYYY-MM-DD"
 *   tipoLavoro                categoria agricola (es. "Olivicoltura")
 *   competenze                array di stringhe, mostrate come chip
 *   prezzo.min / .max         fascia retributiva giornaliera
 *   prezzo.unita              es. "€/giorno"
 *   stato                     "attivo" | "chiuso"
 *   numeroLavoratoriRichiesti (solo richiesta_manodopera) quante persone servono
 */

// disponibilita_lavoro  → lavoratori che si propongono  → /annunci/cercasi
// richiesta_manodopera  → datori che offrono impiego    → /annunci/offerte
export const mockAnnunci = [
    {
        id: 1,
        tipo: 'disponibilita_lavoro',
        titolo: 'Disponibile per lavori agricoli generali',
        descrizione: 'Agricoltore con esperienza pluriennale in colture cerealicole e orticole. Disponibile per lavori stagionali o continuativi presso aziende agricole della provincia di Taranto. Flessibile su orari e mansioni, titolare di patentino per guida di trattori e macchine operatrici.',
        autore: { nome: 'Marco Esposito', ruolo: 'Lavoratore agricolo' },
        luogo: { testo: 'Taranto (TA)', lat: 40.4668, lng: 17.2470 },
        periodo: { dataInizio: '2026-01-01', dataFine: '2026-12-31' },
        tipoLavoro: 'Generico',
        competenze: ['Cerealicoltura', 'Orticoltura', 'Guida trattori'],
        prezzo: { min: 60, max: 80, unita: '€/giorno' },
        stato: 'attivo',
    },
    {
        id: 2,
        tipo: 'disponibilita_lavoro',
        titolo: 'Esperto in potatura e innesto',
        descrizione: 'Tecnico specializzato in potatura di fruttiferi e innesto a gemma e a spacco. Esperienza ventennale in frutteti di mele, pere e ciliegie. Disponibile per trasferte in tutta la Puglia e Basilicata, con attrezzatura propria.',
        autore: { nome: 'Salvatore Rizzo', ruolo: 'Tecnico frutticolo' },
        luogo: { testo: 'Bari (BA)', lat: 41.1171, lng: 16.8719 },
        periodo: { dataInizio: '2026-03-01', dataFine: '2026-05-31' },
        tipoLavoro: 'Frutticoltura',
        competenze: ['Potatura', 'Innesto a gemma', 'Difesa fitosanitaria'],
        prezzo: { min: 85, max: 95, unita: '€/giorno' },
        stato: 'attivo',
    },
    {
        id: 3,
        tipo: 'disponibilita_lavoro',
        titolo: 'Cura e irrigazione orto biologico',
        descrizione: "Agronoma specializzata in orticultura biologica. Offro servizi di gestione completa di orti e serre, dalla semina al raccolto, con tecniche a basso impatto ambientale. Certificazione biologica in corso, esperienza con disciplinari regionali.",
        autore: { nome: 'Anna Convertino', ruolo: 'Agronoma' },
        luogo: { testo: 'Lecce (LE)', lat: 40.3516, lng: 18.1750 },
        periodo: { dataInizio: '2026-04-01', dataFine: '2026-06-30' },
        tipoLavoro: 'Orticoltura',
        competenze: ['Orticoltura biologica', 'Irrigazione a goccia', 'Compostaggio'],
        prezzo: { min: 60, max: 70, unita: '€/giorno' },
        stato: 'attivo',
    },
    {
        id: 4,
        tipo: 'richiesta_manodopera',
        titolo: 'Raccolta olive — Masseria San Marco',
        descrizione: "Cerchiamo manodopera qualificata per la raccolta delle olive nella nostra masseria. Si richiede esperienza nell'uso di agevolatori meccanici e attitudine al lavoro in team. Vitto e alloggio inclusi per tutta la durata della campagna.",
        autore: { nome: 'Giovanni Greco', ruolo: 'Titolare Masseria San Marco' },
        luogo: { testo: 'Fasano (BR)', lat: 40.8372, lng: 17.3600 },
        periodo: { dataInizio: '2026-10-01', dataFine: '2026-11-30' },
        tipoLavoro: 'Olivicoltura',
        competenze: ['Raccolta a mano', 'Agevolatori meccanici', 'Stoccaggio olive'],
        prezzo: { min: 75, max: 85, unita: '€/giorno' },
        stato: 'attivo',
        numeroLavoratoriRichiesti: 6,
    },
    {
        id: 5,
        tipo: 'richiesta_manodopera',
        titolo: 'Potatura vigneto stagionale',
        descrizione: 'Azienda vitivinicola cerca potatori esperti per la potatura invernale del vigneto su oltre 20 ettari. Preferibile esperienza con sistemi di allevamento a Guyot e cordone speronato. Contratto stagionale con possibilità di rinnovo.',
        autore: { nome: 'Azienda Vitivinicola Lama', ruolo: 'Azienda agricola' },
        luogo: { testo: 'Locorotondo (BA)', lat: 40.7545, lng: 17.3261 },
        periodo: { dataInizio: '2026-02-01', dataFine: '2026-03-31' },
        tipoLavoro: 'Viticoltura',
        competenze: ['Potatura vite', 'Sistema Guyot', 'Cordone speronato'],
        prezzo: { min: 70, max: 80, unita: '€/giorno' },
        stato: 'attivo',
        numeroLavoratoriRichiesti: 4,
    },
    {
        id: 6,
        tipo: 'richiesta_manodopera',
        titolo: 'Raccolta pomodori — Cooperativa Valle',
        descrizione: 'La nostra cooperativa cerca raccoglitori stagionali per il pomodoro da industria. Forniti alloggio e trasporto dal comune di Castellaneta. Contratto regolare CCNL settore agricolo, pagamento settimanale.',
        autore: { nome: 'Cooperativa Valle Verde', ruolo: 'Cooperativa agricola' },
        luogo: { testo: 'Castellaneta (TA)', lat: 40.6325, lng: 16.9378 },
        periodo: { dataInizio: '2026-07-01', dataFine: '2026-09-30' },
        tipoLavoro: 'Orticoltura',
        competenze: ['Raccolta manuale', 'Macchina raccoglitrice', 'Selezione prodotto'],
        prezzo: { min: 65, max: 75, unita: '€/giorno' },
        stato: 'attivo',
        numeroLavoratoriRichiesti: 10,
    },
];
