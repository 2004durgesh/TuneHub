import { Button, View, Alert, Text, Image, NativeModules } from 'react-native'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import ScreenContainer from '../ScreenContainer'
import { getColors } from 'react-native-image-colors'
import tw from 'twrnc'
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper'
import Controls from '../Controls'
import TrackPlayer, { Event } from 'react-native-track-player'
import ytdl from 'react-native-ytdl'
import { useTrackPlayer } from '../../context/TrackPlayerContext'
const MusicPlayer = ({ route }) => {
  // const playerRef = useRef();
  const { item } = route.params ?? {}
  console.log(item, "item")
  const theme = useTheme()
  const { isPlayerReady, addTrack } = useTrackPlayer();
  const [colors, setColors] = useState(null)
  function resizeImageUrl(url, width = 2000, height = 2000) {
    return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
  }

  useEffect(() => {
    const setupAndPlayTrack = async () => {
      if (!isPlayerReady) {
        return;
      }

      const youtubeURL = `http://www.youtube.com/watch?v=${item.youtubeId}`;
      const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
      let info = await ytdl.getBasicInfo(item.youtubeId);
      console.log(info, "info");

      // Reset the player
      await TrackPlayer.reset();

      // Add the new track
      await addTrack({
        url: urls[0].url,
        title: item.title,
        artwork: resizeImageUrl(item.thumbnailUrl),
        duration: info.videoDetails.lengthSeconds,
      });
      // Start playing the new track
      await TrackPlayer.play();
    };


    setupAndPlayTrack();
  }, [isPlayerReady, addTrack, item]);

  useEffect(() => {
    const url = item.thumbnailUrl;

    getColors(url, {
      fallback: theme.colors.primary,
      cache: true,
      key: url,
    }).then(setColors);
  }, [item, theme.colors.primary]);

  return (
    <ScreenContainer>
      <View style={tw`flex-row justify-center`}>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.average }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.darkMuted }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.darkVibrant }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.dominant }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.lightMuted }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.lightVibrant }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.muted }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.vibrant }]}></View>
      </View>
      <LinearGradient
        colors={[colors?.vibrant || theme.colors.primary, colors?.darkVibrant || theme.colors.primary]}
        style={tw`flex-1 p-4`}
      >
        <View style={tw`h-150 justify-center items-center`}>
          <Image
            source={{ uri: resizeImageUrl(item.thumbnailUrl) }}
            style={tw`w-full h-full`}
            resizeMode='contain'
          />
          <Controls />
        </View>
      </LinearGradient>

    </ScreenContainer>
  )
}

export default MusicPlayer