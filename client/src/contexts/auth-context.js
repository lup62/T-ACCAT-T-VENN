import { createContext } from "react";

// Separato dal provider per mantenere compatibile il modulo JSX con Fast Refresh.
export const AuthContext = createContext(null);
