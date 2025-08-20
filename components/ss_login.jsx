import * as SecureStore from "expo-secure-store";

const USER_KEY = "logged_user";

//  Save user info (after login)
export async function saveUser(user) {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    console.log(" User saved to SecureStore");
    return true;
  } catch (error) {
    console.error(" Save user error:", error);
    return false;
  }
}

//  Get saved user info
export async function getUser() {
  try {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error(" Get user error:", error);
    return null;
  }
}

//  Clear saved user (logout)
export async function clearUser() {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
    console.log(" User cleared");
    return true;
  } catch (error) {
    console.error(" Clear user error:", error);
    return false;
  }
}
