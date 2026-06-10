import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";

import DashboardScreen from "./src/screens/DashboardScreen";
import AlertasScreen from "./src/screens/AlertasScreen";
import SensoresScreen from "./src/screens/SensoresScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#999",
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22 }}>🌾</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Alertas"
          component={AlertasScreen}
          options={{
            tabBarLabel: "Alertas",
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22 }}>⚠️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Sensores"
          component={SensoresScreen}
          options={{
            tabBarLabel: "Sensores",
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22 }}>📡</Text>
            ),
          }}
        />
      </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
