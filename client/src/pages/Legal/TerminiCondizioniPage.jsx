// TerminiCondizioniPage.jsx — rotta: /termini
// Testo statico dei termini e condizioni, definito in SEZIONI e renderizzato via .map().
import { Box, Divider, Typography } from "@mui/material";

const SEZIONI = [
    {
        titolo: "1. Descrizione del servizio",
        testo: `T'ACCAT & T'VENN è una piattaforma digitale che mette in contatto lavoratori agricoli e imprenditori del settore agricolo. La piattaforma consente di pubblicare e consultare annunci di disponibilità lavorativa e di ricerca di manodopera, nonché di comunicare tramite una funzione di messaggistica interna.`,
    },
    {
        titolo: "2. Accettazione dei termini",
        testo: `Registrandosi e utilizzando la piattaforma, l'utente dichiara di aver letto, compreso e accettato integralmente i presenti Termini e Condizioni. Chi non accetta tali termini non è autorizzato a utilizzare il servizio.`,
    },
    {
        titolo: "3. Requisiti di accesso",
        testo: `Per registrarsi è necessario:
• Essere maggiorenni (18 anni compiuti).
• Fornire dati veritieri e aggiornati in fase di registrazione.
• Disporre di un indirizzo email valido e attivo.

La piattaforma è destinata esclusivamente a utenti che operano nel settore agricolo, come lavoratori stagionali, tecnici agricoli, imprenditori e cooperative.`,
    },
    {
        titolo: "4. Obblighi dell'utente",
        testo: `L'utente si impegna a:
• Non pubblicare annunci falsi, fuorvianti o con contenuti inappropriati.
• Non utilizzare la piattaforma per attività illecite o contrarie all'ordine pubblico.
• Non violare i diritti di altri utenti o di terzi.
• Non tentare di accedere in modo non autorizzato ad aree riservate della piattaforma.
• Rispettare le norme vigenti in materia di lavoro, privacy e sicurezza.`,
    },
    {
        titolo: "5. Contenuti pubblicati",
        testo: `L'utente è l'unico responsabile dei contenuti che pubblica sulla piattaforma (annunci, messaggi, informazioni del profilo). T'ACCAT & T'VENN non verifica preventivamente i contenuti pubblicati, ma si riserva il diritto di rimuovere qualsiasi contenuto che violi i presenti Termini o la normativa applicabile, senza preavviso.`,
    },
    {
        titolo: "6. Limitazione di responsabilità",
        testo: `T'ACCAT & T'VENN agisce esclusivamente come intermediario tra lavoratori e imprenditori. La piattaforma:
• Non è parte dei rapporti di lavoro che si instaurano tra gli utenti.
• Non garantisce l'autenticità o la correttezza degli annunci pubblicati.
• Non risponde di eventuali danni derivanti da accordi conclusi tra utenti.
• Non garantisce la continuità del servizio, potendo sospenderlo per manutenzione o cause tecniche.`,
    },
    {
        titolo: "7. Proprietà intellettuale",
        testo: `Il logo, il nome, il design e i contenuti originali della piattaforma sono di proprietà di T'ACCAT & T'VENN e sono protetti dalle leggi sul diritto d'autore. È vietata la riproduzione, distribuzione o utilizzo commerciale di tali elementi senza autorizzazione scritta.`,
    },
    {
        titolo: "8. Sospensione e cancellazione dell'account",
        testo: `Ci riserviamo il diritto di sospendere o cancellare l'account di un utente in caso di:
• Violazione dei presenti Termini e Condizioni.
• Utilizzo fraudolento o abusivo della piattaforma.
• Segnalazioni ripetute da parte di altri utenti.

L'utente può in qualsiasi momento richiedere la cancellazione del proprio account contattandoci via email.`,
    },
    {
        titolo: "9. Legge applicabile e foro competente",
        testo: `I presenti Termini e Condizioni sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall'utilizzo della piattaforma, le parti accettano la competenza esclusiva del Tribunale di Bari.`,
    },
    {
        titolo: "10. Modifiche ai termini",
        testo: `Ci riserviamo il diritto di modificare i presenti Termini e Condizioni in qualsiasi momento. Le modifiche entrano in vigore dalla data di pubblicazione. Gli utenti registrati verranno notificati via email. L'uso continuato del servizio dopo la notifica costituisce accettazione delle modifiche.`,
    },
];

function TerminiCondizioniPage() {
    return (
        <Box sx={{ px: { xs: 3, md: 12 }, py: { xs: 4, md: 6 }, maxWidth: 860, mx: "auto" }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                Termini e Condizioni
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Ultimo aggiornamento: gennaio 2026
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                I seguenti Termini e Condizioni regolano l&apos;accesso e l&apos;utilizzo della piattaforma T&apos;ACCAT &amp; T&apos;VENN. Si prega di leggerli attentamente prima di utilizzare il servizio.
            </Typography>

            {SEZIONI.map((s) => (
                <Box key={s.titolo} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1.5 }}>
                        {s.titolo}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                        {s.testo}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

export default TerminiCondizioniPage;
