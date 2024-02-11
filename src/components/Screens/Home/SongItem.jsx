import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import tw from "twrnc"
import CustomImage from '../../CustomImage';
import { useControlFooter } from '../../../context/ControlFooterContext';
import TrackPlayer from 'react-native-track-player';
const textAttributes = {
    style: tw`text-gray-300 text-xs w-75`,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
}
const SongItem = ({ data }) => {
    const { setImageUrl, setSongName, setArtistName,setYoutubeId,setDataType,setHideFooter} = useControlFooter()
    return (
        <View style={tw`flex-row`}>
            <TouchableOpacity onPress={() => { setImageUrl(data.thumbnails[0].url), setSongName(data.name), setArtistName(data.artist.name),setYoutubeId(data.videoId),setDataType("musics"),setHideFooter(false)}}>
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