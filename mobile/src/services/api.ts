// Serviço de API — conecta no backend Spring Boot
// Se a API não estiver disponível, usa dados mockados para demo

import type { Propriedade, NdviResponse, Alerta, Sensor } from "../types";

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
