import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Produtor } from "../types";

interface SessionContextValue {
  produtor: Produtor | null;
  entrar: (produtor: Produtor) => void;
  sair: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Provê o estado de sessão autenticada para a árvore de componentes. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [produtor, setProdutor] = useState<Produtor | null>(null);

  const entrar = useCallback((novoProdutor: Produtor) => {
    setProdutor(novoProdutor);
  }, []);

  const sair = useCallback(() => {
    setProdutor(null);
  }, []);

  return (
    <SessionContext.Provider value={{ produtor, entrar, sair }}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook para acessar a sessão autenticada.
 * Lança se usado fora do SessionProvider.
 */
export const useSession = (): SessionContextValue => {
  const ctx = useContext(SessionContext);
  if (ctx === null) {
    throw new Error("useSession deve ser usado dentro de SessionProvider");
  }
  return ctx;
};
