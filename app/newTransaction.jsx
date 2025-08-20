import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import TransactionForm from "../components/TransactionForm";

/* shallow compare to avoid needless setState loops */
function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (let k of ak) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

const NewTransaction = () => {
  const router = useRouter();
  const [formState, setFormState] = useState(null);

  const handleFormChange = useCallback((next) => {
    setFormState((prev) => (shallowEqual(prev || {}, next) ? prev : next));
  }, []);

  return (
    <View style={styles.container}>
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

        <Text style={styles.headertxt}>New Transaction</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <TransactionForm onChange={handleFormChange} autoCalc />
      </View>
    </View>
  );
};

export default NewTransaction;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 10,
    flex: 1,
    backgroundColor: "#fff",
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
  headertxt: {
    fontSize: 25,
    fontWeight: "600",
    color: "#2a0845",
    left: 20,
  },
  formContainer: {
    flex: 1,
    marginTop: 8,
  },
});
