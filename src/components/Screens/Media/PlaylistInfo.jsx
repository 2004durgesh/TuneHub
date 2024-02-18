import { View, Text, ImageBackground, Image, StatusBar, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from 'twrnc'
import { useTheme } from 'react-native-paper'
import { BlurView } from "@react-native-community/blur"
import ScreenContainer from '../../ScreenContainer'
import { getColors } from 'react-native-image-colors'
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios'
import moment from 'moment'
import { useControlFooter } from '../../../context/ControlFooterContext'
import { useTrackPlayer } from '../../../context/TrackPlayerContext'
import { getYoutubeAudioUrl } from '../../../utils/ytdlUtils'
import ytdl from 'react-native-ytdl'
import TrackPlayer, { Event } from 'react-native-track-player'
import { useSharedValue } from 'react-native-reanimated';
import { useImageColors } from '../../../utils/useImageColors'
import AnimatedScrollView from '../../AnimatedScrollView'
import { act } from 'react-test-renderer'
const PlaylistInfo = ({ route }) => {
  const params = route.params ?? {}
  console.log(params, "params")
  const { setImageUrl, setSongName, setArtistName, setYoutubeId, setDataType, setHideFooter } = useControlFooter()
  const { isPlayerReady, addTrack, play, reset, stop } = useTrackPlayer()
  const [data, setData] = useState({})
  const theme = useTheme()


  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`https://yt-music-api-zeta.vercel.app/playlists/${params.playlistId}`)
      setData(data)
      console.log(data, "data");
      return data
    }
    fetchData()
  }, [])

  const totalDuration = (data && data.videos?.reduce((acc, item) => acc + item.duration, 0)) / 1000
  console.log(totalDuration, "totalDuration");

  const formatDurationString = (seconds) => {
    const duration = moment.duration(seconds, 'seconds');
    let format = seconds > 3600 ? `${duration.hours()} hours ${duration.minutes()} minutes ${duration.seconds()} seconds` :
      `${duration.minutes()} minutes ${duration.seconds()} seconds`;
    return format;
  };

  const secondToMinute = (seconds) => {
    let format = seconds > 3600 ? "hh:mm:ss" : "mm:ss"
    return moment.utc(seconds * 1000).format(format)
  }

  useEffect(() => {
    const fetchAndAddTracks = async () => {
      try {
        if (data) {
          const trackPromises = data && data.videos?.map(async (item) => {

            return {
              title: item.title,
              artist: item.channel.name,
              artwork: item.thumbnail.url,
              id: item.id,
              duration: (item.duration) / 1000,
              url: await getYoutubeAudioUrl(item.id),
            };
          });

          const tracks = await Promise.all(trackPromises);
          console.log(tracks, "tracks");
          // await stop()
          await reset()
          await addTrack(tracks);
          // await play();
        }
      } catch (error) {
        console.error("Error fetching and adding tracks:", error);
      }
    };

    fetchAndAddTracks();
  }, [data]);

  useEffect(() => {
    const trackChangedListener = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async () => {
      const index = await TrackPlayer.getActiveTrackIndex();
      const activeTrack = await TrackPlayer.getActiveTrack()
      console.log(activeTrack, "activeTrack");
      setImageUrl(data.videos[index].thumbnail.url);
      setSongName(data.videos[index].title);
      setYoutubeId(data.videos[index].id);
      setArtistName(data.videos[index].channel.name);
      setDataType("musics");
      setHideFooter(false)
      console.log(data.videos[index], "data.videos[index]");
    });

    return () => {
      // Don't forget to remove the event listener when the component is unmounted
      trackChangedListener.remove();
    };
  }, [data]);
  const { vibrant } = useImageColors(params.thumbnailUrl)


  return (
    <ScreenContainer>
      <AnimatedScrollView>
        <ImageBackground
          source={{ uri: params.thumbnailUrl }}
          style={tw`h-100`}>
          <BlurView
            style={tw`absolute top-0 left-0 right-0 h-100`}
            blurType="dark"
            blurAmount={5}
            reducedTransparencyFallbackColor={vibrant || "black"}
          />
          <LinearGradient
            colors={["transparent", "black"]}
            style={tw`h-100`}>
            <View style={tw`flex-1 justify-center items-center`}>
              <Text style={tw`text-white text-xs mb-8 mt-20`}>{data && data.channel?.name}</Text>
              {/* <Text style={tw`text-white text-xs mb-4`}>{params.type} . {params.year}</Text> */}
              <Image
                source={{ uri: params.thumbnailUrl }}
                resizeMode='contain'
                style={[tw`h-60 z-500 rounded-md`, { aspectRatio: 1 / 1 }]}
              />
              <Text style={tw`text-white text-3xl font-bold mt-4`} numberOfLines={3}>{params.title}</Text>
              <TouchableOpacity onPress={play} style={tw`bg-white w-15 h-15 items-center justify-center rounded-full`}>
                <Ionicons name={'play'} size={25} color='black' />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={tw`mt-15`}>
          {data && data.videos?.map((item, index) => (
            <View key={index} style={tw`flex-row items-center`}>
              <Image
                source={{ uri: item.thumbnail.url }}
                resizeMode='contain'
                style={[tw`h-15 rounded-md`, { aspectRatio: 1 / 1 }]}
              />
              <TouchableOpacity style={tw`p-2`} onPress={() => {
                setImageUrl(item.thumbnail.url);
                setSongName(item.title || item.name);
                setYoutubeId(item.id);
                setArtistName(item.channel.name);
                setDataType("musics")
                setHideFooter(false)
              }}>
                <Text style={tw`text-white font-bold w-90`} numberOfLines={2}>{item.title}</Text>
                <Text style={tw``} numberOfLines={1}>{item.channel.name} . {secondToMinute((item.duration) / 1000)}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={tw`text-center`}>{data && data.videos?.length} tracks . {formatDurationString(totalDuration)}</Text>
        </View>
      </AnimatedScrollView>
    </ScreenContainer>
  )
}

export default PlaylistInfo