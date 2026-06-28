import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography } from "@mui/material";

// Centro Puglia, coerente con il resto dell'app (vedi MappaAnnunci.jsx)
const CENTRO_PUGLIA = [40.7, 17.1];
const ZOOM_INIZIALE = 8;

function creaMarkerIcon() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#387347" stroke="white" stroke-width="3"/></svg>`;
    const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return L.divIcon({
        className: "",
        html: `<img src="${uri}" width="24" height="24" />`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

// Componente interno: deve stare dentro MapContainer per usare useMapEvents
function GestoreClick({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function SelettorePosizioneMappa({ posizione, onPosizioneCambiata, error }) {
    const markerIcon = creaMarkerIcon();

    return (
        <Box>
            <Box
                sx={{
                    height: { xs: 240, md: 300 },
                    borderRadius: 3,
                    overflow: "hidden",
                    // Bordo rosso se c'è un errore di validazione
                    boxShadow: error ? "0 0 0 2px #BF6565" : 2,
                    cursor: "crosshair",
                }}
            >
                <MapContainer
                    center={CENTRO_PUGLIA}
                    zoom={ZOOM_INIZIALE}
                    style={{ width: "100%", height: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <GestoreClick onMapClick={onPosizioneCambiata} />
                    {posizione && (
                        <Marker
                            position={[posizione.lat, posizione.lng]}
                            icon={markerIcon}
                        />
                    )}
                </MapContainer>
            </Box>

            <Typography
                variant="caption"
                color={error ? "error" : "text.secondary"}
                sx={{ mt: 0.75, display: "block" }}
            >
                {posizione
                    ? `Posizione selezionata: lat ${posizione.lat.toFixed(5)}, lng ${posizione.lng.toFixed(5)}`
                    : error
                    ? error
                    : "Clicca sulla mappa per selezionare la posizione dell'annuncio"}
            </Typography>
        </Box>
    );
}

export default SelettorePosizioneMappa;
