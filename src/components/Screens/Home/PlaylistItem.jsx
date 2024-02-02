import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import tw from "twrnc"
import CustomImage from '../../CustomImage';
import { useNavigation } from '@react-navigation/native';


const PlaylistItem = ({data}) => {
  const navigation = useNavigation()
    function resizeImageUrl(url, width = 2000, height = 2000) {
        return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
    }
  return (
    <View style={tw`flex-row`}>
            <TouchableOpacity 
            onPress={()=>{Alert.alert('This feature is not available yet')}}
            // onPress={() => navigation.navigate('Screens', {
            //     screen: 'MusicPlayer',
            //     params: {
            //         title: data.name,
            //         thumbnailUrl: data.thumbnails[0].url,
            //         youtubeId: data.videoId
            //     }
            // })}
            >
                <View style={tw`flex-row items-center gap-4 p-2`}>
                    <CustomImage imageSrc={data.thumbnails[0].url} />
                    <View>
                        <Text style={tw`text-white font-bold w-80`} numberOfLines={1} ellipsizeMode='tail'>{data.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
  )
}

export default PlaylistItem