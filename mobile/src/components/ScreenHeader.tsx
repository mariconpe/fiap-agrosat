import React, { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "../theme";

/**
 * Cabeçalho padrão das telas: large title iOS com subtítulo e
 * acessório opcional à direita (avatar, botão de ação).
 * Garante a mesma hierarquia e espaçamento em todas as páginas.
 */
export default function ScreenHeader({
  saudacao,
  titulo,
  subtitulo,
  acessorio,
}: {
  saudacao?: string;
  titulo: string;
  subtitulo?: string;
  acessorio?: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.texto}>
        {saudacao != null && <Text style={styles.saudacao}>{saudacao}</Text>}
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        {subtitulo != null && (
          <Text style={styles.subtitulo} numberOfLines={1}>
            {subtitulo}
          </Text>
        )}
      </View>
      {acessorio}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  texto: { flex: 1, marginRight: spacing.md },
  saudacao: { fontSize: 14, color: colors.inkSecondary, marginBottom: 2 },
  titulo: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 0.2,
  },
  subtitulo: { fontSize: 14, color: colors.inkSecondary, marginTop: 2 },
});
