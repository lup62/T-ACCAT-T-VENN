// Geocoding tramite Nominatim (OpenStreetMap) — condiviso tra i form che
// devono trasformare un testo libero (es. "Bari (BA)") in coordinate GPS.
//
// Con addressdetails=1 Nominatim restituisce anche i dettagli amministrativi:
// da ISO3166-2-lvl6 (es. "IT-BA") ricaviamo la sigla della provincia, usata
// per completare automaticamente il luogo nel formato "Città (XX)".

export async function geocodificaLuogo(testo) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(testo)}&format=json&limit=1&countrycodes=it&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "it" } });
    const dati = await res.json();
    if (dati.length === 0) return null;

    const iso = dati[0].address?.["ISO3166-2-lvl6"] || "";
    const provincia = iso.startsWith("IT-") ? iso.slice(3) : null;

    return {
        lat: parseFloat(dati[0].lat),
        lng: parseFloat(dati[0].lon),
        provincia,
    };
}
