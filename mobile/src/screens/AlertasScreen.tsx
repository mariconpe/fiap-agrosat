import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listarAlertas, verificarRiscos } from "../services/api";
import type { Alerta } from "../types";

export default function AlertasScreen() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const insets = useSafeAreaInsets();

  async function carregarAlertas() {
    const dados = await listarAlertas(1); // propriedade ID 1
    setAlertas(dados);
    setCarregando(false);
    setRecarregando(false);
  }

  async function executarVerificacao() {
    setVerificando(true);
    const res = await verificarRiscos(1);
    setAlertas(res.alertas);
    setVerificando(false);
  }

  useEffect(() => { carregarAlertas(); }, []);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  function corSeveridade(severidade: string): string {
    if (severidade === "ALTA") return "#F44336";
    if (severidade === "MEDIA") return "#FF9800";
    return "#4CAF50";
  }

  function iconeTipo(tipo: string): string {
    return tipo === "SECA" ? "🏜️" : "🐛";
  }

  function renderizarAlerta({ item }: { item: Alerta }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.icone}>{iconeTipo(item.tipo)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipo}>
              {item.tipo === "SECA" ? "Risco de Seca" : "Possível Praga"}
            </Text>
            <Text style={styles.data}>
              {new Date(item.dataCriacao).toLocaleString("pt-BR")}
            </Text>
          </View>
          <View
            style={[
              styles.severidade,
              { backgroundColor: corSeveridade(item.severidade) },
            ]}
          >
            <Text style={styles.severidadeTexto}>
              {item.severidade === "ALTA"
                ? "Alta"
                : item.severidade === "MEDIA"
                ? "Média"
                : "Baixa"}
            </Text>
          </View>
        </View>
        <Text style={styles.mensagem}>{item.mensagem}</Text>
        <Text style={styles.propriedade}>📍 {item.propriedadeNome}</Text>
        {!item.lida && (
          <TouchableOpacity style={styles.botaoLida}>
            <Text style={styles.botaoLidaTexto}>Marcar como lido</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={[styles.botaoVerificar, verificando && { opacity: 0.6 }]}
        onPress={executarVerificacao}
        disabled={verificando}
      >
        <Text style={styles.botaoVerificarTexto}>
          {verificando ? "⏳ Verificando..." : "🔍 Verificar riscos agora"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={alertas}
        keyExtractor={(a) => a.id.toString()}
        renderItem={renderizarAlerta}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={recarregando} onRefresh={() => {
            setRecarregando(true); carregarAlertas();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioIcone}>✅</Text>
            <Text style={styles.vazioTexto}>Nenhum alerta no momento</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  centro: { flex: 1, justifyContent: "center", alignItems: "center" },
  botaoVerificar: {
    backgroundColor: "#2E7D32",
    margin: 12,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoVerificarTexto: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icone: { fontSize: 24, marginRight: 10 },
  tipo: { fontSize: 16, fontWeight: "bold" },
  data: { fontSize: 11, color: "#999", marginTop: 2 },
  severidade: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severidadeTexto: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  mensagem: { color: "#555", lineHeight: 20, marginBottom: 8 },
  propriedade: { fontSize: 12, color: "#999", marginBottom: 10 },
  botaoLida: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  botaoLidaTexto: { color: "#2E7D32", fontWeight: "600", fontSize: 13 },
  vazio: { alignItems: "center", marginTop: 60 },
  vazioIcone: { fontSize: 40 },
  vazioTexto: { fontSize: 16, color: "#999", marginTop: 8 },
});
