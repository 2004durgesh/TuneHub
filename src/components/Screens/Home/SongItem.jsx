import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import tw from "twrnc"
import CustomImage from '../../CustomImage';
import { useNavigation } from '@react-navigation/native';

const textAttributes = {
    style: tw`text-gray-300 text-xs w-75`,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
}
const SongItem = ({ data }) => {
    const navigation = useNavigation()
    function resizeImageUrl(url, width = 2000, height = 2000) {
        return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);
    }
    return (
        <View style={tw`flex-row`}>
            <TouchableOpacity onPress={() => navigation.navigate('Search', {
                screen: 'MusicPlayer',
                params: {
                    title: data.name,
                    thumbnailUrl: data.thumbnails[0].url,
                    youtubeId: data.videoId
                }
            })}>
                <View style={tw`flex-row items-center gap-4 p-2`}>
                    <CustomImage imageSrc={data.thumbnails[0].url} />
                    <View>
                        <Text style={tw`text-white font-bold w-80`} numberOfLines={1} ellipsizeMode='tail'>{data.name}</Text>
                        <Text {...textAttributes}>{data.artist.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default SongItem