import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { login } from "../services/api";
import { useSession } from "../context/SessionContext";
import { colors, radius, spacing } from "../theme";

/** Tela de autenticação estilo iOS. */
export default function LoginScreen() {
  const { entrar } = useSession();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);

  const podeEntrar = email.trim().length > 0 && senha.length > 0 && !carregando;

  const handleEntrar = async () => {
    if (!podeEntrar) return;

    setErroVisivel(false);
    setCarregando(true);

    try {
      const produtor = await login(email.trim(), senha);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      entrar(produtor);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErroVisivel(true);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.conteudo}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCirulo}>
            <Ionicons name="leaf" size={36} color={colors.brand} />
          </View>
          <Text style={styles.titulo}>AgroSat</Text>
          <Text style={styles.subtitulo}>Sua lavoura vista do espaco</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          <View style={styles.campo}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.inkTertiary}
              value={email}
              onChangeText={(texto) => {
                setEmail(texto);
                setErroVisivel(false);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              editable={!carregando}
            />
          </View>

          <View style={styles.campo}>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.inkTertiary}
              value={senha}
              onChangeText={(texto) => {
                setSenha(texto);
                setErroVisivel(false);
              }}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleEntrar}
              editable={!carregando}
            />
          </View>

          {erroVisivel && (
            <Text style={styles.erro}>Email ou senha invalidos</Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.botao,
              !podeEntrar && styles.botaoDesabilitado,
              pressed && podeEntrar && styles.botaoPressionado,
            ]}
            onPress={handleEntrar}
            disabled={!podeEntrar}
            accessibilityRole="button"
            accessibilityLabel="Entrar"
          >
            {carregando ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.botaoTexto}>Entrar</Text>
            )}
          </Pressable>
        </View>

        {/* Dica de demonstracao */}
        <Text style={styles.dica}>
          Demo: joao@agrosat.com.br / 123456
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCirulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 0.2,
  },
  subtitulo: {
    fontSize: 15,
    color: colors.inkSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  // Formulario
  formulario: {
    gap: spacing.sm,
  },
  campo: {
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  input: {
    height: 50,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.ink,
  },

  // Erro
  erro: {
    fontSize: 14,
    color: colors.critical,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // Botao
  botao: {
    height: 50,
    backgroundColor: colors.brand,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  botaoDesabilitado: {
    opacity: 0.45,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoTexto: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },

  // Dica
  dica: {
    fontSize: 13,
    color: colors.inkTertiary,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
});
