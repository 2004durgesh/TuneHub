import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from "twrnc"
import CustomImage from '../../CustomImage';
import { useControlFooter } from '../../../context/ControlFooterContext';
import TrackPlayer from 'react-native-track-player';
import { useTrackPlayer } from '../../../context/TrackPlayerContext';
import ytdl from 'react-native-ytdl'
const textAttributes = {
    style: tw`text-gray-300 text-xs w-75`,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
}
const SongItem = ({ data }) => {
    const { setImageUrl, setSongName, setArtistName, setYoutubeId, setDataType, setHideFooter } = useControlFooter()
    const { isPlayerReady, addTrack, play, reset,stop } = useTrackPlayer()
    function resizeImageUrl(url, width = 2000, height = 2000) {
        if (!url) {
            return 'https://unsplash.com/photos/a-black-and-white-photo-of-a-black-surface-ilVYjf0J378';
        }
        return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);

    }
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
        const youtubeURL = `http://www.youtube.com/watch?v=${data.videoId}`;
        const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
        let info = await ytdl.getBasicInfo(data.videoId);
        await addTrack({
          id: data.videoId,
          url: urls[0].url,
          title: data.name,
          artist: data.artist.name,
          artwork: resizeImageUrl(data.thumbnails[0].url),
          duration: info.videoDetails.lengthSeconds,
        });
        await play()
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