import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Config from '../components/config'
import { router } from 'expo-router'

const Setting = () => {
  const [apiUrl, setApiUrl] = useState('')
  const [posName, setPosName] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const navigation = useNavigation()

  const handleTestConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}?command=test_API`,{
        method:"POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: JSON.stringify({}),
        }).toString(),
      })

      const data = await response.json();

      if(data.response.ok){
        Alert.alert("Success","Connected to API Successfully!");
      }else{
        Alert.alert("Warning","Unable to connect to API please try again")
      }
    } catch (error) {
      Alert.alert("Warning",`Unable to connect to API please try again`)
      
    }
  }

  const saveConfig = async () => {
    Config.setApiUrl(apiUrl);
    Config.setPosName(posName);

    
    const GetapiUrl = await Config.getApiUrl();
    const GetposName = await Config.getPosName();
    
    if(GetapiUrl && GetposName){
      Alert.alert("Success","Saved")
    }else{
      Alert.alert("Warning","Unable to save \nMake sure to fill all fields")
    }

  }

  return (
    <View style={styles.container}>
      {/* Top bar with back and edit */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.header}>Settings</Text>

        <TouchableOpacity onPress={() => {
          setIsEditing(!isEditing)
          if (isEditing) {
            saveConfig();
          }
        }} style={styles.iconButton}>

          <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* API URL */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>API URL</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            placeholder="Enter API URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            
          />
        ) : (
          <Text style={styles.displayText}>{apiUrl}</Text>
        )}
      </View>

      {/* POS Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>POS Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            placeholder="Enter POS Name"
            value={posName}
            onChangeText={setPosName}
          />
        ) : (
          <Text style={styles.displayText}>{posName}</Text>
        )}
      </View>

      {/* Test Button (only active in edit mode or always?) */}
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
