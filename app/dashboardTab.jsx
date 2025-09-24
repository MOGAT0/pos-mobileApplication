import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Ionicons from "react-native-vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Dashboard from '../dashboardtabs/dashboard';
import CollectionLogs from '../dashboardtabs/collectionLogs';
import ContainerStocks from '../dashboardtabs/containerStocks';
import PaymentsHistory from '../dashboardtabs/paymentsHistory';
import TransactionsLogs from '../dashboardtabs/transactionsLogs';

const DashboardPage = () => {
  return <Dashboard />;
};

const CollectionLogsPage = () => {
  return <CollectionLogs />;
};

const ContainerStocksPage = () => {
  return <ContainerStocks />;
}; 

const PaymentsHistoryPage = () => {
  return <PaymentsHistory />;
};

const TransactionsLogsPage = () => {
  return <TransactionsLogs />;
};

const Tab = createBottomTabNavigator();

const DashboardTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "dashboard") {
            iconName = focused ? "podium" : "podium-outline";
          }else if (route.name === "collectionLogs") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "containerStocks") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "paymentsHistory") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "transactionsLogs") {
            iconName = focused ? "document-text" : "document-text-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#331177",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="dashboard"
        component={DashboardPage}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="containerStocks"
        component={ContainerStocksPage}
        options={{ title: "Container Stocks" }}
      />
      {/* <Tab.Screen
        name="paymentsHistory"
        component={PaymentsHistoryPage}
        options={{ title: "Payments History" }}
      />
      <Tab.Screen
        name="transactionsLogs"
        component={TransactionsLogsPage}
        options={{ title: "Transactions Logs" }}
      /> */}
      <Tab.Screen
        name="collectionLogs"
        component={CollectionLogsPage}
        options={{ title: "Collection Logs" }}
      />
    </Tab.Navigator>
  );
};

export default DashboardTabs;
