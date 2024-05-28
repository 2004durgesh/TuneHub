import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityIndicator, SafeAreaView, View,Image,Text } from 'react-native';
import LottieView from 'lottie-react-native';
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
  const { isPlayerReady, setupPlayer } = useTrackPlayer();
  // const navigation = useNavigation();
  const theme = useTheme();
  SystemNavigationBar.setNavigationColor(theme.colors.primaryContainer);
  useEffect(() => {
    setupPlayer();
  }, []);

  if (!isPlayerReady) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-black`}>
      {/* Add a logo or an image */}
      <Image
        source={{uri:"https://cdn-icons-png.flaticon.com/512/4812/4812505.png"}}
        style={tw`w-20 h-20 mb-4`}
        resizeMode="contain"
      />
      {/* Animated loading indicator */}
      <LottieView
        source={require('./assets/lottie/player-loading.lottie')}
        autoPlay
        loop
        speed={2}
        style={tw`w-100 aspect-1/1 mb-4 bg-white`}
      />
      <Text style={tw`text-white text-lg mb-2`}>Loading, please wait...</Text>
      <Text style={tw`text-gray-400 text-sm text-center mt-2`}>
        This might take a few seconds. Thank you for your patience.
      </Text>
    </View>
    );
  }

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
