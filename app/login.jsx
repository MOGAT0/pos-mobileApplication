import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { saveUser, getUser } from "../components/ss_login"; // make sure getUser is imported
import Ionicons from "react-native-vector-icons/Ionicons";
import Config from "../components/config";

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true); // start with true until auto-login check finishes
  const [loggingIn, setLoggingIn] = useState(false); // for button spinner
  const [apiUrl, setapiUrl] = useState("");

  /** fetch api url (recursive until available) */
  useEffect(() => {
    let isMounted = true;

    const fetchAPI = async () => {
      const api_url = await Config.getApiUrl();
      if (isMounted) {
        if (api_url) {
          setapiUrl(api_url);
        } else {
          setTimeout(fetchAPI, 1000);
        }
      }
    };

    fetchAPI();
    return () => { isMounted = false; };
  }, []);

  /** auto-login if securestore has logged_user */
  useEffect(() => {
    const checkLoggedUser = async () => {
      try {
        const user = await getUser();
        if (user) {
          console.log("Auto-login with:", user);
          Alert.alert("Success","Login Successfully")
          router.replace("/MainScreen"); // skip login screen
        }
      } catch (err) {
        console.log("Error checking user:", err);
      } finally {
        setLoading(false); // either way, stop showing loader
      }
    };

    checkLoggedUser();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Validation", "Please enter both username and password.");
      return;
    }

    setLoggingIn(true);

    try {
      const response = await fetch(`${apiUrl}?command=login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          data: JSON.stringify({ username, password }),
        }).toString(),
      });

      const result = await response.json();
      console.log("Login Response:", result);

      if (result.response && result.response.ok) {
        Alert.alert("Success", "Login successful!");
        await saveUser(result.response.user);
        router.replace("/MainScreen");
      } else {
        Alert.alert("Invalid credentials");
      }
    } catch (error) {
      console.log("Login Error:", error);
      Alert.alert("Error", "Unable to connect to the server.");
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) {
    // while checking SecureStore for auto-login
    return (
      <View style={styles.loaderWrapper}>
        <ActivityIndicator size="large" color="#58bc82" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headertxt}>Login</Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("./setting")}
        >
          <Ionicons name="settings" size={28} color="#3f3151" />
        </TouchableOpacity>
      </View>

      <View style={styles.formWrapper}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#9c9c9c"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9c9c9c"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* <TouchableOpacity onPress={() => router.push("/forgotPass")}>
            <Text style={styles.linkRight}>Forgot password?</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loggingIn}
          >
            <Text style={styles.buttonText}>
              {loggingIn ? "Logging in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            {/* Don't have an account?{" "}
            <Text style={styles.link} onPress={() => router.push("/signup")}>
              Sign up
            </Text> */}
          </Text>
          
        </View>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 60,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  headertxt: {
    fontSize: 25,
    fontWeight: "600",
    color: "#3f3151",
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -100,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#58bc82",
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#9c9c9c60",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    color: "#000",
    borderWidth: 2,
    borderColor: "#707070",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: "#707070",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  buttonText: {
    color: "#efefef",
    fontWeight: "600",
    fontSize: 14,
  },
  linkRight: {
    color: "#58bc82",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  footerText: {
    textAlign: "center",
    color: "#707070",
  },
  link: {
    color: "#58bc82",
    fontWeight: "600",
  },
  settingsButton: {
    position: "absolute",
    right: 10,
  },
});
