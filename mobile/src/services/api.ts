// Serviço de API — conecta no backend Spring Boot
// Fallback para dados mockados somente quando o modo demo está habilitado.

import type { Propriedade, NdviResponse, Alerta, Sensor, Produtor } from "../types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/api";
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
export const DEMO_SCENARIO = process.env.EXPO_PUBLIC_DEMO_SCENARIO ?? "risco";
export let FONTE_DADOS: "API" | "DEMONSTRACAO" = "API";
type CenarioDemo = "risco" | "sem-risco" | "sem-dados" | "insuficiente" | "historico";
const cenarioAtual: CenarioDemo = (["risco", "sem-risco", "sem-dados", "insuficiente", "historico"] as string[]).includes(DEMO_SCENARIO)
  ? DEMO_SCENARIO as CenarioDemo : "risco";
const dataDemo = (diasAtras: number) => {
  const d = new Date(); d.setDate(d.getDate() - diasAtras); return d.toISOString().slice(0, 10);
};
const horaDemo = (minutosAtras: number) => new Date(Date.now() - minutosAtras * 60000).toISOString();

async function fetchOrMock<T>(
  url: string,
  mock: T,
  options?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (erro) {
    if (!DEMO_MODE) throw new Error("Não foi possível conectar à API AgroSat.", { cause: erro });
    FONTE_DADOS = "DEMONSTRACAO";
    console.log(`[mock] usando dados locais para ${url}`);
    return mock;
  }
  if (!res.ok) throw new Error(`Falha na API AgroSat: HTTP ${res.status}.`);
  FONTE_DADOS = "API";
  return await res.json() as T;
}

// ---------------------------------------------------------------
// Propriedades
// ---------------------------------------------------------------

const NOME_CENARIO: Record<CenarioDemo, string> = {
  risco: "Fazenda Esperança — risco ativo",
  "sem-risco": "Fazenda Modelo — sem risco",
  "sem-dados": "Fazenda Modelo — sem dados",
  insuficiente: "Fazenda Modelo — série insuficiente",
  historico: "Fazenda Modelo — alertas resolvidos",
};
const MOCK_PROPRIEDADES: Propriedade[] = [{
  id: 1, nome: NOME_CENARIO[cenarioAtual],
  localizacao: "Lat: -22.85, Long: -48.43 — Botucatu/SP",
  areaHectares: 120.5, cultura: "Soja",
  alertasAtivos: cenarioAtual === "risco" ? 2 : cenarioAtual === "historico" ? 1 : 0, criadoEm: new Date().toISOString(),
}];

export async function listarPropriedades(): Promise<Propriedade[]> {
  return fetchOrMock("/propriedades", MOCK_PROPRIEDADES);
}

// ---------------------------------------------------------------
// NDVI
// ---------------------------------------------------------------

const MOCK_NDVI: NdviResponse = cenarioAtual === "sem-dados"
  ? { ndvi: null, dataColeta: null, status: "SEM_DADOS" }
  : { ndvi: cenarioAtual === "sem-risco" || cenarioAtual === "historico" ? 0.635 : 0.41, dataColeta: dataDemo(0), status: cenarioAtual === "sem-risco" || cenarioAtual === "historico" ? "SAUDAVEL" : "ATENCAO" };

export async function consultarNdvi(
  propriedadeId: number
): Promise<NdviResponse> {
  return fetchOrMock(`/propriedades/${propriedadeId}/ndvi`, MOCK_NDVI);
}

// ---------------------------------------------------------------
// Alertas
// ---------------------------------------------------------------

const ALERTAS_RISCO: Alerta[] = [
  {
    id: 1,
    tipo: "SECA",
    severidade: "ALTA",
    mensagem:
      "Risco de seca — precipitação acumulada em 15 dias: 3.0 mm (limite: 10 mm). " +
      "Umidade do solo atual: 18.5% (limite: 20%).",
    lida: false,
    dataCriacao: new Date().toISOString(),
    propriedadeNome: "Fazenda Esperança",
  },
  {
    id: 2,
    tipo: "PRAGA",
    severidade: "MEDIA",
    mensagem:
      "Possível infestação — NDVI caiu de 0.580 para 0.410 " +
      "nos últimos 7 dias (queda de 0.170). Temperatura acima de 30°C detectada.",
    lida: false,
    dataCriacao: new Date().toISOString(),
    propriedadeNome: "Fazenda Esperança",
  },
];
const MOCK_ALERTAS: Alerta[] = cenarioAtual === "risco" ? ALERTAS_RISCO
  : cenarioAtual === "historico" ? [
    { ...ALERTAS_RISCO[0], id: 3, lida: true, resolvido: true },
    { ...ALERTAS_RISCO[1], id: 4, lida: false, resolvido: false },
  ] : [];

export async function listarAlertas(
  propriedadeId: number
): Promise<Alerta[]> {
  return fetchOrMock(
    `/alertas?propriedadeId=${propriedadeId}`,
    MOCK_ALERTAS
  );
}

export async function verificarRiscos(
  propriedadeId: number
): Promise<{ alertas: Alerta[] }> {
  return fetchOrMock(
    `/alertas/verificar?propriedadeId=${propriedadeId}`,
    { alertas: MOCK_ALERTAS },
    { method: "POST" }
  );
}

export interface Indicadores {
  umidadeAtual: number | null;
  chuvaAcumulada15Dias: number;
  temperaturaMaxima7Dias: number | null;
  estadoAmbiente: string;
}
export interface MedicaoNdvi { ndvi: number; dataColeta: string }
export async function consultarIndicadores(id: number): Promise<Indicadores> {
  const mock: Indicadores = cenarioAtual === "risco"
    ? { umidadeAtual: 18.5, chuvaAcumulada15Dias: 3, temperaturaMaxima7Dias: 32.5, estadoAmbiente: "ATENCAO" }
    : cenarioAtual === "sem-risco" || cenarioAtual === "historico"
      ? { umidadeAtual: 35, chuvaAcumulada15Dias: 18, temperaturaMaxima7Dias: 27, estadoAmbiente: "NORMAL" }
      : cenarioAtual === "insuficiente"
        ? { umidadeAtual: null, chuvaAcumulada15Dias: 0, temperaturaMaxima7Dias: 35, estadoAmbiente: "ATENCAO" }
        : { umidadeAtual: null, chuvaAcumulada15Dias: 0, temperaturaMaxima7Dias: null, estadoAmbiente: "SEM_DADOS" };
  return fetchOrMock(`/propriedades/${id}/indicadores`, mock);
}
export async function historicoNdvi(id: number): Promise<MedicaoNdvi[]> {
  const mock: MedicaoNdvi[] = cenarioAtual === "risco"
    ? [{ ndvi: 0.68, dataColeta: dataDemo(14) }, { ndvi: 0.58, dataColeta: dataDemo(6) }, { ndvi: 0.47, dataColeta: dataDemo(3) }, { ndvi: 0.41, dataColeta: dataDemo(0) }]
    : cenarioAtual === "sem-risco" || cenarioAtual === "historico"
      ? [{ ndvi: 0.64, dataColeta: dataDemo(3) }, { ndvi: 0.635, dataColeta: dataDemo(0) }]
      : cenarioAtual === "insuficiente" ? [{ ndvi: 0.4, dataColeta: dataDemo(0) }] : [];
  return fetchOrMock(`/propriedades/${id}/ndvi/historico`, mock);
}

export async function marcarAlertaComoLida(alertaId: number): Promise<Alerta> {
  const mock = { ...MOCK_ALERTAS[0], id: alertaId, lida: true };
  return fetchOrMock(`/alertas/${alertaId}/lida`, mock, { method: "PUT" });
}

// ---------------------------------------------------------------
// Sensores
// ---------------------------------------------------------------

const SENSORES_RISCO: Sensor[] = [
  {
    id: 1,
    tipo: "UMIDADE_SOLO",
    valor: 18.5,
    dataHora: horaDemo(10),
    propriedadeId: 1,
  },
  {
    id: 2,
    tipo: "UMIDADE_SOLO",
    valor: 24.1,
    dataHora: horaDemo(30),
    propriedadeId: 1,
  },
  {
    id: 3,
    tipo: "TEMPERATURA",
    valor: 32.5,
    dataHora: horaDemo(10),
    propriedadeId: 1,
  },
];
const MOCK_SENSORES: Sensor[] = cenarioAtual === "risco" ? SENSORES_RISCO
  : cenarioAtual === "sem-risco" || cenarioAtual === "historico" ? [{ id: 11, tipo: "UMIDADE_SOLO", valor: 35, dataHora: horaDemo(10), propriedadeId: 1 }]
    : [];

export async function listarSensores(
  propriedadeId: number
): Promise<Sensor[]> {
  return fetchOrMock(
    `/sensores?propriedadeId=${propriedadeId}`,
    MOCK_SENSORES
  );
}

// ---------------------------------------------------------------
// Autenticação
// ---------------------------------------------------------------

const MOCK_PRODUTOR_EMAIL = "joao@agrosat.com.br";
const MOCK_PRODUTOR_SENHA = "123456";

const MOCK_PRODUTOR: Produtor = {
  produtorId: 1,
  nome: "João da Silva",
  email: MOCK_PRODUTOR_EMAIL,
};

/**
 * Autentica o produtor.
 * - Tenta POST /auth/login no backend.
 * - Se a rede estiver indisponível, aplica fallback mock APENAS para
 *   joao@agrosat.com.br / 123456 — credenciais erradas lançam mesmo offline.
 * - 401 do servidor lança erro (não cai no mock).
 */
export async function login(email: string, senha: string): Promise<Produtor> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (res.status === 401) {
      throw new Error("credenciais_invalidas");
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json() as Produtor;
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError ||
      (err instanceof Error && err.message.startsWith("HTTP ") === false && err.message !== "credenciais_invalidas");

    if (!isNetworkError) {
      throw err;
    }

    // Fallback mock apenas para a conta de demonstração
    if (DEMO_MODE && email === MOCK_PRODUTOR_EMAIL && senha === MOCK_PRODUTOR_SENHA) {
      console.log("[mock] login aceito com conta de demonstração");
      return { ...MOCK_PRODUTOR };
    }

    throw new Error("credenciais_invalidas");
  }
}
