// Tipos usados nas telas do AgroSat

export interface Propriedade {
  id: number;
  nome: string;
  localizacao: string;
  areaHectares: number;
  cultura: string | null;
  alertasAtivos: number;
  criadoEm: string;
}

export interface NdviResponse {
  ndvi: number | null;
  dataColeta: string | null;
  status: "SAUDAVEL" | "ATENCAO" | "CRITICO" | "SEM_DADOS";
}

export interface Alerta {
  id: number;
  tipo: "SECA" | "PRAGA";
  severidade: "BAIXA" | "MEDIA" | "ALTA";
  mensagem: string;
  lida: boolean;
  dataCriacao: string;
  propriedadeNome: string;
}

export interface Sensor {
  id: number;
  tipo: string;
  valor: number;
  dataHora: string;
  propriedadeId: number;
}
