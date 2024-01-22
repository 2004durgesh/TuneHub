import { View, Text, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenContainer from '../ScreenContainer'
import { getColors } from 'react-native-image-colors'
import tw from 'twrnc'
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper'
const MusicPlayer = ({ route }) => {
  const { item } = route.params ?? {}
  console.log(item, 'item')
  const theme = useTheme()
  const [colors, setColors] = useState(null)
  function resizeImageUrl(url, width, height) {
    return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
  }

  // const newUrl = resizeImageUrl(item.thumbnailUrl, 500, 500);
  useEffect(() => {
    const url = item.thumbnailUrl
    getColors(url, {
      fallback: theme.colors.primary,
      cache: true,
      key: url,
    }).then(setColors)
  }, [])

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
      <View style={tw`flex items-center justify-center p-4`}>
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']}>
          <View style={tw`h-full w-full`}>
            <Image source={{ uri: resizeImageUrl(item.thumbnailUrl, 500, 500) }} style={tw`w-full h-full`} resizeMode='contain' />
          </View>
        </LinearGradient>
      </View>
    </ScreenContainer>
  )
}

export default MusicPlayer