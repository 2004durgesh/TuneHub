import { View, Text, SafeAreaView, BackHandler } from 'react-native'
import { useEffect, useState, Suspense } from 'react'
import tw from 'twrnc'
import { createStackNavigator } from '@react-navigation/stack';
import { useSearch } from '../../context/SearchContext';
import { useSegmentedButton } from '../../context/SegmentedButtonContext';
import { Musics, Albums, Playlists, Artists } from './SegmentedScreens';
import { useTheme } from 'react-native-paper';
import SearchBar from './SearchBar';
import { MusicPlayer,ArtistInfo,AlbumInfo,PlaylistInfo } from './Media';
const Stack = createStackNavigator();


const Screens = ({ navigation }) => {
  const theme = useTheme()
  // const { data, isLoading, error, searchQuery, setSearchQuery } = useSearch()
  // const { setActiveSegment, } = useSegmentedButton()
  // setActiveSegment('Musics')

  return (
    <>
      <>
        <Stack.Navigator
          screenOptions={{ headerShown: false, animationEnabled: false, gestureEnabled: true }}
        >
          <Stack.Screen name="SearchBar" component={SearchBar} />
          <Stack.Screen name="Musics" component={Musics} />
          <Stack.Screen name="Albums" component={Albums} />
          <Stack.Screen name="Playlists" component={Playlists} />
          <Stack.Screen name="Artists" component={Artists} />
          <Stack.Screen name="MusicPlayer" component={MusicPlayer} />
          <Stack.Screen name="ArtistInfo" component={ArtistInfo} />
          <Stack.Screen name="AlbumInfo" component={AlbumInfo} />
          <Stack.Screen name="PlaylistInfo" component={PlaylistInfo} />
        </Stack.Navigator>
      </>
    </>
  );
};

export default Screens;
