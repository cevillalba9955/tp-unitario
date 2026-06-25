import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './src/screens/freelancer/LoginScreen';
import MyServicesScreen from './src/screens/freelancer/MyServicesScreen';
import CreateServiceScreen from './src/screens/freelancer/CreateServiceScreen';
import BuyerLoginScreen from './src/screens/buyer/BuyerLoginScreen';
import BuyerCatalogScreen from './src/screens/buyer/BuyerCatalogScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BuyerLogin">
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
          <Stack.Screen
            name="BuyerLogin"
            component={BuyerLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BuyerCatalog"
            component={BuyerCatalogScreen}
            options={{
              title: 'Catálogo',
              headerStyle: { backgroundColor: '#7b1fa2' },
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
