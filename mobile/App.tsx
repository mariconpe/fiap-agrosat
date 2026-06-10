import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import DashboardScreen from "./src/screens/DashboardScreen";
import AlertasScreen from "./src/screens/AlertasScreen";
import SensoresScreen from "./src/screens/SensoresScreen";
import FloatingTabBar from "./src/components/FloatingTabBar";
import { colors } from "./src/theme";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
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
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
