import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";

/**
 * Título de seção padrão (20/700) com metadado opcional à direita,
 * como data ou contagem — mesmo padrão em todas as telas.
 */
export default function SectionHeader({
  titulo,
  meta,
}: {
  titulo: string;
  meta?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      {meta != null && <Text style={styles.meta}>{meta}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  titulo: { fontSize: 20, fontWeight: "700", color: colors.ink },
  meta: { fontSize: 14, color: colors.inkSecondary },
});
