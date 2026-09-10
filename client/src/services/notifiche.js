const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

async function leggiJson(res) {
    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data.message ||
            "Errore durante la gestione delle notifiche."
        );
    }

    return data;
}

export async function getNotifiche(accessToken) {
    const res = await fetch(
        `${API_URL}/api/notifiche`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return leggiJson(res);
}

export async function segnaNotificaLetta(
    id,
    accessToken
) {
    const res = await fetch(
        `${API_URL}/api/notifiche/${id}/letta`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await leggiJson(res);

    return data.notifica;
}

export async function segnaTutteNotificheLette(
    accessToken
) {
    const res = await fetch(
        `${API_URL}/api/notifiche/leggi-tutte`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return leggiJson(res);
}

export async function eliminaNotifica(
    id,
    accessToken
) {
    const res = await fetch(
        `${API_URL}/api/notifiche/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await leggiJson(res);

    return data.notifica;
}
