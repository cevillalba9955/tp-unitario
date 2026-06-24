import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './src/screens/freelancer/LoginScreen';
import MyServicesScreen from './src/screens/freelancer/MyServicesScreen';
import CreateServiceScreen from './src/screens/freelancer/CreateServiceScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyServices"
            component={MyServicesScreen}
            options={{ title: 'Mis Servicios', headerLeft: null }}
          />
          <Stack.Screen
            name="CreateService"
            component={CreateServiceScreen}
            options={{ title: 'Nuevo Servicio' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
