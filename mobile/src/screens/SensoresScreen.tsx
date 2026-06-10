import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { listarSensores } from "../services/api";
import type { Sensor } from "../types";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, shadow, spacing, TAB_BAR_CLEARANCE } from "../theme";

const PROPRIEDADE_ID = 1;

interface ConfigSensor {
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  unidade: string;
  escalaMax: number;
  faixaIdeal: string;
  avaliar: (valor: number) => "ok" | "atencao" | "critico";
}

const CONFIG_SENSORES: Record<string, ConfigSensor> = {
  UMIDADE_SOLO: {
    rotulo: "Umidade do solo",
    icone: "water",
    unidade: "%",
    escalaMax: 100,
    faixaIdeal: "Ideal entre 20% e 35%",
    avaliar: (valor) => (valor < 20 ? "critico" : valor < 30 ? "atencao" : "ok"),
  },
  TEMPERATURA: {
    rotulo: "Temperatura",
    icone: "thermometer",
    unidade: "°C",
    escalaMax: 45,
    faixaIdeal: "Alerta acima de 30°C",
    avaliar: (valor) => (valor > 30 ? "critico" : valor > 25 ? "atencao" : "ok"),
  },
  PLUVIOMETRO: {
    rotulo: "Pluviômetro",
    icone: "rainy",
    unidade: " mm",
    escalaMax: 50,
    faixaIdeal: "Acumulado do dia",
    avaliar: () => "ok",
  },
};

const STATUS = {
  ok: { cor: colors.success, tinta: colors.successTint },
  atencao: { cor: colors.warning, tinta: colors.warningTint },
  critico: { cor: colors.critical, tinta: colors.criticalTint },
} as const;

export default function SensoresScreen() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const carregarSensores = useCallback(async () => {
    setSensores(await listarSensores(PROPRIEDADE_ID));
    setCarregando(false);
    setRecarregando(false);
  }, []);

  useEffect(() => {
    carregarSensores();
  }, [carregarSensores]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        titulo="Sensores"
        subtitulo="Dispositivos IoT instalados na propriedade"
      />

      {carregando ? (
        <View style={styles.listaConteudo}>
          <View style={[styles.esqueleto, { height: 120 }]} />
          <View style={[styles.esqueleto, { height: 120 }]} />
          <View style={[styles.esqueleto, { height: 120 }]} />
        </View>
      ) : (
        <FlatList
          data={sensores}
          keyExtractor={(sensor) => sensor.id.toString()}
          renderItem={({ item }) => <CartaoSensor sensor={item} />}
          contentContainerStyle={[
            styles.listaConteudo,
            { paddingBottom: TAB_BAR_CLEARANCE },
            sensores.length === 0 && styles.listaVazia,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={recarregando}
              onRefresh={() => {
                setRecarregando(true);
                carregarSensores();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.vazio}>
              <View style={styles.vazioIcone}>
                <Ionicons name="hardware-chip-outline" size={28} color={colors.brand} />
              </View>
              <Text style={styles.vazioTitulo}>Nenhum sensor conectado</Text>
              <Text style={styles.vazioTexto}>
                As leituras dos dispositivos IoT da propriedade aparecem aqui
                assim que forem enviadas.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ----- componentes auxiliares -----

function CartaoSensor({ sensor }: { sensor: Sensor }) {
  const config = CONFIG_SENSORES[sensor.tipo] ?? {
    rotulo: sensor.tipo,
    icone: "hardware-chip" as const,
    unidade: "",
    escalaMax: 100,
    faixaIdeal: "",
    avaliar: () => "ok" as const,
  };
  const status = STATUS[config.avaliar(sensor.valor)];
  const preenchimento = Math.min((sensor.valor / config.escalaMax) * 100, 100);

  return (
    <View style={styles.card}>
      <View style={styles.cardTopo}>
        <View style={[styles.cardIcone, { backgroundColor: status.tinta }]}>
          <Ionicons name={config.icone} size={18} color={status.cor} />
        </View>
        <View style={styles.cardCabecalho}>
          <Text style={styles.cardTitulo}>{config.rotulo}</Text>
          <Text style={styles.cardData}>
            Última leitura {formatarDataHora(sensor.dataHora)}
          </Text>
        </View>
        <Text style={[styles.cardValor, { color: status.cor }]}>
          {sensor.valor.toFixed(1).replace(".", ",")}
          {config.unidade}
        </Text>
      </View>

      <View style={styles.trilha}>
        <View
          style={[
            styles.trilhaPreenchida,
            { width: `${preenchimento}%`, backgroundColor: status.cor },
          ]}
        />
      </View>

      <View style={styles.cardRodape}>
        <Text style={styles.cardNota}>{config.faixaIdeal}</Text>
        <Text style={styles.cardNota}>
          0 – {config.escalaMax}
          {config.unidade.trim()}
        </Text>
      </View>
    </View>
  );
}

// ----- helpers -----

function formatarDataHora(dataIso: string): string {
  const data = new Date(dataIso);
  return `${data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })} às ${data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

// ----- estilos -----

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  listaConteudo: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  listaVazia: { flexGrow: 1, justifyContent: "center" },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardTopo: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cardIcone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCabecalho: { flex: 1 },
  cardTitulo: { fontSize: 16, fontWeight: "600", color: colors.ink },
  cardData: { fontSize: 13, color: colors.inkTertiary, marginTop: 1 },
  cardValor: { fontSize: 22, fontWeight: "700" },

  trilha: {
    height: 8,
    backgroundColor: colors.trackMuted,
    borderRadius: 4,
    marginTop: spacing.lg,
  },
  trilhaPreenchida: { height: "100%", borderRadius: 4 },

  cardRodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  cardNota: { fontSize: 13, color: colors.inkSecondary },

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
