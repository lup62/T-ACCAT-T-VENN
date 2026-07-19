/**
 * HowItWorks.jsx
 *
 * Sezione "Come funziona" della home page: 3 step (cerca, proponi, collabora)
 * generati ciclando sull'array `steps` con il componente interno StepCard.
 */

import {
    Box,
    Typography,
    Stack,
    Card,
    CardContent,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LayersIcon from "@mui/icons-material/Layers";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Array di dati definito fuori dal componente: viene creato una volta sola
// al caricamento del file, non ad ogni render. Ogni oggetto rappresenta uno step.
// "color" è una stringa che MUI risolve nella palette del tema ("primary" o "secondary").
const steps = [
    {
        icon: <SearchIcon sx={{ fontSize: 28 }} />,
        title: "Cerca le opportunità",
        description:
            "Esplora annunci di lavoro agricolo oppure profili disponibili nella tua zona.",
        benefits: [
            "Ricerca per territorio",
            "Filtri per periodo e mansione",
            "Annunci adatti al tuo ruolo",
        ],
        color: "secondary",
    },
    {
        icon: <LayersIcon sx={{ fontSize: 28 }} />,
        title: "Invia una proposta",
        description:
            "Trova l'occasione più adatta e invia una proposta direttamente all'altra persona.",
        benefits: [
            "Messaggio di presentazione",
            "Gestione proposte inviate",
            "Accettazione o rifiuto chiari",
        ],
        color: "primary",
    },
    {
        icon: <ChatIcon sx={{ fontSize: 28 }} />,
        title: "Collabora in sicurezza",
        description:
            "Quando la proposta viene accettata organizzate il lavoro in chat, senza uscire dalla piattaforma; alla conclusione vi recensite a vicenda.",
        benefits: [
            "Chat privata in tempo reale",
            "Tutto dentro la piattaforma",
            "Recensioni reciproche a lavoro concluso",
        ],
        color: "secondary",
    },
];

// Componente interno: rappresenta una singola card dello step.
// Riceve tutte le informazioni come props, così il componente è riusabile
// e i dati restano separati dalla presentazione visiva.
function StepCard({ icon, title, description, benefits, color, step }) {
    return (
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

                {/* Header: icona colorata + numero dello step affiancati */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    {/* Box quadrato che funge da sfondo colorato per l'icona.
                        Il colore viene passato dinamicamente come stringa "primary.main"
                        o "secondary.main" che MUI risolve con la palette del tema. */}
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            bgcolor: `${color}.main`,
                            color: "#FFFFFF",
                            flexShrink: 0, // impedisce all'icona di restringersi se lo spazio è poco
                        }}
                    >
                        {icon}
                    </Box>

                    {/* Numero grande e sbiadito come decorazione visiva */}
                    <Typography
                        sx={{
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            color: "text.secondary",
                            lineHeight: 1,
                        }}
                    >
                        {step}
                    </Typography>
                </Stack>

                <Typography
                    variant="h4"
                    component="h3"
                    color={color}
                    sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2.125rem" } }}
                >
                    {title}
                </Typography>

                <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                    {description}
                </Typography>

                {/* Lista dei benefit: ogni riga è uno Stack orizzontale
                    con icona di spunta + testo */}
                <Stack spacing={1.5}>
                    {benefits.map((benefit) => (
                        <Stack
                            key={benefit}
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                        >
                            <CheckCircleIcon sx={{ fontSize: 18, color: `${color}.main` }} />
                            <Typography variant="body2" color="text.secondary">
                                {benefit}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}

// Componente principale esportato: contiene il titolo della sezione
// e genera le card ciclando sull'array "steps" con .map().
function HowItWorks() {
    return (
        // width: 100% basta per il full-bleed (vedi commento del hero in HomePage:
        // il vecchio trick 100vw causava scroll orizzontale).
        // id="come-funziona" è l'ancora a cui punta il link "Come funziona" in navbar.
        <Box
            component="section"
            id="come-funziona"
            sx={{
                width: "100%",
                py: { xs: 8, md: 12 },
                px: { xs: 3, md: 10 },
                bgcolor: "background.default", // sfondo beige per distinguere la sezione
            }}
        >
            <Box>

                {/* Come per "L'iniziativa": h3 scalato sotto md per non mandare
                    il badge su due righe su mobile. */}
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        display: "inline-block",
                        bgcolor: "primary.main",
                        color: "#FFFFFF",
                        px: { xs: 2, md: 3 },
                        py: 1,
                        borderRadius: 1,
                        fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
                    }}
                >
                    Come funziona
                </Typography>

                <Typography
                    variant="h6"
                    component="p"
                    sx={{
                        mt: 3,
                        maxWidth: 850,
                        color: "text.secondary",
                        lineHeight: 1.8,
                        fontSize: { xs: "1rem", md: "1.25rem" },
                    }}
                >
                    T&apos;accat &amp; T&apos;venn mette in contatto lavoratori
                    e imprenditori agricoli in pochi passaggi, valorizzando
                    le opportunità presenti sul territorio.
                </Typography>

                {/* Grid a 3 colonne su desktop, 1 colonna su mobile.
                    .map() genera una StepCard per ogni elemento di "steps",
                    passando index+1 come numero dello step (gli indici partono da 0). */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                        gap: 3,
                        mt: { xs: 5, md: 6 },
                    }}
                >
                    {steps.map((step, index) => (
                        <StepCard
                            key={step.title}
                            step={index + 1}
                            icon={step.icon}
                            title={step.title}
                            description={step.description}
                            benefits={step.benefits}
                            color={step.color}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

export default HowItWorks;
