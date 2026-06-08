import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "./src/screens/DashboardScreen";
import AlertasScreen from "./src/screens/AlertasScreen";
import SensoresScreen from "./src/screens/SensoresScreen";

const Tab = createBottomTabNavigator();

function TabBarIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#2E7D32",
            tabBarInactiveTintColor: "#999",
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
            },
            tabBarStyle: {
              backgroundColor: "#FFF",
              borderTopWidth: 1,
              borderTopColor: "#E0E0E0",
              paddingTop: 6,
            },
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarLabel: "Dashboard",
              tabBarIcon: () => <TabBarIcon emoji="🌾" />,
            }}
          />
          <Tab.Screen
            name="Alertas"
            component={AlertasScreen}
            options={{
              tabBarLabel: "Alertas",
              tabBarIcon: () => <TabBarIcon emoji="⚠️" />,
            }}
          />
          <Tab.Screen
            name="Sensores"
            component={SensoresScreen}
            options={{
              tabBarLabel: "Sensores",
              tabBarIcon: () => <TabBarIcon emoji="📡" />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
