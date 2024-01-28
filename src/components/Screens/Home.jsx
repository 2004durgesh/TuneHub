import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import tw from "twrnc"
import { useTheme } from 'react-native-paper'
import ScreenContainer from '../ScreenContainer'

const Home = () => {

  const theme = useTheme()
  return (
    <ScreenContainer>
      <View style={tw`flex-row justify-center`}>
        <Text style={tw`text-white`}>Home</Text>
      </View>
    </ScreenContainer>
  )
}

export default Home