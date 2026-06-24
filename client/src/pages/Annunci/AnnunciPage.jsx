import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
    Button,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EuroIcon from "@mui/icons-material/Euro";

// Dati mock: in futuro verranno sostituiti con chiamate API
const richiesteLavoratori = [
    {
        id: 1,
        titolo: "Raccolta olive — Masseria San Marco",
        tipoLavoro: "Olivicoltura",
        luogo: "Fasano (BR)",
        periodo: "Ott – Nov 2026",
        prezzo: "80 €/giorno",
        profilo: { nome: "Giovanni Greco", avatar: null },
    },
    {
        id: 2,
        titolo: "Potatura vigneto stagionale",
        tipoLavoro: "Viticoltura",
        luogo: "Locorotondo (BA)",
        periodo: "Feb – Mar 2026",
        prezzo: "75 €/giorno",
        profilo: { nome: "Azienda Vitivinicola Lama", avatar: null },
    },
    {
        id: 3,
        titolo: "Raccolta pomodori — Cooperativa Valle",
        tipoLavoro: "Orticoltura",
        luogo: "Castellaneta (TA)",
        periodo: "Lug – Set 2026",
        prezzo: "70 €/giorno",
        profilo: { nome: "Cooperativa Valle Verde", avatar: null },
    },
];

const disponibilitaLavoratori = [
    {
        id: 4,
        titolo: "Disponibile per lavori agricoli generali",
        tipoLavoro: "Generico",
        luogo: "Taranto (TA)",
        periodo: "Tutto l'anno",
        prezzo: "Su accordo",
        profilo: { nome: "Marco Esposito", avatar: null },
    },
    {
        id: 5,
        titolo: "Esperto in potatura e innesto",
        tipoLavoro: "Frutticoltura",
        luogo: "Bari (BA)",
        periodo: "Mar – Mag 2026",
        prezzo: "90 €/giorno",
        profilo: { nome: "Salvatore Rizzo", avatar: null },
    },
    {
        id: 6,
        titolo: "Cura e irrigazione orto biologico",
        tipoLavoro: "Orticoltura",
        luogo: "Lecce (LE)",
        periodo: "Apr – Giu 2026",
        prezzo: "65 €/giorno",
        profilo: { nome: "Anna Convertino", avatar: null },
    },
];

function AnnuncioCard({ titolo, tipoLavoro, luogo, periodo, prezzo, color, profilo }) {
    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 7,
                },
            }}
        >
            <CardContent
                sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                }}
            >
                <Chip
                    label={tipoLavoro}
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: "flex-start", mb: 2 }}
                />

                <Typography variant="h5" component="h3" sx={{ mb: 3 }}>
                    {titolo}
                </Typography>

                <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon sx={{ fontSize: 20, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">{luogo}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarMonthIcon sx={{ fontSize: 20, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">{periodo}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <EuroIcon sx={{ fontSize: 20, color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">{prezzo}</Typography>
                    </Stack>
                </Stack>

                {/* Linea divisoria prima del profilo */}
                <Divider sx={{ mb: 2 }} />

                {/* Profilo: avatar + nome di chi ha pubblicato l'annuncio */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar
                        src={profilo.avatar}
                        alt={profilo.nome}
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: `${color}.main`,
                            fontSize: "0.85rem",
                        }}
                    >
                        {/* Se non c'è foto, mostra le iniziali del nome */}
                        {profilo.nome.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                        {profilo.nome}
                    </Typography>
                </Stack>

                <Box sx={{ mt: "auto" }}>
                    <Button variant="outlined" color={color} fullWidth>
                        Visualizza dettagli
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

function SezioneAnnunci({ titolo, annunci, color }) {
    return (
        <Box component="section" sx={{ mb: { xs: 6, md: 10 } }}>
            <Typography
                variant="h3"
                component="h2"
                sx={{
                    display: "inline-block",
                    bgcolor: `${color}.main`,
                    color: "#FFFFFF",
                    px: 3,
                    py: 1,
                    borderRadius: 1,
                    mb: 4,
                }}
            >
                {titolo}
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                    },
                    gap: 3,
                }}
            >
                {annunci.map((annuncio) => (
                    <AnnuncioCard
                        key={annuncio.id}
                        titolo={annuncio.titolo}
                        tipoLavoro={annuncio.tipoLavoro}
                        luogo={annuncio.luogo}
                        periodo={annuncio.periodo}
                        prezzo={annuncio.prezzo}
                        profilo={annuncio.profilo}
                        color={color}
                    />
                ))}
            </Box>
        </Box>
    );
}

function AnnunciPage() {
    return (
        <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 4, md: 6 } }}>
            <SezioneAnnunci
                titolo="Chi cerca lavoratori"
                annunci={richiesteLavoratori}
                color="primary"
            />

            <SezioneAnnunci
                titolo="Chi cerca lavoro"
                annunci={disponibilitaLavoratori}
                color="secondary"
            />
        </Box>
    );
}

export default AnnunciPage;
