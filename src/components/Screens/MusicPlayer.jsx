import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenContainer from '../ScreenContainer'
import { getColors } from 'react-native-image-colors'
import tw from 'twrnc'
const MusicPlayer = ({ route }) => {
  const { item } = route.params ?? {}
  console.log(item, 'item')
  const [colors, setColors] = useState(null)

  useEffect(() => {
    const url = item.thumbnailUrl

    getColors(url, {
      fallback: '#000000',
      cache: true,
      key: url,
    }).then(setColors)
  }, [])

  return (
    <ScreenContainer>
      <View style={tw`flex-row justify-center`}>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.average}]}></View>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.darkMuted}]}></View>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.darkVibrant}]}></View>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.dominant}]}></View>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.lightMuted}]}></View>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.lightVibrant}]}></View>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.muted}]}></View>
        <View style={[tw`h-20 border w-1/8`,{backgroundColor:colors?.vibrant}]}></View>
      </View>
    </ScreenContainer>
  )
}

export default MusicPlayer