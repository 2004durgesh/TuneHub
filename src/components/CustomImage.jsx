import { View, Text, Image } from 'react-native'
import tw from "twrnc"
import React from 'react'

const CustomImage = ({ imageSrc, style, type, resizeMode }) => {
  function resizeImageUrl(url, width = 2000, height = 2000) {
    return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
  }
  return (
    <Image
      source={{ uri: resizeImageUrl(imageSrc) }}
      style={tw`h-20 w-20 ${type === 'artists' ? 'rounded-full' : 'rounded-md'} ${style}`}
      resizeMode={resizeMode}
    />
  )
}

export default CustomImage