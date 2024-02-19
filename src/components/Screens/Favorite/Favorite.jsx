import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, Suspense } from 'react'
import tw from "twrnc"
import ScreenContainer from '../../ScreenContainer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemListCards from '../../ItemListCards';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTrackPlayer } from '../../../context/TrackPlayerContext';
import { useControlFooter } from '../../../context/ControlFooterContext';
import { getYoutubeAudioDuration, getYoutubeAudioUrl } from '../../../utils/ytdlUtils';
import { resizeImageUrl } from '../../../utils/imageUtils';
import TrackPlayer,{Event} from 'react-native-track-player';

const Favorite = () => {
    const [favoriteData, setFavoriteData] = useState([])
    const { setImageUrl, setSongName, setArtistName, setYoutubeId, setDataType, setHideFooter } = useControlFooter()
    const { isPlayerReady, addTrack, play, reset, stop } = useTrackPlayer()
    useEffect(() => {
        const fetchData = async () => {
            const storedData = await AsyncStorage.getItem('favoriteSongs');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                console.log(parsedData, "favoriteData")
                setFavoriteData(parsedData);
            }
        };
        fetchData();
    }, []);
    
    useEffect(() => {
        const fetchTracks = async () => {
            if (favoriteData) {
                const trackPromises = favoriteData.map(async (item) => {
                    return {
                        id: item.youtubeId,
                        url: await getYoutubeAudioUrl(item.youtubeId),
                        title: item.title,
                        artist: item.artistName,
                        artwork: resizeImageUrl(item.thumbnailUrl),
                        duration: await getYoutubeAudioDuration(item.youtubeId)
                    }
                });
                const tracks = await Promise.all(trackPromises);
                console.log(tracks, "tracks");
                await reset()
                await addTrack(tracks);
            }
        };
        fetchTracks();
    }, [favoriteData]);


    useEffect(() => {
        const trackChangedListener = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async () => {
          const index = await TrackPlayer.getActiveTrackIndex();
          console.log(index, "index");
          setImageUrl(favoriteData[index].thumbnailUrl);
          setSongName(favoriteData[index].title);
          setYoutubeId(favoriteData[index].youtubeId);
          setArtistName(favoriteData[index].artistName);
          setDataType("musics");
          setHideFooter(false)
          console.log(favoriteData[index], "favoriteData[index]");
        });
        return () => {
            // Don't forget to remove the event listener when the component is unmounted
            trackChangedListener.remove();
          };
        }, [favoriteData]);
    return (
        <>
            <ScreenContainer>
                <View style={tw`items-center justify-center`}>
                    <TouchableOpacity onPress={play} style={tw`bg-white w-15 h-15 items-center justify-center rounded-full`}>
                        <Ionicons name={'play'} size={25} color='black' />
                    </TouchableOpacity>
                </View>
                {favoriteData.length > 0 ? <ItemListCards data={favoriteData} dataType="musics" /> : <Text>No favorite songs</Text>}
            </ScreenContainer>
        </>
    )
}

export default Favorite