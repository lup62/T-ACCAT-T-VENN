// annunciConstants.js — stato iniziale condiviso del pannello filtri (FiltriAnnunci.jsx).

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
