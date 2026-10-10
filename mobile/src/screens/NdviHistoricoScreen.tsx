import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, shadow, spacing } from "../theme";
import type { RootStackParamList } from "../../App";
import { historicoNdvi, listarPropriedades } from "../services/api";

// ---------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------

interface PontoNdvi {
  data: Date;
  valor: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "NdviHistorico">;

// ---------------------------------------------------------------
const VALOR_MAX = 1.0;

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

const corBarra = (valor: number): string => {
  if (valor >= 0.6) return colors.success;
  if (valor >= 0.45) return colors.warning;
  return colors.critical;
};

const formatarDdMm = (data: Date): string =>
  `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;

// ---------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------

export default function NdviHistoricoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [serie, setSerie] = useState<PontoNdvi[]>([]);
  const [nomePropriedade, setNomePropriedade] = useState("Propriedade");
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    listarPropriedades().then(async (propriedades) => {
      const principal = propriedades[0];
      if (!principal) { setSerie([]); return; }
      setNomePropriedade(principal.nome);
      const dados = await historicoNdvi(principal.id);
      setSerie(dados.map((d) => ({ data: new Date(`${d.dataColeta}T00:00:00`), valor: d.ndvi })));
    }).catch((e) => setErro(e instanceof Error ? e.message : "Falha ao carregar histórico."));
  }, []);
  const recentes = serie.filter((p) => p.data.getTime() >= Date.now() - 7 * 86400000);
  const variacaoSeteDias = recentes.length >= 2 ? recentes.at(-1)!.valor - recentes[0].valor : null;
  const variacaoFormatada = variacaoSeteDias == null ? "—" : variacaoSeteDias.toFixed(2).replace(".", ",");
  const isQueda = variacaoSeteDias != null && variacaoSeteDias < 0;

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      {/* Cabecalho */}
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoTexto}>
          <Text style={styles.titulo}>Historico NDVI</Text>
          <Text style={styles.subtitulo}>
            Últimos 30 dias · {nomePropriedade}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.botaoFechar, pressed && styles.pressionado]}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollConteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* Grafico de barras */}
        <View style={[styles.card, styles.cardGrafico]}>
          <View style={styles.graficoArea}>
            {/* Eixo Y */}
            <View style={styles.eixoY}>
              {["1.0", "0.5", "0"].map((label) => (
                <Text key={label} style={styles.eixoYLabel}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Barras */}
            <View style={styles.barrasContainer}>
              {serie.map((ponto, i) => {
                const alturaPercent = ponto.valor / VALOR_MAX;
                return (
                  <View key={i} style={styles.barraColuna}>
                    <View style={styles.barraWrapper}>
                      <View
                        style={[
                          styles.barra,
                          {
                            height: `${alturaPercent * 100}%`,
                            backgroundColor: corBarra(ponto.valor),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.eixoXLabel}>
                      {formatarDdMm(ponto.data)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {serie.length === 0 ? <Text style={styles.subtitulo}>{erro ?? "Sem medições de NDVI disponíveis."}</Text> : null}

        {/* Card resumo variacao */}
        <View style={[styles.card, styles.cardResumo]}>
          <Text style={styles.resumoLabel}>Variacao em 7 dias</Text>
          <Text style={[styles.resumoValor, { color: isQueda ? colors.critical : colors.success }]}>
            {variacaoSeteDias != null && !isQueda ? "+" : ""}{variacaoFormatada}
          </Text>
        </View>

        {/* Card interpretacao */}
        <View style={styles.card}>
          <Text style={styles.interpretacaoTitulo}>Como interpretar</Text>
          <View style={styles.interpretacaoLinha}>
            <View style={[styles.interpretacaoDot, { backgroundColor: colors.success }]} />
            <Text style={styles.interpretacaoTexto}>
              Vigor da vegetacao medido por satelite: quanto maior, mais saudavel a lavoura.
            </Text>
          </View>
          <View style={styles.interpretacaoLinha}>
            <View style={[styles.interpretacaoDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.interpretacaoTexto}>
              Queda acima de 0,15 em 7 dias indica possivel praga ou estresse hidrico.
            </Text>
          </View>
          <View style={styles.interpretacaoLinha}>
            <View style={[styles.interpretacaoDot, { backgroundColor: colors.brand }]} />
            <Text style={styles.interpretacaoTexto}>
              Valores acima de 0,60 indicam lavoura saudavel e produtiva.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Cabecalho
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  cabecalhoTexto: { flex: 1 },
  titulo: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 0.2,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.inkSecondary,
    marginTop: 2,
  },
  botaoFechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  pressionado: { opacity: 0.6 },

  // Scroll
  scrollConteudo: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardGrafico: {
    paddingBottom: spacing.sm,
  },
  cardResumo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resumoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  resumoValor: {
    fontSize: 20,
    fontWeight: "700",
  },

  // Grafico
  graficoArea: {
    flexDirection: "row",
    height: 180,
    alignItems: "stretch",
  },
  eixoY: {
    width: 36,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: spacing.sm,
    paddingBottom: 24,
  },
  eixoYLabel: {
    fontSize: 11,
    color: colors.inkTertiary,
    fontVariant: ["tabular-nums"],
  },
  barrasContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingBottom: 24,
  },
  barraColuna: {
    flex: 1,
    alignItems: "center",
  },
  barraWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  barra: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  eixoXLabel: {
    fontSize: 10,
    color: colors.inkTertiary,
    marginTop: 4,
    textAlign: "center",
  },

  // Interpretacao
  interpretacaoTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: spacing.md,
  },
  interpretacaoLinha: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  interpretacaoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  interpretacaoTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSecondary,
  },
});
