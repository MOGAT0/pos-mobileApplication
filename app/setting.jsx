import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Config from '../components/config'
import { router } from 'expo-router'
import Loading from '../components/loading';

const Setting = () => {
  const [apiBase, setApiBase] = useState('');
  const [posTerminalName, setPosTerminalName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  //  Load saved values
  useEffect(() => {
    const loadConfig = async () => {
      const savedFullApi = await Config.getApiUrl();
      const savedPos = await Config.getPosName();

      if (savedFullApi) {
        // strip down to base IP/domain
        const match = savedFullApi.match(/^https?:\/\/([^/]+)/);
        if (match) setApiBase(match[1]);
      }
      if (savedPos) setPosTerminalName(savedPos);
    };
    loadConfig();
  }, []);

  // Always reconstruct full URL before use
  const getFullApiUrl = () => {
    return `http://${apiBase}/pos_backend/endpoint.php`;
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getFullApiUrl()}?command=test_API`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: JSON.stringify({}) }).toString(),
      });

      const data = await response.json();

      if (data.response?.ok) {
        Alert.alert("Success", `Connected to API: \n${apiBase}`);
      } else {
        Alert.alert("Warning", `Unable to connect to: \n${apiBase}`);
      }
    } catch (error) {
      Alert.alert("Error", `Invalid API \n${apiBase}`);
    }finally{
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    // save the full API
    await Config.setApiUrl(getFullApiUrl());
    await Config.setPosName(posTerminalName);

    const GetapiUrl = await Config.getApiUrl();
    const GetposName = await Config.getPosName();

    if (GetapiUrl && GetposName) {
      Alert.alert("Success", `Saved: \n${apiBase}`);
    } else {
      Alert.alert("Warning", "Unable to save \nMake sure to fill all fields");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.header}>Settings</Text>
        <Loading visible={isLoading}/>

        <TouchableOpacity onPress={() => {
          setIsEditing(!isEditing)
          if (isEditing) saveConfig();
        }} style={styles.iconButton}>
          <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* API Base */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>API Base (IP / Domain)</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            placeholder="e.g. 192.168.194.92"
            value={apiBase}
            onChangeText={setApiBase}
          />
        ) : (
          <Text style={styles.displayText}>{apiBase}</Text>
        )}
      </View>

      {/* POS Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>POS Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            placeholder="Enter POS Name"
            value={posTerminalName}
            onChangeText={setPosTerminalName}
          />
        ) : (
          <Text style={styles.displayText}>{posTerminalName}</Text>
        )}
      </View>

      {/* Test Button */}
      <TouchableOpacity style={styles.button} onPress={handleTestConnection}>
        <Text style={styles.buttonText}>Test Connection</Text>
      </TouchableOpacity>
    </View>
  )
}


export default Setting

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop:10,
  },
  iconButton: {
    padding: 5,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  displayText: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: '#333',
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
