import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const LoginAs = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login As</Text>

      <TouchableOpacity onPress={()=> router.push("adminLogin")} style={styles.adminButton}>
        <Text style={styles.adminText}>Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=> router.push("login")} style={styles.posButton}>
        <Text style={styles.posText}>POS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  adminButton: {
    width: '80%',
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: 'green',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  adminText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'green',
  },
  posButton: {
    width: '80%',
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: 'blue',
    backgroundColor: 'blue',
    borderRadius: 10,
    alignItems: 'center',
  },
  posText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default LoginAs;
