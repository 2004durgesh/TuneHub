import { View, Text,ScrollView } from 'react-native'
import tw from 'twrnc'
import { useTheme } from 'react-native-paper'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'
import { useSearch } from '../context/SearchContext';
import ScreenContainer from './ScreenContainer';
const Loading = ({ dataType }) => {
  console.log("style",dataType)
  const theme = useTheme()
  const { isLoading } = useSearch()
  return (
    <ScreenContainer>
    <ScrollView>
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={tw`flex-row items-center gap-4 p-2`}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={[tw`h-20 w-20 ${dataType === 'artists' ? 'rounded-full' : 'rounded-md'} `]}
          />
          <View style={tw`gap-2`}>
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={[tw`rounded-full w-full`]}
            />
            <View style={tw`flex-row items-center gap-2`}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={[tw`rounded-full`]}
                width={100}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={[tw`rounded-full`]}
                width={100}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
      
    </ScreenContainer>
  )
}

export default Loading