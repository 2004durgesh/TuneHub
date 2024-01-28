import { Button, View, Alert, Text, Image, NativeModules } from 'react-native'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import ScreenContainer from '../ScreenContainer'
import { getColors } from 'react-native-image-colors'
import tw from 'twrnc'
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper'
import Controls from '../Controls'
import YoutubePlayer from "react-native-youtube-iframe";
import { WebView } from 'react-native-webview'

const MusicPlayer = ({ route }) => {
  console.log("native modules", NativeModules)
  const playerRef = useRef();
  const { item } = route.params ?? {}
  console.log(item, "item")
  const theme = useTheme()
  const [colors, setColors] = useState(null)
  function resizeImageUrl(url, width, height) {
    return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
  }
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);
  useEffect(() => {
    const url = item.thumbnailUrl
    getColors(url, {
      fallback: theme.colors.primary,
      cache: true,
      key: url,
    }).then(setColors)
  }, [])
  if (!item) {
    return <ScreenContainer>
      <Text>no item</Text>
    </ScreenContainer>
  }
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
            source={{ uri: resizeImageUrl(item.thumbnailUrl, 1000, 1000) }}
            style={tw`w-full h-full`}
            resizeMode='contain'
          />
          <YoutubePlayer
            ref={playerRef}
            height={0}
            width={0}
            play={playing}
            videoId={item.youtubeId}
            onChangeState={onStateChange}
            forceAndroidAutoplay={true}
          />
         
          <Controls playerRef={playerRef} duration={item.duration.totalSeconds} isPlaying={playing} setPlaying={setPlaying} state={onStateChange} />
        </View>
      </LinearGradient>

    </ScreenContainer>
  )
}

export default MusicPlayer