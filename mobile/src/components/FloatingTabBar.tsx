import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import PerfilSheet from "./PerfilSheet";
import { colors, radius, shadow } from "../theme";
import { useAlertas } from "../context/AlertasContext";
import { useSession } from "../context/SessionContext";

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Dashboard: { active: "leaf", inactive: "leaf-outline" },
  Alertas: { active: "notifications", inactive: "notifications-outline" },
  Sensores: { active: "pulse", inactive: "pulse-outline" },
};

/**
 * Tab bar flutuante em pílula, no padrão iOS (refs: Apple Store, Linear).
 * Substitui a tab bar padrão do React Navigation.
 */
export default function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { naoLidos } = useAlertas();
  const { produtor } = useSession();
  const [perfilAberto, setPerfilAberto] = useState(false);

  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) + 4 }]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel?.toString() ?? route.name;
          const isActive = state.index === index;
          const icons = TAB_ICONS[route.name] ?? {
            active: "ellipse",
            inactive: "ellipse-outline",
          };
          const hasUnread = route.name === "Alertas" && naoLidos > 0;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              Haptics.selectionAsync();
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={
                hasUnread ? `${label}, ${naoLidos} não lidos` : label
              }
              onPress={onPress}
              style={({ pressed }) => [
                styles.item,
                isActive && styles.itemActive,
                pressed && !isActive && styles.itemPressed,
              ]}
            >
              <View style={styles.iconeContainer}>
                <Ionicons
                  name={isActive ? icons.active : icons.inactive}
                  size={22}
                  color={isActive ? colors.brand : colors.iconMuted}
                />
                {hasUnread && <View style={styles.badgeDot} />}
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir perfil"
        onPress={() => {
          Haptics.selectionAsync();
          setPerfilAberto(true);
        }}
        style={({ pressed }) => [styles.perfil, pressed && styles.perfilPressionado]}
      >
        <Text style={styles.perfilIniciais}>{iniciaisDoNome(produtor?.nome)}</Text>
      </Pressable>

      <PerfilSheet visivel={perfilAberto} aoFechar={() => setPerfilAberto(false)} />
    </View>
  );
}

function iniciaisDoNome(nome?: string): string {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.charAt(0) ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";
  return `${primeira}${ultima}`.toUpperCase();
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 6,
    gap: 4,
    ...shadow.floating,
  },
  item: {
    minWidth: 92,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    gap: 2,
  },
  itemActive: {
    backgroundColor: colors.brandTint,
  },
  itemPressed: {
    backgroundColor: colors.background,
  },
  iconeContainer: {
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.critical,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.iconMuted,
  },
  labelActive: {
    color: colors.brand,
  },
  perfil: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.floating,
  },
  perfilPressionado: {
    backgroundColor: colors.brandTint,
  },
  perfilIniciais: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand,
  },
});
