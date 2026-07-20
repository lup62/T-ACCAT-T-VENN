/**
 * ScrollToTop.jsx — riporta la finestra in cima ad ogni cambio di pagina.
 *
 * In una SPA React Router non tocca lo scroll: navigando da una pagina
 * scrollata (es. lista annunci) a un'altra si atterrerebbe a metà pagina.
 * Non renderizza nulla: va montato una volta dentro il router.
 *
 * Se l'URL ha un hash (es. /#come-funziona) non fa niente: a scorrere
 * fino all'ancora ci pensa la pagina di destinazione.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) return;
        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
}

export default ScrollToTop;
