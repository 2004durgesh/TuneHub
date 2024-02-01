import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import tw from "twrnc"

const PlaylistItem = ({data}) => {
  return (
    <View style={tw`flex-row`}>
            <Text>{data.name},   </Text>
        </View>
  )
}

export default PlaylistItem