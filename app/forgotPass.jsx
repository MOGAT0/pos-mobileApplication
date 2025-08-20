import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // TODO: Add password reset logic
    console.log('Reset link sent to:', email);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headertxt}>Forgot Password</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.instructions}>
            Enter your email address and we’ll send you a link to reset your password.
          </Text>

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

          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Back to{' '}
            <Text style={styles.link} onPress={() => router.push('/login')}>
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ForgotPassword;

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
    fontSize: 25,
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
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  instructions: {
    fontSize: 14,
    color: '#707070',
    marginBottom: 16,
    textAlign: 'left',
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#000',
    borderWidth: 2,
    borderColor: '#707070',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: '#707070',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
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
