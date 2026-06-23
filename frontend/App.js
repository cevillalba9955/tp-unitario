import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MyServicesScreen from './src/screens/freelancer/MyServicesScreen';
import CreateServiceScreen from './src/screens/freelancer/CreateServiceScreen';
import EditServiceScreen from './src/screens/freelancer/EditServiceScreen';
import { setToken } from './src/api/config';

// Para desarrollo: configurar un token JWT de prueba aquí
// En producción, el token se recibe del flujo de autenticación
setToken(process.env.EXPO_PUBLIC_DEV_TOKEN || 'TU_JWT_TOKEN_AQUI');

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="MyServices">
          <Stack.Screen
            name="MyServices"
            component={MyServicesScreen}
            options={{ title: 'Mis Servicios' }}
          />
          <Stack.Screen
            name="CreateService"
            component={CreateServiceScreen}
            options={{ title: 'Nuevo Servicio' }}
          />
          <Stack.Screen
            name="EditService"
            component={EditServiceScreen}
            options={{ title: 'Editar Servicio' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
