import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { listarPropriedades } from "../services/api";
import { useSession } from "../context/SessionContext";
import type { Propriedade } from "../types";
import { colors, radius, spacing } from "../theme";

/**
 * Sheet de perfil do produtor: dados da conta, propriedade vinculada
 * e saída da sessão. Aberto pelo botão de perfil da tab bar e pelo
 * avatar do cabeçalho da Lavoura.
 */
export default function PerfilSheet({
  visivel,
  aoFechar,
}: {
  visivel: boolean;
  aoFechar: () => void;
}) {
  const { produtor, sair } = useSession();
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);

  useEffect(() => {
    if (!visivel || propriedade != null) return;
    listarPropriedades().then((propriedades) => {
      if (propriedades.length > 0) setPropriedade(propriedades[0]);
    });
  }, [visivel, propriedade]);

  function sairDaConta() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    aoFechar();
    sair();
  }

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={aoFechar}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Perfil</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar perfil"
            onPress={aoFechar}
            style={({ pressed }) => [styles.fechar, pressed && styles.pressionado]}
          >
            <Ionicons name="close" size={18} color={colors.inkSecondary} />
          </Pressable>
        </View>

        <View style={styles.identidade}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIniciais}>
              {extrairIniciais(produtor?.nome)}
            </Text>
          </View>
          <Text style={styles.nome}>{produtor?.nome ?? "—"}</Text>
          <Text style={styles.email}>{produtor?.email ?? "—"}</Text>
        </View>

        <Text style={styles.secao}>Propriedade vinculada</Text>
        <View style={styles.card}>
          <LinhaInfo
            icone="home-outline"
            rotulo="Fazenda"
            valor={propriedade?.nome ?? "—"}
          />
          <View style={styles.separador} />
          <LinhaInfo
            icone="nutrition-outline"
            rotulo="Cultura"
            valor={`${propriedade?.cultura ?? "—"} · ${formatarArea(
              propriedade?.areaHectares
            )} ha`}
          />
          <View style={styles.separador} />
          <LinhaInfo
            icone="location-outline"
            rotulo="Localização"
            valor={extrairCidade(propriedade?.localizacao)}
          />
        </View>

        <Text style={styles.secao}>Conta</Text>
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            onPress={sairDaConta}
            style={({ pressed }) => [styles.linhaSair, pressed && styles.pressionado]}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.critical} />
            <Text style={styles.sairTexto}>Sair da conta</Text>
          </Pressable>
        </View>

        <Text style={styles.rodape}>
          AgroSat · Protótipo Global Solution 2026/1 — FIAP
        </Text>
      </View>
    </Modal>
  );
}

// ----- componentes auxiliares -----

function LinhaInfo({
  icone,
  rotulo,
  valor,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.linhaInfo}>
      <Ionicons name={icone} size={18} color={colors.inkSecondary} />
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

// ----- helpers -----

function extrairIniciais(nome?: string): string {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.charAt(0) ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";
  return `${primeira}${ultima}`.toUpperCase();
}

function formatarArea(area?: number): string {
  if (area == null) return "—";
  return area.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function extrairCidade(localizacao?: string): string {
  if (!localizacao) return "—";
  return localizacao.split("—").pop()?.trim() ?? localizacao;
}

// ----- estilos -----

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

  identidade: { alignItems: "center", marginVertical: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarIniciais: { fontSize: 26, fontWeight: "700", color: colors.brand },
  nome: { fontSize: 20, fontWeight: "700", color: colors.ink },
  email: { fontSize: 14, color: colors.inkSecondary, marginTop: 2 },

  secao: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  linhaRotulo: { fontSize: 15, color: colors.inkSecondary },
  linhaValor: { flex: 1, fontSize: 15, color: colors.ink, textAlign: "right" },
  separador: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator },

  linhaSair: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 44,
  },
  sairTexto: { fontSize: 15, fontWeight: "600", color: colors.critical },

  rodape: {
    fontSize: 12,
    color: colors.inkTertiary,
    textAlign: "center",
    marginTop: "auto",
    marginBottom: spacing.xxl,
  },
});
