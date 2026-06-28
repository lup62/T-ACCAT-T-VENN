import { useState } from "react";
import { Box, Button, Chip, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function InputCompetenze({ valore, onChange }) {
    const [input, setInput] = useState("");

    const aggiungi = () => {
        const trimmed = input.trim();
        // Aggiunge solo se non vuoto e non già presente (case-insensitive)
        if (trimmed && !valore.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
            onChange([...valore, trimmed]);
        }
        setInput("");
    };

    const rimuovi = (competenza) => {
        onChange(valore.filter((c) => c !== competenza));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            aggiungi();
        }
    };

    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Es. Potatura, Guida trattore, Raccolta olive..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    variant="outlined"
                    onClick={aggiungi}
                    disabled={!input.trim()}
                    startIcon={<AddIcon />}
                    sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                    Aggiungi
                </Button>
            </Stack>

            {valore.length > 0 && (
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.5 }}>
                    {valore.map((c) => (
                        <Chip
                            key={c}
                            label={c}
                            onDelete={() => rimuovi(c)}
                            variant="outlined"
                            size="small"
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default InputCompetenze;
