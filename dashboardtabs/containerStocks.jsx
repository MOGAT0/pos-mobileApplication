import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Config from "../components/config";

const ContainerStocks = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState("");

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
    if (!apiUrl) return; // wait until apiUrl is available

    let isMounted = true;

    const fetchContainers = async () => {
      try {
        const response = await fetch(`${apiUrl}?command=fetch_containers`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: JSON.stringify({}) }).toString(),
        });

        const result = await response.json();
        console.log("Containers:", result);

        if (isMounted) {
          if (result.response.ok && result.response.data) {
            setContainers(result.response.data);
          } else {
            setContainers([]);
          }
        }
      } catch (error) {
        console.log("Error fetching containers:", error);
        if (isMounted) setContainers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // fetch immediately and then every 0.5 second
    fetchContainers();
    const interval = setInterval(fetchContainers, 500);

    return () => {
      isMounted = false;
      clearInterval(interval); // cleanup
    };
  }, [apiUrl]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading containers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Container Stocks</Text>
      <FlatList
        style={{ flex: 1 }}
        data={containers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Total Containers: {item.containers}</Text>
            <Text>Remaining: {item.containers_remaining}</Text>
            <Text>Unit Price: ₱{item.unit_price}</Text>
            <Text>Total Amount: ₱{item.total_amount}</Text>
            <Text>Date Created: {item.date_created}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No containers found
          </Text>
        )}
      />
    </View>
  );
};

export default ContainerStocks;

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
    borderColor: "orange",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
});
