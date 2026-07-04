// PrivacyPolicyPage.jsx — rotta: /privacy
// Testo statico dell'informativa privacy, definito in SEZIONI e renderizzato via .map().
import { Box, Divider, Typography } from "@mui/material";

const SEZIONI = [
    {
        titolo: "1. Titolare del trattamento",
        testo: `T'ACCAT & T'VENN è il titolare del trattamento dei dati personali raccolti attraverso questa piattaforma. Per qualsiasi richiesta relativa alla privacy puoi contattarci all'indirizzo email indicato nella sezione Contatti.`,
    },
    {
        titolo: "2. Dati raccolti",
        testo: `Raccogliamo i seguenti dati personali:
• Dati di registrazione: nome, cognome, data di nascita, indirizzo email, numero di telefono, indirizzo.
• Dati del profilo: ruolo (lavoratore o imprenditore), immagine profilo, competenze, curriculum vitae.
• Dati degli annunci: contenuto degli annunci pubblicati, posizione geografica indicata.
• Dati di navigazione: indirizzo IP, tipo di browser, pagine visitate (tramite log di sistema).`,
    },
    {
        titolo: "3. Finalità del trattamento",
        testo: `I dati vengono trattati per le seguenti finalità:
• Gestione dell'account e autenticazione.
• Pubblicazione e consultazione degli annunci agricoli.
• Comunicazione tra utenti tramite la funzione di chat.
• Miglioramento dei servizi offerti dalla piattaforma.
• Adempimento di obblighi legali.`,
    },
    {
        titolo: "4. Base giuridica",
        testo: `Il trattamento dei dati si basa sul contratto stipulato con l'utente al momento della registrazione (art. 6, par. 1, lett. b del GDPR) e, ove applicabile, sul consenso espresso dall'utente o sul legittimo interesse del titolare.`,
    },
    {
        titolo: "5. Condivisione dei dati",
        testo: `I dati degli utenti non vengono venduti a terzi. Le informazioni contenute negli annunci (titolo, descrizione, luogo, periodo, tipo di lavoro) sono visibili a tutti i visitatori della piattaforma. I dati personali dell'autore (nome, cognome) sono visibili agli utenti registrati che accedono al dettaglio dell'annuncio.`,
    },
    {
        titolo: "6. Conservazione dei dati",
        testo: `I dati vengono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti. In caso di cancellazione dell'account, i dati personali vengono eliminati entro 30 giorni, fatta eccezione per i dati che devono essere conservati per obbligo di legge.`,
    },
    {
        titolo: "7. Diritti dell'utente",
        testo: `Ai sensi del GDPR, ogni utente ha il diritto di:
• Accedere ai propri dati personali.
• Richiedere la rettifica di dati inesatti.
• Richiedere la cancellazione dei propri dati ("diritto all'oblio").
• Opporsi al trattamento o richiederne la limitazione.
• Richiedere la portabilità dei dati.
Per esercitare questi diritti, contattaci tramite email.`,
    },
    {
        titolo: "8. Cookie",
        testo: `La piattaforma utilizza cookie tecnici necessari al funzionamento del servizio (es. sessione di autenticazione). Non vengono utilizzati cookie di profilazione o di terze parti a scopo pubblicitario.`,
    },
    {
        titolo: "9. Modifiche alla privacy policy",
        testo: `Ci riserviamo il diritto di aggiornare questa informativa. Le modifiche rilevanti verranno comunicate agli utenti registrati tramite email o notifica in-app. L'uso continuato della piattaforma dopo le modifiche costituisce accettazione della nuova informativa.`,
    },
];

function PrivacyPolicyPage() {
    return (
        <Box sx={{ px: { xs: 3, md: 12 }, py: { xs: 4, md: 6 }, maxWidth: 860, mx: "auto" }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                Privacy Policy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Ultimo aggiornamento: gennaio 2026
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                La presente informativa descrive come T&apos;ACCAT &amp; T&apos;VENN raccoglie, utilizza e protegge i dati personali degli utenti, in conformità al Regolamento UE 2016/679 (GDPR) e alla normativa italiana vigente in materia di protezione dei dati.
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

export default PrivacyPolicyPage;
