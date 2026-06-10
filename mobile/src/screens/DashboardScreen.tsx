import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";

import { consultarNdvi, listarPropriedades, listarSensores } from "../services/api";
import type { NdviResponse, Propriedade, Sensor } from "../types";
import ScreenHeader from "../components/ScreenHeader";
import SectionHeader from "../components/SectionHeader";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { colors, radius, shadow, spacing, TAB_BAR_CLEARANCE } from "../theme";

const STATUS_NDVI = {
  SAUDAVEL: { cor: colors.success, tinta: colors.successTint, label: "Saudável" },
  ATENCAO: { cor: colors.warning, tinta: colors.warningTint, label: "Atenção" },
  CRITICO: { cor: colors.critical, tinta: colors.criticalTint, label: "Crítico" },
  SEM_DADOS: { cor: colors.inkTertiary, tinta: colors.surfaceMuted, label: "Sem dados" },
} as const;

const RASTER_COLUNAS = 9;
const RASTER_LINHAS = 5;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [ndvi, setNdvi] = useState<NdviResponse | null>(null);
  const [umidadeSerie, setUmidadeSerie] = useState<number[]>([]);
  const [horaAtualizacao, setHoraAtualizacao] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const carregarDados = useCallback(async () => {
    const propriedades = await listarPropriedades();
    if (propriedades.length > 0) {
      const principal = propriedades[0];
      setPropriedade(principal);
      const [ndviData, sensores] = await Promise.all([
        consultarNdvi(principal.id),
        listarSensores(principal.id),
      ]);
      setNdvi(ndviData);
      setUmidadeSerie(extrairSerieUmidade(sensores));
    }
    setHoraAtualizacao(
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
    setCarregando(false);
    setRecarregando(false);
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  if (carregando) {
    return <DashboardSkeleton paddingTop={insets.top + 12} />;
  }

  const status = STATUS_NDVI[ndvi?.status ?? "SEM_DADOS"];
  const valorNdvi = ndvi?.ndvi ?? null;
  const alertasAtivos = propriedade?.alertasAtivos ?? 0;
  const umidadeAtual = umidadeSerie.length > 0 ? umidadeSerie[umidadeSerie.length - 1] : null;
  const umidadeCritica = umidadeAtual != null && umidadeAtual < 20;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}
      refreshControl={
        <RefreshControl
          refreshing={recarregando}
          tintColor={colors.brand}
          onRefresh={() => {
            setRecarregando(true);
            carregarDados();
          }}
        />
      }
    >
      <ScreenHeader
        saudacao={`${saudacaoPorHora()}, João`}
        titulo={propriedade?.nome ?? "AgroSat"}
        subtitulo={`${propriedade?.cultura ?? "—"} · ${formatarArea(
          propriedade?.areaHectares
        )} ha`}
        acessorio={
          <View style={styles.avatar}>
            <Ionicons name="leaf" size={20} color={colors.brand} />
          </View>
        }
      />

      {/* visão de satélite do talhão (raster NDVI) */}
      <View style={styles.heroCard}>
        <View style={styles.raster}>
          {gerarRasterNdvi(valorNdvi).map((corCelula, indice) => (
            <View
              key={indice}
              style={[styles.rasterCelula, { backgroundColor: corCelula }]}
            />
          ))}
        </View>

        <View style={styles.heroChips} pointerEvents="none">
          <View style={styles.chip}>
            <PontoPulsante />
            <Text style={styles.chipTexto}>
              Monitorando{horaAtualizacao ? ` · ${horaAtualizacao}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.heroLegenda} pointerEvents="none">
          <View style={styles.chipGrande}>
            <Text style={styles.chipGrandeTexto}>
              NDVI{" "}
              <Text style={styles.chipGrandeValor}>
                {valorNdvi != null ? valorNdvi.toFixed(2).replace(".", ",") : "—"}
              </Text>
              {"  ·  "}
              <Text style={{ color: status.cor, fontWeight: "700" }}>
                {status.label}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.legenda}>
        <ItemLegenda cor="#3DA15A" rotulo="Saudável" />
        <ItemLegenda cor="#D9AE3B" rotulo="Atenção" />
        <ItemLegenda cor="#CB6B3F" rotulo="Estresse" />
      </View>

      <Text style={styles.heroNota}>
        Imagem de satélite traduzida em vigor da vegetação. Acima de 0,60 a
        lavoura está saudável.
      </Text>

      {/* alertas pendentes */}
      {alertasAtivos > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${alertasAtivos} alertas precisam da sua atenção, abrir alertas`}
          onPress={() => navigation.navigate("Alertas")}
          style={({ pressed }) => [styles.bannerAlerta, pressed && styles.pressionado]}
        >
          <View style={styles.bannerIcone}>
            <Ionicons name="warning" size={16} color={colors.critical} />
          </View>
          <Text style={styles.bannerTexto}>
            {alertasAtivos === 1
              ? "1 alerta precisa da sua atenção"
              : `${alertasAtivos} alertas precisam da sua atenção`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.critical} />
        </Pressable>
      )}

      {/* hoje */}
      <SectionHeader titulo="Hoje" meta={dataDeHoje()} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={176}
        decelerationRate="fast"
        contentContainerStyle={styles.carrosselHoje}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Umidade do solo, abrir sensores"
          onPress={() => navigation.navigate("Sensores")}
          style={({ pressed }) => [styles.cartaoHoje, pressed && styles.pressionado]}
        >
          <View style={styles.cartaoHojeTopo}>
            <Text style={styles.cartaoHojeTitulo}>Umidade do solo</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.iconMuted} />
          </View>
          <Text
            style={[
              styles.cartaoHojeValor,
              { color: umidadeCritica ? colors.critical : colors.ink },
            ]}
          >
            {umidadeAtual != null
              ? `${umidadeAtual.toFixed(1).replace(".", ",")}%`
              : "—"}
          </Text>
          <Text style={styles.cartaoHojeNota}>
            {umidadeCritica ? "Abaixo do ideal (20%)" : "Dentro da faixa ideal"}
          </Text>
          <GraficoBarras
            valores={umidadeSerie}
            cor={umidadeCritica ? colors.critical : colors.brand}
          />
        </Pressable>

        <CartaoHoje
          titulo="Chuva"
          valor="3 mm"
          corValor={colors.critical}
          nota="Acumulado em 15 dias"
          rodape="Mínimo saudável: 10 mm"
        />
        <CartaoHoje
          titulo="Temperatura"
          valor="32°C"
          corValor={colors.warning}
          nota="Máxima de hoje"
          rodape="Mínima de 22°C · alerta acima de 30°C"
        />
        <CartaoHoje
          titulo="NDVI em 7 dias"
          valor="−0,17"
          corValor={colors.critical}
          nota="Variação do vigor"
          rodape="Queda além do limite de 0,15"
        />
      </ScrollView>

      {/* propriedade */}
      <SectionHeader titulo="Propriedade" />
      <View style={styles.cardLista}>
        <LinhaInfo
          icone="resize-outline"
          rotulo="Área"
          valor={`${formatarArea(propriedade?.areaHectares)} hectares`}
        />
        <View style={styles.separador} />
        <LinhaInfo
          icone="nutrition-outline"
          rotulo="Cultura"
          valor={propriedade?.cultura ?? "—"}
        />
        <View style={styles.separador} />
        <LinhaInfo
          icone="location-outline"
          rotulo="Localização"
          valor={extrairCidade(propriedade?.localizacao)}
        />
      </View>
    </ScrollView>
  );
}

// ----- componentes auxiliares -----

function PontoPulsante() {
  const isReducedMotion = useReducedMotion();
  const opacidade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isReducedMotion) return;
    const pulso = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, {
          toValue: 0.25,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulso.start();
    return () => pulso.stop();
  }, [isReducedMotion, opacidade]);

  return <Animated.View style={[styles.pontoOnline, { opacity: opacidade }]} />;
}

function ItemLegenda({ cor, rotulo }: { cor: string; rotulo: string }) {
  return (
    <View style={styles.legendaItem}>
      <View style={[styles.legendaPonto, { backgroundColor: cor }]} />
      <Text style={styles.legendaTexto}>{rotulo}</Text>
    </View>
  );
}

function CartaoHoje({
  titulo,
  valor,
  corValor,
  nota,
  rodape,
}: {
  titulo: string;
  valor: string;
  corValor: string;
  nota: string;
  rodape: string;
}) {
  return (
    <View style={styles.cartaoHoje}>
      <View style={styles.cartaoHojeTopo}>
        <Text style={styles.cartaoHojeTitulo}>{titulo}</Text>
      </View>
      <Text style={[styles.cartaoHojeValor, { color: corValor }]}>{valor}</Text>
      <Text style={styles.cartaoHojeNota}>{nota}</Text>
      <Text style={styles.cartaoHojeRodape}>{rodape}</Text>
    </View>
  );
}

function GraficoBarras({ valores, cor }: { valores: number[]; cor: string }) {
  const isReducedMotion = useReducedMotion();
  const entrada = useRef(
    valores.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (valores.length === 0) return;
    if (isReducedMotion) {
      entrada.forEach((valor) => valor.setValue(1));
      return;
    }
    Animated.stagger(
      60,
      entrada.map((valor) =>
        Animated.timing(valor, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [entrada, isReducedMotion, valores.length]);

  if (valores.length === 0) return null;
  const maximo = Math.max(...valores, 1);

  return (
    <View style={styles.grafico}>
      {valores.map((valor, indice) => {
        const isUltima = indice === valores.length - 1;
        const opacidadeFinal = isUltima
          ? 1
          : 0.25 + (indice / valores.length) * 0.35;
        return (
          <Animated.View
            key={indice}
            style={[
              styles.graficoBarra,
              {
                height: `${Math.max((valor / maximo) * 100, 12)}%`,
                backgroundColor: cor,
                opacity: entrada[indice].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, opacidadeFinal],
                }),
                transform: [
                  {
                    translateY: entrada[indice].interpolate({
                      inputRange: [0, 1],
                      outputRange: [6, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

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

function DashboardSkeleton({ paddingTop }: { paddingTop: number }) {
  const isReducedMotion = useReducedMotion();
  const brilho = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isReducedMotion) return;
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(brilho, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(brilho, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [brilho, isReducedMotion]);

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop, paddingHorizontal: spacing.lg, opacity: brilho },
      ]}
    >
      <View style={[styles.esqueleto, { width: "55%", height: 30, marginTop: 20 }]} />
      <View style={[styles.esqueleto, { width: "35%", height: 16, marginTop: 8 }]} />
      <View style={[styles.esqueleto, { height: 190, marginTop: 24 }]} />
      <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg }}>
        <View style={[styles.esqueleto, { flex: 1, height: 150 }]} />
        <View style={[styles.esqueleto, { flex: 1, height: 150 }]} />
      </View>
    </Animated.View>
  );
}

// ----- helpers -----

/** Raster NDVI determinístico: simula a leitura de satélite do talhão. */
function gerarRasterNdvi(ndvi: number | null): string[] {
  const base = ndvi ?? 0.5;
  const celulas: string[] = [];

  for (let indice = 0; indice < RASTER_COLUNAS * RASTER_LINHAS; indice++) {
    const ruido = pseudoRuido(indice);
    const vigor = Math.min(Math.max(base + (ruido - 0.5) * 0.35, 0), 1);

    if (vigor >= 0.6) {
      celulas.push(ruido > 0.5 ? "#2F8F4A" : "#3DA15A");
    } else if (vigor >= 0.45) {
      celulas.push(ruido > 0.5 ? "#D9AE3B" : "#E0BC55");
    } else {
      celulas.push(ruido > 0.5 ? "#CB6B3F" : "#D27E50");
    }
  }
  return celulas;
}

function pseudoRuido(indice: number): number {
  const bruto = Math.sin(indice * 12.9898 + 78.233) * 43758.5453;
  return bruto - Math.floor(bruto);
}

function extrairSerieUmidade(sensores: Sensor[]): number[] {
  return sensores
    .filter((sensor) => sensor.tipo === "UMIDADE_SOLO")
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    .slice(-6)
    .map((sensor) => sensor.valor);
}

function saudacaoPorHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataDeHoje(): string {
  const data = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return data.charAt(0).toUpperCase() + data.slice(1);
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

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    height: 190,
    marginHorizontal: spacing.lg,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: "#14381F",
    ...shadow.card,
  },
  raster: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 3,
  },
  rasterCelula: {
    width: `${100 / RASTER_COLUNAS}%`,
    height: `${100 / RASTER_LINHAS}%`,
    borderWidth: 1.5,
    borderColor: "#14381F",
    borderRadius: 4,
  },
  heroChips: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pontoOnline: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  chipTexto: { fontSize: 12, fontWeight: "600", color: colors.ink },
  heroLegenda: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  chipGrande: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    ...shadow.card,
  },
  chipGrandeTexto: { fontSize: 14, color: colors.inkSecondary },
  chipGrandeValor: { fontWeight: "700", color: colors.ink },

  legenda: {
    flexDirection: "row",
    gap: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  legendaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendaPonto: { width: 8, height: 8, borderRadius: 4 },
  legendaTexto: { fontSize: 12, color: colors.inkSecondary },

  heroNota: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkSecondary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  bannerAlerta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.criticalTint,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
  },
  bannerIcone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTexto: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.critical },
  pressionado: { opacity: 0.7 },

  carrosselHoje: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  cartaoHoje: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadow.card,
  },
  cartaoHojeTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cartaoHojeTitulo: { fontSize: 14, fontWeight: "600", color: colors.ink },
  cartaoHojeValor: { fontSize: 28, fontWeight: "700", letterSpacing: -0.3 },
  cartaoHojeNota: { fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  cartaoHojeRodape: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkTertiary,
    marginTop: "auto",
    paddingTop: spacing.md,
  },

  grafico: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 36,
    marginTop: spacing.md,
  },
  graficoBarra: { flex: 1, borderRadius: 3 },

  cardLista: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    ...shadow.card,
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

  esqueleto: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.card,
  },
});
