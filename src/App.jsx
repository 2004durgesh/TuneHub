import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityIndicator, SafeAreaView, View } from 'react-native';
import tw from 'twrnc';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useTheme } from 'react-native-paper';
import Home from './components/Screens/Home/Home';
import Screens from './components/Screens/Screens'
import { useTrackPlayer } from './context/TrackPlayerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Favorite from './components/Screens/Favorite/Favorite';
const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const { setupPlayer } = useTrackPlayer();
  // const navigation = useNavigation();
  const theme = useTheme();
  SystemNavigationBar.setNavigationColor(theme.colors.primaryContainer);
  useEffect(() => {
    setupPlayer();
  }, []);

  return (
    <>
      {/* <View style={tw`relative`}> */}

      <GestureHandlerRootView style={tw`flex-1`}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
        <NavigationContainer>
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
              name="Search"
              component={Screens}
              options={({ navigation }) => ({
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons name={focused ? 'search' : 'search-outline'} size={25} color={color}
                    onPress={() => navigation.navigate('SearchBar')}
                  />
                ),
              })}
            />
            <Tab.Screen
              name="Favorites"
              component={Favorite}
              options={{
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons name={focused ? 'heart' : 'heart-outline'} size={25} color={color} />
                ),
              }}
            />
            {/* <Tab.Screen
              name="Settings"
              component={Screens}
              options={{
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons name={focused ? 'settings' : 'settings-outline'} size={25} color={color} />
                ),
              }}
            /> */}
          </Tab.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
      {/* </View> */}
    </>
  );



};

export default App;
