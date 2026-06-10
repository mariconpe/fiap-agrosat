import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface AlertasContextValue {
  naoLidos: number;
  setNaoLidos: (contagem: number) => void;
}

const AlertasContext = createContext<AlertasContextValue | null>(null);

/** Provê a contagem de alertas nao lidos para a árvore de componentes. */
export function AlertasProvider({ children }: { children: ReactNode }) {
  const [naoLidos, setNaoLidosState] = useState(0);

  const setNaoLidos = useCallback((contagem: number) => {
    setNaoLidosState(contagem);
  }, []);

  return (
    <AlertasContext.Provider value={{ naoLidos, setNaoLidos }}>
      {children}
    </AlertasContext.Provider>
  );
}

/**
 * Hook para acessar e atualizar a contagem de alertas nao lidos.
 * Lança se usado fora do AlertasProvider.
 */
export const useAlertas = (): AlertasContextValue => {
  const ctx = useContext(AlertasContext);
  if (ctx === null) {
    throw new Error("useAlertas deve ser usado dentro de AlertasProvider");
  }
  return ctx;
};
