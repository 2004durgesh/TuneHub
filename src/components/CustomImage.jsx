import { View, Text, Image } from 'react-native'
import FastImage from 'react-native-fast-image'
import tw from "twrnc"
import React from 'react'
import { resizeImageUrl } from '../utils/imageUtils'

const CustomImage = ({ imageSrc, style, type, resizeMode = 'cover' }) => {
  
  return (
    <FastImage
      source={{ 
        uri: resizeImageUrl(imageSrc), 
        priority: FastImage.priority.high
        }}
      style={[tw`h-20 w-20 ${type === 'artists' ? 'rounded-full' : 'rounded-md'} ${style}`]}
      resizeMode={FastImage.resizeMode[resizeMode]}
      progressiveRenderingEnabled={true}
    />
  )
}

export default CustomImage