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
import * as Haptics from "expo-haptics";
import MapView, { Polygon } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";

import { consultarNdvi, listarPropriedades, listarSensores, consultarIndicadores, historicoNdvi, listarAlertas, FONTE_DADOS } from "../services/api";
import type { Alerta, NdviResponse, Propriedade, Sensor } from "../types";
import InsightSheet, { type InsightConteudo } from "../components/InsightSheet";
import ScreenHeader from "../components/ScreenHeader";
import SectionHeader from "../components/SectionHeader";
import { useSession } from "../context/SessionContext";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { colors, radius, shadow, spacing, TAB_BAR_CLEARANCE } from "../theme";

const STATUS_NDVI = {
  SAUDAVEL: { cor: colors.success, tinta: colors.successTint, label: "Saudável" },
  ATENCAO: { cor: colors.warning, tinta: colors.warningTint, label: "Atenção" },
  CRITICO: { cor: colors.critical, tinta: colors.criticalTint, label: "Crítico" },
  SEM_DADOS: { cor: colors.inkTertiary, tinta: colors.surfaceMuted, label: "Sem dados" },
} as const;

// Fazenda Esperança — Botucatu/SP (coordenadas do seed da API)
const FAZENDA = { latitude: -22.85, longitude: -48.43 };
const TALHAO_PRINCIPAL = [
  { latitude: -22.8462, longitude: -48.4338 },
  { latitude: -22.8451, longitude: -48.4282 },
  { latitude: -22.8478, longitude: -48.4247 },
  { latitude: -22.8528, longitude: -48.4262 },
  { latitude: -22.8541, longitude: -48.4318 },
  { latitude: -22.8506, longitude: -48.4352 },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { produtor } = useSession();
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [ndvi, setNdvi] = useState<NdviResponse | null>(null);
  const [umidadeSerie, setUmidadeSerie] = useState<number[]>([]);
  const [umidadeDatas, setUmidadeDatas] = useState<string[]>([]);
  const [horaAtualizacao, setHoraAtualizacao] = useState<string | null>(null);
  const [insightAtivo, setInsightAtivo] = useState<InsightConteudo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);
  const [indicadores, setIndicadores] = useState<{ umidadeAtual: number | null; chuvaAcumulada15Dias: number; temperaturaMaxima7Dias: number | null } | null>(null);
  const [ndviHistorico, setNdviHistorico] = useState<{ ndvi: number; dataColeta: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [alertasHistorico, setAlertasHistorico] = useState<Alerta[]>([]);
  const [fonteDados, setFonteDados] = useState<"API" | "DEMONSTRACAO">("API");

  const carregarDados = useCallback(async () => {
    try {
    const propriedades = await listarPropriedades();
    if (propriedades.length > 0) {
      const principal = propriedades[0];
      setPropriedade(principal);
      const [ndviData, sensores, indicadoresData, historico, alertas] = await Promise.all([
        consultarNdvi(principal.id),
        listarSensores(principal.id),
        consultarIndicadores(principal.id),
        historicoNdvi(principal.id),
        listarAlertas(principal.id),
      ]);
      setNdvi(ndviData);
      const leituras = extrairLeiturasUmidade(sensores);
      setUmidadeSerie(leituras.map((sensor) => sensor.valor));
      setUmidadeDatas(leituras.map((sensor) => sensor.dataHora));
      setIndicadores(indicadoresData);
      setNdviHistorico(historico);
      setAlertasHistorico(alertas);
      setFonteDados(FONTE_DADOS);
    }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar dados da API.");
    }
    setHoraAtualizacao(
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
    setCarregando(false);
    setRecarregando(false);
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function abrirInsight(insight: InsightConteudo) {
    void Haptics.selectionAsync();
    setInsightAtivo(insight);
  }

  // a rota NdviHistorico vive no stack raiz, acima do tab navigator —
  // despacha no pai para a ação não se perder no navigator de tabs
  function abrirHistoricoNdvi() {
    const stackRaiz = navigation.getParent() ?? navigation;
    stackRaiz.navigate("NdviHistorico");
  }

  if (carregando) {
    return <DashboardSkeleton paddingTop={insets.top + 12} />;
  }

  const status = STATUS_NDVI[ndvi?.status ?? "SEM_DADOS"];
  const valorNdvi = ndvi?.ndvi ?? null;
  const alertasAtivos = propriedade?.alertasAtivos ?? 0;
  const umidadeAtual = indicadores?.umidadeAtual ?? umidadeSerie.at(-1) ?? null;
  const ndviSeteDias = ndviHistorico.filter((medicao) => new Date(medicao.dataColeta).getTime() >= Date.now() - 7 * 86400000);
  const variacaoNdvi = ndviSeteDias.length >= 2 ? ndviSeteDias.at(-1)!.ndvi - ndviSeteDias[0]!.ndvi : null;
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
            void carregarDados();
          }}
        />
      }
    >
      <ScreenHeader
        saudacao={`${saudacaoPorHora()}, ${primeiroNome(produtor?.nome)}`}
        titulo={propriedade?.nome ?? "AgroSat"}
        subtitulo={`${propriedade?.cultura ?? "—"} · ${formatarArea(
          propriedade?.areaHectares
        )} ha`}
      />
      {erro ? <Text style={styles.heroNota}>{erro}</Text> : <Text style={styles.heroNota}>Dados {fonteDados === "API" ? "integrados à API" : "offline de demonstração"}</Text>}

      {/* talhão visto do satélite, tingido pelo status do NDVI */}
      <View style={styles.heroCard}>
        <View style={styles.mapa} pointerEvents="none">
          <MapView
            style={StyleSheet.absoluteFill}
            mapType="satellite"
            initialRegion={{
              ...FAZENDA,
              latitudeDelta: 0.016,
              longitudeDelta: 0.016,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
          >
            <Polygon
              coordinates={TALHAO_PRINCIPAL}
              fillColor={`${status.cor}55`}
              strokeColor="#FFFFFF"
              strokeWidth={2}
            />
          </MapView>
        </View>

        <View style={styles.heroChips} pointerEvents="none">
          <View style={styles.chip}>
            <PontoPulsante />
            <Text style={styles.chipTexto}>
              Monitorando{horaAtualizacao ? ` · ${horaAtualizacao}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.heroLegenda}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir histórico de NDVI"
            onPress={() => {
              void Haptics.selectionAsync();
              abrirHistoricoNdvi();
            }}
            style={({ pressed }) => [styles.chipGrande, pressed && styles.pressionado]}
          >
            <Text style={styles.chipGrandeTexto}>
              NDVI{" "}
              <Text style={styles.chipGrandeValor}>
                {valorNdvi != null ? valorNdvi.toFixed(2).replace(".", ",") : "—"}
              </Text>
              {"  ·  "}
              <Text style={{ color: status.cor, fontWeight: "700" }}>
                {status.label}
              </Text>
              {"  ›"}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.heroNota}>
        Mapa ilustrativo, pois a propriedade ainda não possui geometria do talhão. A área tingida mostra o
        status do vigor da vegetação: acima de 0,60 a lavoura está saudável.
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
      <Text style={styles.heroNota}>
        Alertas persistidos: seca {alertasHistorico.filter((a) => a.tipo === "SECA").length} · praga {alertasHistorico.filter((a) => a.tipo === "PRAGA").length} · alta {alertasHistorico.filter((a) => a.severidade === "ALTA").length} · média {alertasHistorico.filter((a) => a.severidade === "MEDIA").length} · baixa {alertasHistorico.filter((a) => a.severidade === "BAIXA").length} · ativos {alertasHistorico.filter((a) => !a.resolvido).length} · resolvidos {alertasHistorico.filter((a) => a.resolvido).length} · não lidos {alertasHistorico.filter((a) => !a.lida).length}.
      </Text>

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
          accessibilityLabel="Umidade do solo, ver detalhes"
          onPress={() => abrirInsight(montarInsightUmidade(umidadeAtual))}
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
            datas={umidadeDatas}
            cor={umidadeCritica ? colors.critical : colors.brand}
          />
        </Pressable>

        <CartaoHoje
          titulo="Chuva"
          valor={indicadores ? `${indicadores.chuvaAcumulada15Dias.toFixed(0)} mm` : "—"}
          corValor={indicadores && indicadores.chuvaAcumulada15Dias < 10 ? colors.critical : colors.brand}
          nota="Acumulado em 15 dias"
          rodape="Mínimo saudável: 10 mm"
          aoTocar={() => abrirInsight(montarInsightChuva(indicadores?.chuvaAcumulada15Dias ?? null))}
        />
        <CartaoHoje
          titulo="Temperatura"
          valor={indicadores?.temperaturaMaxima7Dias != null ? `${indicadores.temperaturaMaxima7Dias.toFixed(0)}°C` : "—"}
          corValor={indicadores?.temperaturaMaxima7Dias != null && indicadores.temperaturaMaxima7Dias > 30 ? colors.warning : colors.ink}
          nota="Máxima em 7 dias"
          rodape="Alerta experimental acima de 30°C"
          aoTocar={() => abrirInsight(montarInsightTemperatura(indicadores?.temperaturaMaxima7Dias ?? null))}
        />
        <CartaoHoje
          titulo="NDVI em 7 dias"
          valor={variacaoNdvi != null ? variacaoNdvi.toFixed(2).replace("-", "−") : "—"}
          corValor={variacaoNdvi != null && variacaoNdvi < -0.15 ? colors.critical : colors.brand}
          nota="Variação do vigor"
          rodape={variacaoNdvi == null ? "Dados insuficientes na janela" : "Janela real de 7 dias"}
          aoTocar={() =>
            abrirInsight({
              ...montarInsightNdvi(variacaoNdvi),
              acao: {
                rotulo: "Ver histórico completo",
                aoTocar: () => {
                  setInsightAtivo(null);
                  abrirHistoricoNdvi();
                },
              },
            })
          }
        />
      </ScrollView>

      <InsightSheet insight={insightAtivo} aoFechar={() => setInsightAtivo(null)}>
        {insightAtivo?.titulo === "Umidade do solo" && (
          <View style={styles.graficoSheet}>
            <GraficoBarras
              valores={umidadeSerie}
              datas={umidadeDatas}
              cor={umidadeCritica ? colors.critical : colors.brand}
            />
            <Text style={styles.graficoSheetNota}>Últimas 6 leituras do sensor</Text>
          </View>
        )}
      </InsightSheet>

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

// ----- conteúdo dos insights -----

function montarInsightUmidade(umidadeAtual: number | null): InsightConteudo {
  const isCritica = umidadeAtual != null && umidadeAtual < 20;
  return {
    titulo: "Umidade do solo",
    valor:
      umidadeAtual != null ? `${umidadeAtual.toFixed(1).replace(".", ",")}%` : "—",
    corValor: isCritica ? colors.critical : colors.ink,
    statusLabel: isCritica ? "Crítico" : "Adequada",
    statusCor: isCritica ? colors.critical : colors.success,
    statusTinta: isCritica ? colors.criticalTint : colors.successTint,
    fonte: "Sensor IoT de campo · leitura a cada 30 min",
    oQueE:
      "Sensores capacitivos instalados a 20 cm de profundidade medem a água disponível para as raízes e enviam as leituras direto para a plataforma.",
    comoLer: [
      { cor: colors.critical, texto: "Abaixo de 20%: estresse hídrico, a planta sofre" },
      { cor: colors.warning, texto: "Entre 20% e 30%: zona de atenção, monitore com frequência" },
      { cor: colors.success, texto: "Entre 30% e 35%: faixa ideal para a soja" },
    ],
    recomendacao:
      "Com o solo seco e sem chuva no acumulado, priorize irrigar no início da manhã para reduzir a perda por evaporação.",
  };
}

const INSIGHT_CHUVA: InsightConteudo = {
  titulo: "Chuva",
  valor: "—",
  corValor: colors.inkTertiary,
  statusLabel: "Sem dados",
  statusCor: colors.inkTertiary,
  statusTinta: colors.surfaceMuted,
  fonte: "Satélite meteorológico · acumulado de 15 dias",
  oQueE:
    "Estimativa de precipitação por satélite para a área da propriedade, somada nos últimos 15 dias. Dispensa pluviômetro físico no talhão.",
  comoLer: [
    { cor: colors.critical, texto: "Menos de 10 mm em 15 dias: risco de seca" },
    { cor: colors.warning, texto: "Entre 10 mm e 25 mm: suficiente apenas com solo já úmido" },
    { cor: colors.success, texto: "Acima de 25 mm: reposição adequada de água" },
  ],
  recomendacao: "Cruze o acumulado com a umidade do solo antes de decidir a irrigação.",
};

function montarInsightChuva(mm: number | null): InsightConteudo {
  const abaixoDoLimite = mm != null && mm < 10;
  return { ...INSIGHT_CHUVA, valor: mm == null ? "—" : `${mm.toFixed(1).replace(".", ",")} mm`, corValor: abaixoDoLimite ? colors.critical : colors.ink,
    statusLabel: mm == null ? "Sem dados" : abaixoDoLimite ? "Abaixo do limite" : "Acumulado adequado",
    statusCor: mm == null ? colors.inkTertiary : abaixoDoLimite ? colors.critical : colors.success,
    statusTinta: mm == null ? colors.surfaceMuted : abaixoDoLimite ? colors.criticalTint : colors.successTint,
    recomendacao: mm == null ? "Ainda não há leituras de chuva nos últimos 15 dias." : abaixoDoLimite ? `O acumulado de ${mm.toFixed(1)} mm está abaixo de 10 mm. Confira a umidade do solo antes de irrigar.` : `O acumulado de ${mm.toFixed(1)} mm está acima do limite experimental de 10 mm.` };
}

const INSIGHT_TEMPERATURA: InsightConteudo = {
  titulo: "Temperatura",
  valor: "—",
  corValor: colors.warning,
  statusLabel: "Calor extremo",
  statusCor: colors.warning,
  statusTinta: colors.warningTint,
  fonte: "Dado climático · máxima em 7 dias",
  oQueE:
    "Temperaturas máxima e mínima diárias estimadas por satélite para o talhão. Calor prolongado acelera a evaporação e o ciclo de pragas.",
  comoLer: [
    { cor: colors.success, texto: "Até 25°C: confortável para a cultura" },
    { cor: colors.warning, texto: "Entre 25°C e 30°C: atenção à perda de água" },
    { cor: colors.critical, texto: "Acima de 30°C: favorece pragas e estresse térmico" },
  ],
  recomendacao: "Acompanhe as leituras de temperatura durante a janela de sete dias.",
};

function montarInsightTemperatura(temp: number | null): InsightConteudo {
  const alta = temp != null && temp > 30;
  return { ...INSIGHT_TEMPERATURA, valor: temp == null ? "—" : `${temp.toFixed(1).replace(".", ",")}°C`,
    corValor: alta ? colors.warning : colors.ink, statusLabel: temp == null ? "Sem dados" : alta ? "Acima do limite" : "Dentro do limite",
    statusCor: temp == null ? colors.inkTertiary : alta ? colors.warning : colors.success,
    statusTinta: temp == null ? colors.surfaceMuted : alta ? colors.warningTint : colors.successTint,
    recomendacao: temp == null ? "Não há leituras climáticas nos últimos sete dias." : alta ? `A máxima de ${temp.toFixed(1)}°C passou do limite experimental de 30°C.` : `A máxima de ${temp.toFixed(1)}°C não passou do limite experimental de 30°C.` };
}

const INSIGHT_NDVI: InsightConteudo = {
  titulo: "NDVI em 7 dias",
  valor: "—",
  corValor: colors.critical,
  statusLabel: "Queda acelerada",
  statusCor: colors.critical,
  statusTinta: colors.criticalTint,
  fonte: "Landsat e Sentinel · variação em 7 dias",
  oQueE:
    "O NDVI compara a luz vermelha e a infravermelha refletidas pela lavoura. Planta saudável reflete mais infravermelho, então quedas rápidas no índice denunciam problema antes de ele ficar visível a olho nu.",
  comoLer: [
    { cor: colors.success, texto: "Queda de até 0,05 em 7 dias: variação normal" },
    { cor: colors.warning, texto: "Entre 0,05 e 0,15: observe os talhões com mais atenção" },
    { cor: colors.critical, texto: "Acima de 0,15: investigue praga ou estresse no campo" },
  ],
  recomendacao: "São necessárias ao menos duas medições na janela de sete dias.",
};

function montarInsightNdvi(variacao: number | null): InsightConteudo {
  const quedaCritica = variacao != null && variacao < -0.15;
  return { ...INSIGHT_NDVI, valor: variacao == null ? "—" : variacao.toFixed(2).replace("-", "−").replace(".", ","),
    corValor: quedaCritica ? colors.critical : colors.brand,
    statusLabel: variacao == null ? "Dados insuficientes" : quedaCritica ? "Queda acelerada" : "Variação observada",
    statusCor: variacao == null ? colors.inkTertiary : quedaCritica ? colors.critical : colors.success,
    statusTinta: variacao == null ? colors.surfaceMuted : quedaCritica ? colors.criticalTint : colors.successTint,
    recomendacao: variacao == null ? "Ainda não existem duas medições nos últimos sete dias para calcular a variação." : quedaCritica ? `A queda de ${Math.abs(variacao).toFixed(2)} passou do limite experimental de 0,15. Avalie inspeção de campo.` : `A variação de ${variacao.toFixed(2)} está dentro do limite experimental de queda de 0,15.` };
}

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

function CartaoHoje({
  titulo,
  valor,
  corValor,
  nota,
  rodape,
  aoTocar,
}: Readonly<{
  titulo: string;
  valor: string;
  corValor: string;
  nota: string;
  rodape: string;
  aoTocar: () => void;
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ver detalhes`}
      onPress={aoTocar}
      style={({ pressed }) => [styles.cartaoHoje, pressed && styles.pressionado]}
    >
      <View style={styles.cartaoHojeTopo}>
        <Text style={styles.cartaoHojeTitulo}>{titulo}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.iconMuted} />
      </View>
      <Text style={[styles.cartaoHojeValor, { color: corValor }]}>{valor}</Text>
      <Text style={styles.cartaoHojeNota}>{nota}</Text>
      <Text style={styles.cartaoHojeRodape}>{rodape}</Text>
    </Pressable>
  );
}

function GraficoBarras({ valores, cor, datas = [] }: Readonly<{ valores: number[]; cor: string; datas?: string[] }>) {
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
          <View key={indice} style={styles.graficoColuna}>
          <Animated.View
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
          {datas[indice] ? <Text style={styles.graficoData}>{formatarHora(datas[indice])}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

function LinhaInfo({
  icone,
  rotulo,
  valor,
}: Readonly<{
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
}>) {
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

function DashboardSkeleton({ paddingTop }: Readonly<{ paddingTop: number }>) {
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

function extrairLeiturasUmidade(sensores: Sensor[]): Sensor[] {
  return sensores
    .filter((sensor) => sensor.tipo === "UMIDADE_SOLO")
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
    .slice(-6);
}

function formatarHora(dataHora: string): string {
  return new Date(dataHora).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function primeiroNome(nome?: string): string {
  return nome?.trim().split(/\s+/)[0] ?? "produtor";
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

  heroCard: {
    height: 210,
    marginHorizontal: spacing.lg,
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: "#14381F",
    ...shadow.card,
  },
  mapa: { ...StyleSheet.absoluteFillObject },
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
  graficoColuna: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  graficoData: { fontSize: 8, color: colors.inkTertiary, marginTop: 2 },
  graficoSheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  graficoSheetNota: {
    fontSize: 12,
    color: colors.inkTertiary,
    marginTop: spacing.sm,
  },

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
