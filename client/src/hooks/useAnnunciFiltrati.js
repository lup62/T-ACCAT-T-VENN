/**
 * useAnnunciFiltrati.js
 *
 * Hook condiviso tra AnnunciLavoroPage e AnnunciLavoratoriPage.
 * Centralizza tutta la logica di stato e calcolo che prima era
 * duplicata nelle due pagine: ricerca, filtri, ordinamento,
 * toggle lista/mappa e gestione dialog/drawer.
 *
 * Parametri:
 *   annunci — array degli annunci già filtrati per tipo (richiesta o disponibilità)
 *
 * Ritorna:
 *   - annunciFiltrati   — annunci dopo ricerca + filtri + ordinamento (lista completa)
 *   - annunciDaMostrare — annunciFiltrati limitati a ANNUNCI_VISIBILI se non loggati
 *   - tutto lo stato necessario alla UI (filtri, ricerca, ordinamento, ecc.)
 */

import { useState, useMemo } from "react";
import { FILTRI_INIZIALI, categoriaTipoLavoro } from "../pages/Annunci/annunciConstants";
import { useAuth } from "./useAuth";

const ANNUNCI_VISIBILI = 5;

function applicaOrdinamento(lista, ordinamento) {
    const copia = [...lista];
    switch (ordinamento) {
        case "recenti":    return copia.sort((a, b) => b.periodo.dataInizio.localeCompare(a.periodo.dataInizio));
        case "vecchi":     return copia.sort((a, b) => a.periodo.dataInizio.localeCompare(b.periodo.dataInizio));
        case "prezzoAsc":  return copia.sort((a, b) => {
            const aMin = a.prezzo.unita === "da_concordare" ? Infinity : a.prezzo.min;
            const bMin = b.prezzo.unita === "da_concordare" ? Infinity : b.prezzo.min;
            return aMin - bMin;
        });
        case "prezzoDesc": return copia.sort((a, b) => {
            const aMax = a.prezzo.unita === "da_concordare" ? -Infinity : a.prezzo.max;
            const bMax = b.prezzo.unita === "da_concordare" ? -Infinity : b.prezzo.max;
            return bMax - aMax;
        });
        default: return copia;
    }
}

function normalizzaData(valore) {
    return typeof valore === "string" ? valore.slice(0, 10) : "";
}

function applicaFiltri(lista, filtri) {
    // Un intervallo invertito non può rappresentare un periodo valido.
    if (
        filtri.periodoInizio &&
        filtri.periodoFine &&
        filtri.periodoFine < filtri.periodoInizio
    ) {
        return [];
    }

    return lista.filter((a) => {
        // Il confronto passa per la categoria: i tipiLavoro fuori lista
        // (dati vecchi a testo libero) ricadono in "Altro".
        if (filtri.tipiLavoro.length > 0 && !filtri.tipiLavoro.includes(categoriaTipoLavoro(a.tipoLavoro)))
            return false;

        if (filtri.province.length > 0) {
            // Sigla provincia da "Città (XX)", tollerante alle minuscole
            const match = a.luogo.testo.match(/\(([A-Za-z]{2})\)/);
            const prov = match ? match[1].toUpperCase() : "";
            if (!filtri.province.includes(prov)) return false;
        }

        // Gli annunci "da concordare" passano sempre il filtro prezzo (non hanno fascia)
        if (a.prezzo.unita !== "da_concordare" &&
            (a.prezzo.max < filtri.prezzoRange[0] || a.prezzo.min > filtri.prezzoRange[1]))
            return false;

        // L'API restituisce timestamp ISO, mentre gli input date usano YYYY-MM-DD.
        // Il confronto sulla sola data rende inclusivi entrambi gli estremi e
        // mantiene gli annunci che si sovrappongono al periodo selezionato.
        const dataInizio = normalizzaData(a.periodo?.dataInizio);
        const dataFine = normalizzaData(a.periodo?.dataFine);

        if (filtri.periodoInizio && dataFine < filtri.periodoInizio)
            return false;

        if (filtri.periodoFine && dataInizio > filtri.periodoFine)
            return false;

        return true;
    });
}

export function useAnnunciFiltrati(annunci) {
    const [filtri, setFiltri] = useState(FILTRI_INIZIALI);
    const [ricerca, setRicerca] = useState("");
    const [ordinamento, setOrdinamento] = useState("recenti");
    const [vistaLista, setVistaLista] = useState(true);
    const [filtriDrawerOpen, setFiltriDrawerOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { isLoggedIn } = useAuth();

    const annunciCercati = useMemo(() =>
        ricerca.trim() === ""
            ? annunci
            : annunci.filter((a) =>
                a.titolo.toLowerCase().includes(ricerca.toLowerCase()) ||
                a.descrizione.toLowerCase().includes(ricerca.toLowerCase())
            ),
        [annunci, ricerca]
    );

    const annunciFiltrati = useMemo(
        () => applicaOrdinamento(applicaFiltri(annunciCercati, filtri), ordinamento),
        [annunciCercati, filtri, ordinamento]
    );

    // Gli utenti non autenticati vedono solo i primi ANNUNCI_VISIBILI risultati
    const annunciDaMostrare = useMemo(
        () => isLoggedIn ? annunciFiltrati : annunciFiltrati.slice(0, ANNUNCI_VISIBILI),
        [annunciFiltrati, isLoggedIn]
    );

    // true se ci sono risultati nascosti dal limite (per mostrare il bottone "Vedi altri")
    const hasMore = !isLoggedIn && annunciFiltrati.length > ANNUNCI_VISIBILI;

    return {
        filtri, setFiltri,
        ricerca, setRicerca,
        ordinamento, setOrdinamento,
        vistaLista, setVistaLista,
        filtriDrawerOpen, setFiltriDrawerOpen,
        dialogOpen, setDialogOpen,
        isLoggedIn,
        annunciFiltrati,
        annunciDaMostrare,
        hasMore,
    };
}
