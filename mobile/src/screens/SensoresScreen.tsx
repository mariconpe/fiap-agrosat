import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { listarSensores } from "../services/api";
import type { Sensor } from "../types";

export default function SensoresScreen() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  async function carregarSensores() {
    const dados = await listarSensores(1);
    setSensores(dados);
    setCarregando(false);
    setRecarregando(false);
  }

  useEffect(() => { carregarSensores(); }, []);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  function formatoValor(sensor: Sensor): string {
    if (sensor.tipo === "UMIDADE_SOLO") return `${sensor.valor.toFixed(1)}%`;
    if (sensor.tipo === "TEMPERATURA") return `${sensor.valor.toFixed(1)}°C`;
    return sensor.valor.toFixed(1);
  }

  function corBarra(tipo: string, valor: number): string {
    if (tipo === "UMIDADE_SOLO") {
      if (valor < 20) return "#F44336";
      if (valor < 30) return "#FF9800";
      return "#4CAF50";
    }
    if (tipo === "TEMPERATURA") {
      if (valor > 30) return "#F44336";
      if (valor > 25) return "#FF9800";
      return "#4CAF50";
    }
    return "#4CAF50";
  }

  function labelTipo(tipo: string): string {
    if (tipo === "UMIDADE_SOLO") return "💧 Umidade do Solo";
    if (tipo === "TEMPERATURA") return "🌡️ Temperatura";
    if (tipo === "PLUVIOMETRO") return "🌧️ Pluviômetro";
    return tipo;
  }

  function renderizarSensor({ item }: { item: Sensor }) {
    const porcentagem =
      item.tipo === "TEMPERATURA"
        ? Math.min((item.valor / 45) * 100, 100) // escala 0–45°C
        : Math.min(item.valor, 100); // umidade 0–100%

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.tipo}>{labelTipo(item.tipo)}</Text>
          <Text style={[styles.valor, { color: corBarra(item.tipo, item.valor) }]}>
            {formatoValor(item)}
          </Text>
        </View>

        {/* barra de progresso */}
        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraPreenchida,
              {
                width: `${Math.min(porcentagem, 100)}%`,
                backgroundColor: corBarra(item.tipo, item.valor),
              },
            ]}
          />
        </View>

        <Text style={styles.dataHora}>
          Última leitura: {new Date(item.dataHora).toLocaleString("pt-BR")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sensores}
        keyExtractor={(s) => s.id.toString()}
        renderItem={renderizarSensor}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={recarregando} onRefresh={() => {
            setRecarregando(true); carregarSensores();
          }} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitulo}>📡 Sensores IoT</Text>
            <Text style={styles.headerSubtitulo}>
              Leituras em tempo real dos dispositivos na propriedade
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioIcone}>📡</Text>
            <Text style={styles.vazioTexto}>
              Nenhum sensor cadastrado
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  centro: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 8 },
  headerTitulo: { fontSize: 18, fontWeight: "bold" },
  headerSubtitulo: { fontSize: 13, color: "#666", marginTop: 2 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tipo: { fontSize: 15, fontWeight: "600" },
  valor: { fontSize: 20, fontWeight: "bold" },
  barraFundo: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  barraPreenchida: {
    height: "100%",
    borderRadius: 4,
  },
  dataHora: { fontSize: 11, color: "#999" },
  vazio: { alignItems: "center", marginTop: 60 },
  vazioIcone: { fontSize: 40 },
  vazioTexto: { fontSize: 16, color: "#999", marginTop: 8 },
});
