import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import tw from "twrnc"
import CustomImage from '../../CustomImage';
import { useNavigation } from '@react-navigation/native';

const SongItem = ({ data }) => {
    // console.log(data,"data");
    const navigation = useNavigation()
    function resizeImageUrl(url, width = 2000, height = 2000) {
        return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
    }
    return (
        <View style={tw`flex-row`}>
            <TouchableOpacity onPress={() => navigation.navigate('Screens', {
                screen: 'MusicPlayer',
                params: {
                    item: {
                        title: data.name,
                        thumbnailUrl: data.thumbnails[0].url,
                        youtubeId: data.videoId
                    }
                }
            })}>
                <CustomImage imageSrc={resizeImageUrl(data.thumbnails[0].url)} />
                <Text>{data.name},   </Text>
            </TouchableOpacity>
        </View>
    )
}

export default SongItem