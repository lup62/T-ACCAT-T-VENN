function estraiProvincia(luogoTesto) {
    if (!luogoTesto || typeof luogoTesto !== "string") {
        return null;
    }

    const match = luogoTesto.match(/\(([A-Z]{2})\)/);

    return match ? match[1] : null;
}

function corrispondeTesto(annuncio, ricercaSalvata) {
    const testoRicerca = ricercaSalvata.ricerca
        ?.trim()
        .toLowerCase();

    if (!testoRicerca) {
        return true;
    }

    const titolo = annuncio.titolo?.toLowerCase() || "";
    const descrizione = annuncio.descrizione?.toLowerCase() || "";

    return (
        titolo.includes(testoRicerca) ||
        descrizione.includes(testoRicerca)
    );
}

function corrispondeTipoLavoro(annuncio, ricercaSalvata) {
    const tipiLavoro =
        ricercaSalvata.filtri?.tipiLavoro || [];

    if (tipiLavoro.length === 0) {
        return true;
    }

    return tipiLavoro.includes(annuncio.tipoLavoro);
}

function corrispondeProvincia(annuncio, ricercaSalvata) {
    const province =
        ricercaSalvata.filtri?.province || [];

    if (province.length === 0) {
        return true;
    }

    const provinciaAnnuncio = estraiProvincia(
        annuncio.luogo?.testo
    );

    if (!provinciaAnnuncio) {
        return false;
    }

    return province.includes(provinciaAnnuncio);
}

function corrispondePrezzo(annuncio, ricercaSalvata) {
    const prezzoRange =
        ricercaSalvata.filtri?.prezzoRange;

    if (
        !Array.isArray(prezzoRange) ||
        prezzoRange.length !== 2
    ) {
        return true;
    }

    if (annuncio.prezzo?.unita === "da_concordare") {
        return true;
    }

    const prezzoMin = annuncio.prezzo?.min;
    const prezzoMax = annuncio.prezzo?.max;

    if (
        prezzoMin === null ||
        prezzoMin === undefined ||
        prezzoMax === null ||
        prezzoMax === undefined
    ) {
        return false;
    }

    const [rangeMin, rangeMax] = prezzoRange;

    return (
        prezzoMax >= rangeMin &&
        prezzoMin <= rangeMax
    );
}

function corrispondePeriodo(annuncio, ricercaSalvata) {
    const periodoInizio =
        ricercaSalvata.filtri?.periodoInizio;

    const periodoFine =
        ricercaSalvata.filtri?.periodoFine;

    if (!periodoInizio && !periodoFine) {
        return true;
    }

    const dataInizioAnnuncio =
        annuncio.periodo?.dataInizio;

    const dataFineAnnuncio =
        annuncio.periodo?.dataFine;

    if (!dataInizioAnnuncio || !dataFineAnnuncio) {
        return false;
    }

    const inizioAnnuncio = new Date(dataInizioAnnuncio);
    const fineAnnuncio = new Date(dataFineAnnuncio);

    if (
        periodoInizio &&
        fineAnnuncio < new Date(periodoInizio)
    ) {
        return false;
    }

    if (
        periodoFine &&
        inizioAnnuncio > new Date(periodoFine)
    ) {
        return false;
    }

    return true;
}

function annuncioCorrispondeARicerca(
    annuncio,
    ricercaSalvata
) {
    if (
        annuncio.tipo !== ricercaSalvata.tipoAnnuncio
    ) {
        return false;
    }

    return (
        corrispondeTesto(annuncio, ricercaSalvata) &&
        corrispondeTipoLavoro(
            annuncio,
            ricercaSalvata
        ) &&
        corrispondeProvincia(
            annuncio,
            ricercaSalvata
        ) &&
        corrispondePrezzo(
            annuncio,
            ricercaSalvata
        ) &&
        corrispondePeriodo(
            annuncio,
            ricercaSalvata
        )
    );
}

module.exports = {
    annuncioCorrispondeARicerca,
    estraiProvincia,
};