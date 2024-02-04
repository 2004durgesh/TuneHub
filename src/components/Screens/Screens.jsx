import { View, Text, SafeAreaView, BackHandler } from 'react-native'
import { useEffect, useState,Suspense } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { useSearch } from '../../context/SearchContext';
import { useSegmentedButton } from '../../context/SegmentedButtonContext';
import { Musics, Albums, Playlists, Artists } from './SegmentedScreens';
import MusicPlayer from './MusicPlayer';
import ScreenContainer from '../ScreenContainer';
import SearchBar from './SearchBar';
const Stack = createStackNavigator();


const Screens = ({ navigation }) => {
  const { data, isLoading, error, searchQuery, setSearchQuery } = useSearch()
  const { setActiveSegment, } = useSegmentedButton()
  setActiveSegment('Musics')

  return (
    <ScreenContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animationEnabled: false, gestureEnabled: true }}
      >
        <Stack.Screen name="SearchBar" component={SearchBar} />
        <Stack.Screen name="Musics" component={Musics} />
        <Stack.Screen name="Albums" component={Albums} />
        <Stack.Screen name="Playlists" component={Playlists} />
        <Stack.Screen name="Artists" component={Artists} />
        <Stack.Screen name="MusicPlayer" component={MusicPlayer} />
      </Stack.Navigator>
    </ScreenContainer>
  );
};

export default Screens;
