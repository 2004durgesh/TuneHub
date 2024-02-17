import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from "twrnc"
import CustomImage from '../../CustomImage';
import { useControlFooter } from '../../../context/ControlFooterContext';
import TrackPlayer from 'react-native-track-player';
import { useTrackPlayer } from '../../../context/TrackPlayerContext';
import ytdl from 'react-native-ytdl'
import { getYoutubeAudioUrl, getYoutubeAudioDuration } from '../../../utils/ytdlUtils';
import { resizeImageUrl } from '../../../utils/imageUtils';
const textAttributes = {
    style: tw`text-gray-300 text-xs w-75`,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
}
const SongItem = ({ data }) => {
    const { setImageUrl, setSongName, setArtistName, setYoutubeId, setDataType, setHideFooter } = useControlFooter()
    const { isPlayerReady, addTrack, play, reset, stop } = useTrackPlayer()

    const handleOnPress = async () => {
        if (!isPlayerReady) {
            return;
        }
        setImageUrl(data.thumbnails[0].url);
        setSongName(data.name);
        setArtistName(data.artist.name);
        setYoutubeId(data.videoId);
        setDataType("musics");
        setHideFooter(false)
        // await stop()
        await reset()
        // const youtubeURL = `http://www.youtube.com/watch?v=${data.videoId}`;
        // const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
        // let info = await ytdl.getBasicInfo(data.videoId);
        await addTrack({
            id: data.videoId,
            url: await getYoutubeAudioUrl(data.videoId),
            title: data.name,
            artist: data.artist.name,
            artwork: resizeImageUrl(data.thumbnails[0].url),
            duration: await getYoutubeAudioDuration(data.videoId)
        });
        await play()
        console.log("songitem clicked");
    };

    return (
        <View style={tw`flex-row`}>
            <TouchableOpacity onPress={handleOnPress}>
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