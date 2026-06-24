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
            "Comunica in chat, organizza il lavoro e lascia una recensione al termine.",
        benefits: [
            "Chat privata tra utenti",
            "Contatti sbloccati dopo l'accordo",
            "Recensioni reciproche",
        ],
        color: "secondary",
    },
];

function StepCard({ icon, title, description, benefits, color, step }) {
    return (
        <Card
            sx={{
                flex: 1,
                borderRadius: 3,
                boxShadow: 3,
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
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
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>

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
                    sx={{ mb: 2 }}
                >
                    {title}
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, mb: 3 }}
                >
                    {description}
                </Typography>

                <Stack spacing={1.5}>
                    {benefits.map((benefit) => (
                        <Stack
                            key={benefit}
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                        >
                            <CheckCircleIcon
                                sx={{ fontSize: 18, color: `${color}.main` }}
                            />
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

function HowItWorks() {
    return (
        <Box
            component="section"
            id="come-funziona"
            sx={{
                width: "100vw",
                position: "relative",
                left: "50%",
                marginLeft: "-50vw",
                py: { xs: 8, md: 12 },
                px: { xs: 3, md: 10 },
                bgcolor: "background.default",
            }}
        >
            <Box>
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        display: "inline-block",
                        bgcolor: "primary.main",
                        color: "#FFFFFF",
                        px: 3,
                        py: 1,
                        borderRadius: 1,
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
                    }}
                >
                    T&apos;accat &amp; T&apos;venn mette in contatto lavoratori
                    e imprenditori agricoli in pochi passaggi, valorizzando
                    le opportunità presenti sul territorio.
                </Typography>

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
