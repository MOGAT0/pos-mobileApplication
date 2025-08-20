import React, { useState,useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL,API_PORT } from "@env";

const SignUp = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      alert("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}:${API_PORT}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      const result = await response.json();
      console.log("Register Response:", result);

      if (result.error === "none" && result.response.ok === true) {
        alert("Account created successfully!");
        router.push("/login");
      } else {
        if (result.error === "email_already_exists") {
          alert("Email already exists.");
        } else if (result.error === "username_already_exists") {
          alert("Username already exists.");
        } else {
          alert(result.error || "Registration failed.");
        }
      }
    } catch (error) {
      console.error("Register Error:", error);
      alert("Unable to connect to the server.");
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headertxt}>Sign Up</Text>
      </View>

      

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9c9c9c"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a username"
              placeholderTextColor="#9c9c9c"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9c9c9c"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                placeholderTextColor="#9c9c9c"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#9c9c9c"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Go to Login */}
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => router.push('/login')}>
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 60,
    paddingHorizontal: 10,
  },
  headertxt: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3f3151',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    width: '100%',
    maxWidth: 400,
    marginTop: -20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#58bc82',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#9c9c9c60',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#000',
    borderWidth: 2,
    borderColor: '#707070',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#707070',
    backgroundColor: '#9c9c9c60',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  eyeButton: {
    padding: 10,
  },
  eyeIcon: {
    fontSize: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: '#707070',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#efefef',
    fontWeight: '600',
    fontSize: 14,
  },
  footerText: {
    textAlign: 'center',
    color: '#707070',
  },
  link: {
    color: '#58bc82',
    fontWeight: '600',
  },
});
