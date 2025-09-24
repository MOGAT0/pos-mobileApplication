import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Config from "../components/config";

const CollectionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAPI = async () => {
      const api_url = await Config.getApiUrl();
      if (isMounted) {
        if (api_url) {
          setApiUrl(api_url);
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
    if (!apiUrl) return; // wait until apiUrl is available

    let isMounted = true;

    const fetchLogs = async () => {
      try {
        const response = await fetch(`${apiUrl}?command=quota_logs`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: JSON.stringify({}) }).toString(),
        });
        const result = await response.json();

        if (isMounted && result.response.ok && result.response?.data) {
          setLogs(result.response.data);
        }
      } catch (error) {
        console.log("Error fetching quota logs:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // fetch immediately and then every 0.5 second
    fetchLogs();
    const interval = setInterval(fetchLogs, 500);

    return () => {
      isMounted = false;
      clearInterval(interval); // cleanup on unmount
    };
  }, [apiUrl]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading collection logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collection Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.name} ({item.username})
            </Text>
            <Text>Total Amount: ₱{item.total_amount.toFixed(2)}</Text>
            <Text>Email: {item.email}</Text>

            {/* Nested transactions list */}
            {item.transactions.length > 0 ? (
              <FlatList
                data={item.transactions}
                keyExtractor={(t) => t.transaction_id.toString()}
                renderItem={({ item: t }) => (
                  <View style={styles.transaction}>
                    <Text>Customer: {t.customer_name}</Text>
                    <Text>Item: {t.item_name}</Text>
                    <Text>Amount: ₱{t.total_amount.toFixed(2)}</Text>
                    <Text>Date: {t.date_created}</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={{ marginTop: 8 }}>No transactions</Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default CollectionLogs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: "blue",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  transaction: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
});
