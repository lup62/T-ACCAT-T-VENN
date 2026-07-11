// Geocoding tramite Nominatim (OpenStreetMap) — condiviso tra i form che
// devono trasformare un testo libero (es. "Bari (BA)") in coordinate GPS.

export async function geocodificaLuogo(testo) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(testo)}&format=json&limit=1&countrycodes=it`;
    const res = await fetch(url, { headers: { "Accept-Language": "it" } });
    const dati = await res.json();
    if (dati.length === 0) return null;
    return { lat: parseFloat(dati[0].lat), lng: parseFloat(dati[0].lon) };
}
