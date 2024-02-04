import { View, Text, Image } from 'react-native'
import FastImage from 'react-native-fast-image'
import tw from "twrnc"
import React from 'react'

const CustomImage = ({ imageSrc, style, type, resizeMode = 'cover' }) => {
  function resizeImageUrl(url, width = 2000, height = 2000) {
    if (!url) {
      return ''; // return a default image URL or an empty string
    }
    return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
  
  }
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