import * as SecureStore from "expo-secure-store";

const KEYS = {
  API_URL: "API_URL",
  POS_NAME: "POS_NAME",
};

const Config = {
  // ===== API URL =====
  setApiUrl: async (url) => {
    try {
      await SecureStore.setItemAsync(KEYS.API_URL, String(url));
    } catch (error) {
      console.error("Error saving API URL:", error);
    }
  },

  getApiUrl: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.API_URL);
    } catch (error) {
      console.error("Error getting API URL:", error);
      return null;
    }
  },

  deleteApiUrl: async () => {
    try {
      await SecureStore.deleteItemAsync(KEYS.API_URL);
    } catch (error) {
      console.error("Error deleting API URL:", error);
    }
  },

  // ===== POS NAME =====
  setPosName: async (name) => {
    try {
      await SecureStore.setItemAsync(KEYS.POS_NAME, String(name));
    } catch (error) {
      console.error("Error saving POS name:", error);
    }
  },

  getPosName: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.POS_NAME);
    } catch (error) {
      console.error("Error getting POS name:", error);
      return null;
    }
  },

  deletePosName: async () => {
    try {
      await SecureStore.deleteItemAsync(KEYS.POS_NAME);
    } catch (error) {
      console.error("Error deleting POS name:", error);
    }
  },

  // ===== Clear All Configs =====
  clearAll: async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.API_URL),
        SecureStore.deleteItemAsync(KEYS.POS_NAME),
      ]);
    } catch (error) {
      console.error("Error clearing config:", error);
    }
  },
};

export default Config;
