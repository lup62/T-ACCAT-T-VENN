/**
 * MappaAnnunci.jsx
 *
 * Mappa interattiva degli annunci basata su react-leaflet + OpenStreetMap.
 * Viene mostrata al posto della griglia quando l'utente attiva la vista mappa.
 *
 * I marker vicini vengono raggruppati automaticamente in cluster (react-leaflet-cluster).
 * Il cluster mostra il conteggio e si espande al click o allo zoom.
 * Ogni singolo marker apre un popup con il riepilogo dell'annuncio
 * e un bottone per navigare alla pagina di dettaglio.
 *
 * Props:
 *   annunci   array di annunci da visualizzare (già filtrati dalla pagina padre)
 *   color     "primary" | "secondary" — colore del tema della pagina
 *
 * Requisiti nei dati:
 *   annuncio.luogo.lat  latitudine
 *   annuncio.luogo.lng  longitudine
 *
 * NOTA: il CSS di Leaflet viene importato qui per non inquinare il tema globale.
 */

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';

// Colori hex che corrispondono al tema MUI (primary e secondary)
const COLORI_TEMA = {
    primary: '#387347',
    secondary: '#69A62D',
};

// Centro geografico approssimativo della Puglia
const CENTRO_PUGLIA = [40.7, 17.1];
const ZOOM_INIZIALE = 8;

function svgToDataUri(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Marker singolo: cerchio colorato
function createMarkerIcon(hexColor) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="${hexColor}" stroke="white" stroke-width="2.5"/></svg>`;
    return L.divIcon({
        className: '',
        html: `<img src="${svgToDataUri(svg)}" width="16" height="16" />`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -12],
    });
}


function MappaAnnunci({ annunci, color = 'primary' }) {
    const navigate = useNavigate();
    const hexColor = COLORI_TEMA[color] ?? COLORI_TEMA.primary;
    const markerIcon = createMarkerIcon(hexColor);

    return (
        <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2, height: { xs: 450, md: '100%' } }}>
            <MapContainer
                center={CENTRO_PUGLIA}
                zoom={ZOOM_INIZIALE}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* MarkerClusterGroup raggruppa automaticamente i marker vicini.
                    Al click sul cluster la mappa fa zoom per mostrare i marker. */}
                <MarkerClusterGroup chunkedLoading>
                    {annunci.map((annuncio) => (
                        <Marker
                            key={annuncio.id}
                            position={[annuncio.luogo.lat, annuncio.luogo.lng]}
                            icon={markerIcon}
                        >
                            <Popup minWidth={200}>
                                <Chip
                                    label={annuncio.tipoLavoro}
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                    {annuncio.titolo}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{ mb: 1.5 }}
                                >
                                    {annuncio.luogo.testo}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color={color}
                                    fullWidth
                                    onClick={() => navigate(`/annunci/${annuncio.id}`)}
                                >
                                    Vedi dettagli
                                </Button>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </Box>
    );
}

export default MappaAnnunci;
