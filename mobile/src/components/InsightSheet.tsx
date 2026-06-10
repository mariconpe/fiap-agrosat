import React, { type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../theme";

export interface InsightConteudo {
  titulo: string;
  valor: string;
  corValor: string;
  statusLabel: string;
  statusCor: string;
  statusTinta: string;
  oQueE: string;
  comoLer: { cor: string; texto: string }[];
  recomendacao: string;
  fonte: string;
  acao?: { rotulo: string; aoTocar: () => void };
}

/**
 * Sheet iOS de detalhe de uma métrica: o que é, como ler as faixas
 * e o que fazer. Aberto ao tocar nos cards da seção Hoje.
 */
export default function InsightSheet({
  insight,
  aoFechar,
  children,
}: {
  insight: InsightConteudo | null;
  aoFechar: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal
      visible={insight != null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={aoFechar}
    >
      {insight != null && (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{insight.titulo}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar detalhes"
              onPress={aoFechar}
              style={({ pressed }) => [styles.fechar, pressed && styles.pressionado]}
            >
              <Ionicons name="close" size={18} color={colors.inkSecondary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.valorLinha}>
              <Text style={[styles.valor, { color: insight.corValor }]}>
                {insight.valor}
              </Text>
              <View style={[styles.selo, { backgroundColor: insight.statusTinta }]}>
                <Text style={[styles.seloTexto, { color: insight.statusCor }]}>
                  {insight.statusLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.fonte}>{insight.fonte}</Text>

            {children}

            <Text style={styles.secao}>O que é</Text>
            <View style={styles.card}>
              <Text style={styles.texto}>{insight.oQueE}</Text>
            </View>

            <Text style={styles.secao}>Como ler</Text>
            <View style={styles.card}>
              {insight.comoLer.map((faixa, indice) => (
                <View
                  key={faixa.texto}
                  style={[styles.faixa, indice > 0 && styles.faixaSeparada]}
                >
                  <View style={[styles.faixaPonto, { backgroundColor: faixa.cor }]} />
                  <Text style={styles.texto}>{faixa.texto}</Text>
                </View>
              ))}
            </View>

            <View style={styles.recomendacao}>
              <Ionicons name="bulb" size={16} color={colors.brand} />
              <Text style={styles.recomendacaoTexto}>{insight.recomendacao}</Text>
            </View>

            {insight.acao != null && (
              <Pressable
                accessibilityRole="button"
                onPress={insight.acao.aoTocar}
                style={({ pressed }) => [styles.botaoAcao, pressed && styles.pressionado]}
              >
                <Text style={styles.botaoAcaoTexto}>{insight.acao.rotulo}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.surface} />
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  titulo: { fontSize: 20, fontWeight: "700", color: colors.ink },
  fechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  pressionado: { opacity: 0.6 },

  conteudo: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

  valorLinha: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  valor: { fontSize: 40, fontWeight: "700", letterSpacing: -0.4 },
  selo: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  seloTexto: { fontSize: 12, fontWeight: "700" },
  fonte: { fontSize: 13, color: colors.inkTertiary, marginTop: 2 },

  secao: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  texto: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.inkSecondary },

  faixa: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  faixaSeparada: { marginTop: spacing.md },
  faixaPonto: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },

  recomendacao: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.brandTint,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  recomendacaoTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.brand,
    fontWeight: "500",
  },

  botaoAcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand,
    borderRadius: radius.control,
    minHeight: 50,
    marginTop: spacing.lg,
  },
  botaoAcaoTexto: { fontSize: 16, fontWeight: "600", color: colors.surface },
});
