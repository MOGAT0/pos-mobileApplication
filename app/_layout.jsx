import React from 'react';

import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false ,statusBarHidden: true}}/>
      <Stack.Screen name='loginAs' options={{ headerShown: false ,statusBarHidden: true}}/>
      <Stack.Screen name='adminLogin' options={{ headerShown: false ,statusBarHidden: true}}/>
      <Stack.Screen name='dashboardTab' options={{ headerShown: false ,statusBarHidden: true}}/>
      <Stack.Screen name="login" options={{ headerShown: false ,statusBarHidden: true}} />
      <Stack.Screen name="MainScreen" options={{ headerShown: false ,statusBarHidden: true}} />
      <Stack.Screen name="newTransaction" options={{ headerShown: false,statusBarHidden: true}} />
      <Stack.Screen name="ongoingTransactions" options={{ headerShown: false,statusBarHidden: true}} />
      <Stack.Screen name="forgotPass" options={{ headerShown: false,statusBarHidden: true }} />
      <Stack.Screen name="signup" options={{ headerShown: false,statusBarHidden: true }} />
      <Stack.Screen name="setting" options={{ headerShown: false,statusBarHidden: true}} />
      <Stack.Screen name="editTransaction" options={{ headerShown: false,statusBarHidden: true}}/>
    </Stack>
  );
};

export default RootLayout;
