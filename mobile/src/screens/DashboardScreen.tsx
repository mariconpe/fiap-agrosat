import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { listarPropriedades, consultarNdvi } from "../services/api";
import type { Propriedade, NdviResponse } from "../types";

export default function DashboardScreen() {
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [ndvi, setNdvi] = useState<NdviResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  async function carregarDados() {
    const props = await listarPropriedades();
    if (props.length > 0) {
      setPropriedade(props[0]);
      const ndviData = await consultarNdvi(props[0].id);
      setNdvi(ndviData);
    }
    setCarregando(false);
    setRecarregando(false);
  }

  useEffect(() => { carregarDados(); }, []);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.carregando}>Carregando...</Text>
      </View>
    );
  }

  function corNDVI(): string {
    if (!ndvi || ndvi.status === "SEM_DADOS") return "#9E9E9E";
    if (ndvi.status === "SAUDAVEL") return "#4CAF50";
    if (ndvi.status === "ATENCAO") return "#FF9800";
    return "#F44336";
  }

  function labelNDVI(): string {
    if (!ndvi || ndvi.status === "SEM_DADOS") return "Sem dados";
    if (ndvi.status === "SAUDAVEL") return "Saudável";
    if (ndvi.status === "ATENCAO") return "Atenção";
    return "Crítico";
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={recarregando} onRefresh={() => {
          setRecarregando(true); carregarDados();
        }} />
      }
    >
      {/* cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.titulo}>🌾 AgroSat</Text>
        <Text style={styles.subtitulo}>
          {propriedade?.nome ?? "—"}
        </Text>
        <Text style={styles.local}>
          {propriedade?.localizacao ?? "—"}
        </Text>
        {propriedade && (
          <View style={styles.badgeRow}>
            <Badge label={propriedade.cultura ?? "—"} cor="#E8F5E9" />
            <Badge
              label={`${propriedade.alertasAtivos} alertas`}
              cor={propriedade.alertasAtivos > 0 ? "#FFEBEE" : "#E8F5E9"}
            />
          </View>
        )}
      </View>

      {/* cartão NDVI */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>📊 NDVI — Índice de Vegetação</Text>
        <View style={[styles.ndviCirculo, { backgroundColor: corNDVI() }]}>
          <Text style={styles.ndviValor}>
            {ndvi?.ndvi != null ? ndvi.ndvi.toFixed(3) : "—"}
          </Text>
          <Text style={styles.ndviLabel}>{labelNDVI()}</Text>
        </View>
        {ndvi?.dataColeta && (
          <Text style={styles.dataColeta}>
            Coleta: {new Date(ndvi.dataColeta + "T00:00:00").toLocaleDateString("pt-BR")}
          </Text>
        )}
      </View>

      {/* indicadores rápidos */}
      <View style={styles.indicadores}>
        <Indicador
          icone="🌡️"
          titulo="Temp. Máx"
          valor="32°C"
          status="alto"
        />
        <Indicador
          icone="💧"
          titulo="Umidade Solo"
          valor="18.5%"
          status="critico"
        />
        <Indicador
          icone="🌧️"
          titulo="Chuva 15d"
          valor="3 mm"
          status="critico"
        />
      </View>

      {/* resumo */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>📋 Resumo</Text>
        <Text style={styles.resumoTexto}>
          {propriedade?.areaHectares} hectares • Cultura: {propriedade?.cultura ?? "—"}
          {"\n\n"}O NDVI está em <Text style={{ fontWeight: "bold" }}>
          {ndvi?.ndvi?.toFixed(3) ?? "—"}</Text>, classificado como{" "}
          <Text style={{ fontWeight: "bold", color: corNDVI() }}>
            {labelNDVI().toLowerCase()}
          </Text>.{" "}
          {propriedade && propriedade.alertasAtivos > 0
            ? `Há ${propriedade.alertasAtivos} alertas ativos para esta propriedade.`
            : "Nenhum alerta ativo no momento."}
        </Text>
      </View>
    </ScrollView>
  );
}

// ----- componentes auxiliares -----

function Badge({ label, cor }: { label: string; cor: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: cor }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function Indicador({
  icone,
  titulo,
  valor,
  status,
}: {
  icone: string;
  titulo: string;
  valor: string;
  status: "normal" | "alto" | "critico";
}) {
  const borda =
    status === "critico" ? "#F44336" : status === "alto" ? "#FF9800" : "#4CAF50";
  return (
    <View style={[styles.indicador, { borderLeftColor: borda }]}>
      <Text style={styles.indicadorIcone}>{icone}</Text>
      <Text style={styles.indicadorTitulo}>{titulo}</Text>
      <Text style={[styles.indicadorValor, { color: borda }]}>{valor}</Text>
    </View>
  );
}

// ----- estilos -----

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  centro: { flex: 1, justifyContent: "center", alignItems: "center" },
  carregando: { marginTop: 12, color: "#666", fontSize: 14 },
  header: { backgroundColor: "#2E7D32", padding: 24, paddingTop: 48 },
  titulo: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  subtitulo: { color: "#C8E6C9", fontSize: 18, marginTop: 4 },
  local: { color: "#A5D6A7", fontSize: 13, marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: "#FFF",
    margin: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  cardTitulo: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  ndviCirculo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  ndviValor: { color: "#FFF", fontSize: 28, fontWeight: "bold" },
  ndviLabel: { color: "#FFF", fontSize: 12 },
  dataColeta: { textAlign: "center", color: "#999", fontSize: 12, marginTop: 4 },
  indicadores: { flexDirection: "row", marginHorizontal: 12, gap: 8 },
  indicador: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 1,
  },
  indicadorIcone: { fontSize: 20 },
  indicadorTitulo: { fontSize: 11, color: "#666", marginTop: 4 },
  indicadorValor: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
  resumoTexto: { color: "#555", lineHeight: 20 },
});
