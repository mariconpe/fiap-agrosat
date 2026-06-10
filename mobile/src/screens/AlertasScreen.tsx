import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { listarAlertas, verificarRiscos } from "../services/api";
import type { Alerta } from "../types";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, shadow, spacing, TAB_BAR_CLEARANCE } from "../theme";
import { useAlertas } from "../context/AlertasContext";

const PROPRIEDADE_ID = 1;

const SEVERIDADE = {
  ALTA: { cor: colors.critical, tinta: colors.criticalTint, label: "Alta" },
  MEDIA: { cor: colors.warning, tinta: colors.warningTint, label: "Media" },
  BAIXA: { cor: colors.success, tinta: colors.successTint, label: "Baixa" },
} as const;

export default function AlertasScreen() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const { setNaoLidos } = useAlertas();

  const atualizarNaoLidos = useCallback(
    (lista: Alerta[]) => {
      setNaoLidos(lista.filter((a) => !a.lida).length);
    },
    [setNaoLidos]
  );

  const carregarAlertas = useCallback(async () => {
    const dados = await listarAlertas(PROPRIEDADE_ID);
    setAlertas(dados);
    atualizarNaoLidos(dados);
    setCarregando(false);
    setRecarregando(false);
  }, [atualizarNaoLidos]);

  useEffect(() => {
    carregarAlertas();
  }, [carregarAlertas]);

  const executarVerificacao = async () => {
    setVerificando(true);
    const resultado = await verificarRiscos(PROPRIEDADE_ID);
    setAlertas(resultado.alertas);
    atualizarNaoLidos(resultado.alertas);
    setVerificando(false);
    Haptics.notificationAsync(
      resultado.alertas.some((a) => !a.lida)
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
  };

  const marcarComoLido = (alerta: Alerta) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const atualizados = alertas.map((a) =>
      a.id === alerta.id ? { ...a, lida: true } : a
    );
    setAlertas(atualizados);
    atualizarNaoLidos(atualizados);
  };

  const naoLidos = alertas.filter((a) => !a.lida).length;

  return (
    <View style={styles.container}>
      <ScreenHeader
        titulo="Alertas"
        subtitulo={
          naoLidos === 0
            ? "Nenhum alerta nao lido"
            : `${naoLidos} ${naoLidos === 1 ? "nao lido" : "nao lidos"}`
        }
        acessorio={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Verificar riscos agora"
            onPress={executarVerificacao}
            disabled={verificando}
            style={({ pressed }) => [
              styles.botaoVerificar,
              pressed && styles.pressionado,
            ]}
          >
            {verificando ? (
              <ActivityIndicator size="small" color={colors.brand} />
            ) : (
              <Ionicons name="scan" size={20} color={colors.brand} />
            )}
          </Pressable>
        }
      />

      {carregando ? (
        <View style={styles.listaConteudo}>
          <View style={[styles.esqueleto, { height: 130 }]} />
          <View style={[styles.esqueleto, { height: 130 }]} />
        </View>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(alerta) => alerta.id.toString()}
          renderItem={({ item }) => (
            <CartaoAlerta
              alerta={item}
              aoMarcarLido={() => marcarComoLido(item)}
            />
          )}
          contentContainerStyle={[
            styles.listaConteudo,
            { paddingBottom: TAB_BAR_CLEARANCE },
            alertas.length === 0 && styles.listaVazia,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={recarregando}
              tintColor={colors.brand}
              onRefresh={() => {
                setRecarregando(true);
                carregarAlertas();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.vazio}>
              <View style={styles.vazioIcone}>
                <Ionicons
                  name="shield-checkmark"
                  size={28}
                  color={colors.brand}
                />
              </View>
              <Text style={styles.vazioTitulo}>Tudo em ordem</Text>
              <Text style={styles.vazioTexto}>
                Nenhum risco detectado na propriedade. Toque no botao acima para
                rodar a verificacao agora.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ----- componentes auxiliares -----

function CartaoAlerta({
  alerta,
  aoMarcarLido,
}: {
  alerta: Alerta;
  aoMarcarLido: () => void;
}) {
  const severidade = SEVERIDADE[alerta.severidade];
  const isSeca = alerta.tipo === "SECA";

  return (
    <View style={[styles.card, alerta.lida && styles.cardLido]}>
      <View style={styles.cardTopo}>
        <View style={[styles.cardIcone, { backgroundColor: severidade.tinta }]}>
          <Ionicons
            name={isSeca ? "sunny" : "bug"}
            size={18}
            color={severidade.cor}
          />
        </View>
        <View style={styles.cardCabecalho}>
          <View style={styles.cardTituloLinha}>
            {!alerta.lida && <View style={styles.pontoNaoLido} />}
            <Text style={styles.cardTitulo}>
              {isSeca ? "Risco de seca" : "Possivel praga"}
            </Text>
          </View>
          <Text style={styles.cardData}>{formatarDataHora(alerta.dataCriacao)}</Text>
        </View>
        <View style={[styles.selo, { backgroundColor: severidade.tinta }]}>
          <Text style={[styles.seloTexto, { color: severidade.cor }]}>
            {severidade.label}
          </Text>
        </View>
      </View>

      <Text style={styles.cardMensagem}>{alerta.mensagem}</Text>

      {!alerta.lida && (
        <>
          <View style={styles.separador} />
          <Pressable
            accessibilityRole="button"
            onPress={aoMarcarLido}
            style={({ pressed }) => [
              styles.botaoLido,
              pressed && styles.pressionado,
            ]}
          >
            <Ionicons name="checkmark" size={16} color={colors.brand} />
            <Text style={styles.botaoLidoTexto}>Marcar como lido</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// ----- helpers -----

const formatarDataHora = (dataIso: string): string => {
  const data = new Date(dataIso);
  return `${data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })} as ${data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// ----- estilos -----

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  botaoVerificar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  pressionado: { opacity: 0.6 },

  listaConteudo: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  listaVazia: { flexGrow: 1, justifyContent: "center" },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardLido: { opacity: 0.55 },
  cardTopo: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cardIcone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCabecalho: { flex: 1 },
  cardTituloLinha: { flexDirection: "row", alignItems: "center", gap: 6 },
  pontoNaoLido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  cardTitulo: { fontSize: 16, fontWeight: "600", color: colors.ink },
  cardData: { fontSize: 13, color: colors.inkTertiary, marginTop: 1 },
  selo: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  seloTexto: { fontSize: 12, fontWeight: "700" },

  cardMensagem: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSecondary,
    marginTop: spacing.md,
  },

  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginTop: spacing.md,
  },
  botaoLido: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: spacing.md,
    minHeight: 44,
  },
  botaoLidoTexto: { fontSize: 15, fontWeight: "600", color: colors.brand },

  vazio: { alignItems: "center", paddingHorizontal: spacing.xxl },
  vazioIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  vazioTitulo: { fontSize: 17, fontWeight: "600", color: colors.ink },
  vazioTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  esqueleto: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.card,
  },
});
