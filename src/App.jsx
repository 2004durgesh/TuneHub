import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar} from 'react-native';
import tw from 'twrnc';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useTheme } from 'react-native-paper';
import Home from './components/Screens/Home';
import Screens from './components/Screens/Screens';
const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const theme = useTheme();
  SystemNavigationBar.setNavigationColor(theme.colors.primaryContainer);
  return (
    <>
      <NavigationContainer>
        <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
        <Tab.Navigator
          activeColor="white"
          inactiveColor='#c6c6d1'
          barStyle={{ backgroundColor: theme.colors.primaryContainer, height: 70 }}
        >
          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? 'home' : 'home-outline'} size={25} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Screens"
            component={Screens}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? 'search' : 'search-outline'} size={25} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Playlist"
            component={Screens}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <MaterialCommunityIcons name={focused ? 'playlist-music' : 'playlist-music-outline'} size={25} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={Screens}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? 'heart' : 'heart-outline'} size={25} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
