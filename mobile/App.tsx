import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import DashboardScreen from "./src/screens/DashboardScreen";
import AlertasScreen from "./src/screens/AlertasScreen";
import SensoresScreen from "./src/screens/SensoresScreen";
import LoginScreen from "./src/screens/LoginScreen";
import NdviHistoricoScreen from "./src/screens/NdviHistoricoScreen";
import FloatingTabBar from "./src/components/FloatingTabBar";
import { SessionProvider, useSession } from "./src/context/SessionContext";
import { AlertasProvider } from "./src/context/AlertasContext";
import { colors } from "./src/theme";

// ---------------------------------------------------------------
// Tipos de navegacao
// ---------------------------------------------------------------

export type RootStackParamList = {
  Tabs: undefined;
  NdviHistorico: undefined;
};

// ---------------------------------------------------------------
// Navigators
// ---------------------------------------------------------------

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Lavoura" }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertasScreen}
        options={{ tabBarLabel: "Alertas" }}
      />
      <Tab.Screen
        name="Sensores"
        component={SensoresScreen}
        options={{ tabBarLabel: "Sensores" }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NdviHistorico"
        component={NdviHistoricoScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------------
// AppContent — decide entre Login e Tabs baseado na sessao
// ---------------------------------------------------------------

function AppContent() {
  const { produtor } = useSession();

  if (produtor === null) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// ---------------------------------------------------------------
// App raiz
// ---------------------------------------------------------------

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SessionProvider>
        <AlertasProvider>
          <AppContent />
        </AlertasProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
