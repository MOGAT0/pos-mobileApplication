import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import Config from "../components/config"; // <-- make sure this holds your API URL
import { LinearGradient } from "expo-linear-gradient";

const StatCard = ({ title, value, colors, big = false }) => (
  <LinearGradient colors={colors} style={[styles.card, big && styles.bigCard]}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={[styles.cardValue, big && styles.bigCardValue]}>
      {value?.toLocaleString() || 0}
    </Text>
  </LinearGradient>
);
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState("");

  /** fetch api url (recursive until available) */
  useEffect(() => {
    let isMounted = true;

    const fetchAPI = async () => {
      const api_url = await Config.getApiUrl();
      if (isMounted) {
        if (api_url) {
          setApiUrl(api_url);
          console.log(api_url);
        } else {
          setTimeout(fetchAPI, 1000);
        }
      }
    };

    fetchAPI();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!apiUrl) return; // don't start until apiUrl is ready

    const interval = setInterval(() => {
      const fetchDashboardStats = async () => {
        try {
          const response = await fetch(`${apiUrl}?command=dashboard_stats`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ data: JSON.stringify({}) }).toString(),
          });
          const json = await response.json();
          setStats(json.response || {});
          setLoading(false);
        } catch (error) {
          console.log("Error fetching dashboard stats:", error);
        }
      };

      fetchDashboardStats();
    }, 500); // every 0.5 second

    return () => clearInterval(interval); // cleanup on unmount
  }, [apiUrl]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#331177" />
        <Text>Loading stats...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text>No stats available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Stats</Text>

      {/* Big Profits Card on Top */}
      <StatCard
        title="Profits"
        value={stats.profits}
        colors={["#f2994a", "#f2c94c"]}
        big
      />

      <View style={styles.grid}>
        <StatCard
          title="Sales"
          value={stats.sales}
          colors={["#a445b2", "#d41872"]}
        />
        <StatCard
          title="Payments"
          value={stats.payments}
          colors={["#1e3c72", "#2a5298"]}
        />
        <StatCard
          title="Prev Balance"
          value={stats.prev_balance}
          colors={["#11998e", "#38ef7d"]}
        />
        <StatCard
          title="Current Balance"
          value={stats.current_balance}
          colors={["#56ab2f", "#a8e063"]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#331177",
    marginTop: 30,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  bigCard: {
    width: "100%",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  bigCardValue: {
    fontSize: 32,
  },
});

export default Dashboard;
