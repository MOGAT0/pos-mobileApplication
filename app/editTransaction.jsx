import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "@env";
import { getUser } from "../components/ss_login";
import Receipt from "../components/receipt";
import Config from "../components/config";
import Loading from "../components/loading";

const EditTransaction = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);

  const [apiUrl, setapiUrl] = useState("");

  // state for editable fields
  const [customerName, setCustomerName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [areaName, setAreaName] = useState("");
  const [balance, setBalance] = useState("");
  const [itemName, setItemName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [payment, setPayment] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);
  const [prevbalance, setPrevBalance] = useState("");

  const [wcSwap, setWcSwap] = useState("");
  const [container, setContainer] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [total, setTotal] = useState("");
  const [daysCounter, setDaysCounter] = useState("");

  const [isLoading,setIsLoading] = useState(false);

  const receiptRef = useRef(null);

  useEffect(() => {
    const fetchAPI = async () => {
      const api_url = await Config.getApiUrl();
      setapiUrl(api_url);
    };
    fetchAPI();
  }, []);

  /*--- get user login ---*/
  useEffect(() => {
    const fetchLoggedUser = async () => {
      const user = await getUser();
      setLoggedUser(user);
    };
    fetchLoggedUser();
  }, []);

  /** Fetch Transaction by ID */
  const fetchTransaction = async () => {
    console.log(`api: ${apiUrl}`);

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}?command=fetch_transaction_by_id`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          data: JSON.stringify({ id }),
        }).toString(),
      });

      const data = await res.json();

      if (data.error === "none" && data.response.transaction) {
        const t = data.response.transaction;

        setTransaction(t);
        setCustomerName(t.customer_name);
        setTotalAmount(t.total_amount.toString());
        setAreaName(t.area_name);
        setBalance(t.balance.toString());
        setItemName(t.item_name);
        setCreatedAt(t.created_at);
        setPrevBalance(t.previous_balance);
        setWcSwap(t.wc_swap);
        setContainer(t.container);
        setUnitPrice(t.unit_price);
        setTotal(t.total_amount);
        setDaysCounter(t.days_counter);

        console.log(t);
        
      } else {
        console.warn("No transaction found");
      }
    } catch (err) {
      console.log("Error fetching transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && apiUrl) {
      fetchTransaction();
    }
  }, [id, apiUrl]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58bc82" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.centered}>
        <Text>No transaction found.</Text>
      </View>
    );
  }

  const handle_updateBalance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}?command=update_balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({
            transactionID: parseInt(id),
            payment: parseFloat(payment),
            user_id: parseInt(loggedUser.id),
            balance: parseFloat(balance),
            previous_balance: parseFloat(prevbalance),
          }),
        }).toString(),
      });

      const data = await response.json();

      if (data.response.ok) {
        Alert.alert("Success", "Updated Successfully");
        await receiptRef.current.printReceipt();
        router.replace("MainScreen");
      } else {
        Alert.alert("Error", "Update Error");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong");
    } finally{
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 10,
        paddingTop: 20,
        backgroundColor: "#fff",
        flex: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Loading visible={isLoading}/>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backbtnwrapper}
          onPress={() => router.back()}
        >
          <Image
            source={require("../assets/back .png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.header}>Edit Transaction</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Payment (exact Amount)</Text>

          <TextInput
            style={styles.input}
            value={payment}
            keyboardType="numeric"
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9.]/g, "");
              const numValue = parseFloat(numeric);

              if (!isNaN(numValue)) {
                if (numValue <= parseFloat(balance)) {
                  setPayment(numeric);
                } else {
                  setPayment(balance.toString());
                }
              } else {
                setPayment("");
              }
            }}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handle_updateBalance}
          >
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Preview:</Text>
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Customer Name:</Text>
          <Text style={styles.previewValue}>{customerName}</Text>

          <Text style={styles.previewLabel}>Area:</Text>
          <Text style={styles.previewValue}>{areaName}</Text>

          <Text style={styles.previewLabel}>Item:</Text>
          <Text style={styles.previewValue}>{itemName}</Text>

          <Text style={styles.previewLabel}>Balance:</Text>
          <Text style={[styles.previewValue, { color: "red" }]}>{balance}</Text>
        </View>
      </View>

      <View style={{ height: 0, width: 0, opacity: 0 }}>
        <Receipt
          item_name={itemName}
          ref={receiptRef}
          customer_name={customerName}
          swap={wcSwap}
          container_qty={container}
          unit_price={unitPrice}
          total_amount={total}
          days={daysCounter}
          total_balance={balance}
          payment_amount={payment}
          trans_history={new Date().toLocaleDateString()}
          hm_paid={payment}
          balance={Math.max(
            0,
            parseFloat(balance) - parseFloat(payment)
          ).toFixed(2)}
          transaction_no={`${Date.now()}`}
        />
      </View>
    </ScrollView>
  );
};

export default EditTransaction;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  header: {
    fontSize: 25,
    fontWeight: "600",
    color: "#3f3151",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#444",
  },
  saveBtn: {
    backgroundColor: "#58bc82",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#c2c2c2",
    elevation: 3,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  previewValue: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  inputContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    position: "relative",
  },
  backbtnwrapper: {
    position: "absolute",
    left: 1,
    padding: 5,
    zIndex: 1,
  },
  backIcon: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
});
