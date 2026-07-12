// annunciConstants.js — costanti condivise di annunci e filtri
// (FiltriAnnunci.jsx, PubblicaAnnuncioPage.jsx, useAnnunciFiltrati.js).

// Categorie fisse per il tipo di lavoro: stesso vocabolario nel form di
// pubblicazione (Select) e nel pannello filtri, così ogni annuncio ricade
// in una categoria nota e non nascono filtri duplicati per grafie diverse.
export const TIPI_LAVORO = [
    "Olivicoltura",
    "Viticoltura",
    "Frutticoltura",
    "Orticoltura",
    "Cerealicoltura",
    "Apicoltura",
    "Zootecnia",
    "Altro",
];

// Riconduce il tipoLavoro di un annuncio a una categoria della lista:
// i valori scritti a mano libera prima della lista fissa ricadono in "Altro".
export function categoriaTipoLavoro(tipoLavoro) {
    return TIPI_LAVORO.includes(tipoLavoro) ? tipoLavoro : "Altro";
}

// Province pugliesi: lista fissa per il filtro provincia. Il valore filtrato
// è il codice, che viene confrontato con la sigla in "Città (XX)" del luogo.
export const PROVINCE_PUGLIA = [
    { codice: "BA", nome: "Bari" },
    { codice: "BT", nome: "Barletta-Andria-Trani" },
    { codice: "BR", nome: "Brindisi" },
    { codice: "FG", nome: "Foggia" },
    { codice: "LE", nome: "Lecce" },
    { codice: "TA", nome: "Taranto" },
];

export const FILTRI_INIZIALI = {
    tipiLavoro: [],
    province: [],
    prezzoRange: [0, 200],
    stati: [],
    periodoInizio: "",
    periodoFine: "",
};
