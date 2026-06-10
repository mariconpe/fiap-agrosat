// Serviço de API — conecta no backend Spring Boot
// Se a API não estiver disponível, usa dados mockados para demo

import type { Propriedade, NdviResponse, Alerta, Sensor, Produtor } from "../types";

const BASE_URL = "http://localhost:8080/api";

async function fetchOrMock<T>(
  url: string,
  mock: T,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.log(`[mock] usando dados locais para ${url}`);
    return mock;
  }
}

// ---------------------------------------------------------------
// Propriedades
// ---------------------------------------------------------------

const MOCK_PROPRIEDADES: Propriedade[] = [
  {
    id: 1,
    nome: "Fazenda Esperança",
    localizacao: "Lat: -22.85, Long: -48.43 — Botucatu/SP",
    areaHectares: 120.5,
    cultura: "Soja",
    alertasAtivos: 2,
    criadoEm: new Date().toISOString(),
  },
];

export async function listarPropriedades(): Promise<Propriedade[]> {
  return fetchOrMock("/propriedades", MOCK_PROPRIEDADES);
}

// ---------------------------------------------------------------
// NDVI
// ---------------------------------------------------------------

const MOCK_NDVI: NdviResponse = {
  ndvi: 0.41,
  dataColeta: new Date().toISOString().split("T")[0],
  status: "ATENCAO",
};

export async function consultarNdvi(
  propriedadeId: number
): Promise<NdviResponse> {
  return fetchOrMock(`/propriedades/${propriedadeId}/ndvi`, MOCK_NDVI);
}

// ---------------------------------------------------------------
// Alertas
// ---------------------------------------------------------------

const MOCK_ALERTAS: Alerta[] = [
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

export async function listarAlertas(
  propriedadeId: number
): Promise<Alerta[]> {
  return fetchOrMock(
    `/propriedades/${propriedadeId}/alertas`,
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

// ---------------------------------------------------------------
// Sensores
// ---------------------------------------------------------------

const MOCK_SENSORES: Sensor[] = [
  {
    id: 1,
    tipo: "UMIDADE_SOLO",
    valor: 18.5,
    dataHora: new Date().toISOString(),
    propriedadeId: 1,
  },
  {
    id: 2,
    tipo: "UMIDADE_SOLO",
    valor: 24.1,
    dataHora: new Date().toISOString(),
    propriedadeId: 1,
  },
  {
    id: 3,
    tipo: "TEMPERATURA",
    valor: 32.5,
    dataHora: new Date().toISOString(),
    propriedadeId: 1,
  },
];

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
    if (email === MOCK_PRODUTOR_EMAIL && senha === MOCK_PRODUTOR_SENHA) {
      console.log("[mock] login aceito com conta de demonstração");
      return { ...MOCK_PRODUTOR };
    }

    throw new Error("credenciais_invalidas");
  }
}
