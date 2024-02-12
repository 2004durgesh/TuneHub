import { View, Text, ImageBackground, Image, StatusBar, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from 'twrnc'
import { useTheme } from 'react-native-paper'
import { BlurView } from "@react-native-community/blur"
import ScreenContainer from '../../ScreenContainer'
import { getColors } from 'react-native-image-colors'
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios'
import moment from 'moment'
import { useControlFooter } from '../../../context/ControlFooterContext'
import ytdl from 'react-native-ytdl'
import TrackPlayer, { Event } from 'react-native-track-player'
import { useTrackPlayer } from '../../../context/TrackPlayerContext'
import {useSharedValue} from 'react-native-reanimated';

const PlaylistInfo = ({ route }) => {
  const params = route.params ?? {}
  console.log(params, "params")
  const { setImageUrl, setSongName, setArtistName, setYoutubeId, setDataType, setHideFooter } = useControlFooter()
  const { isPlayerReady, addTrack, play, reset, stop } = useTrackPlayer()
  const [colors, setColors] = useState(null)
  const [data, setData] = useState([])
  const theme = useTheme()
  const [bgColor, setBgColor] = useState("transparent")
  const translateY = useSharedValue(0);

  
  const scrollHandler = (event) => {
    translateY.value = event.nativeEvent.contentOffset.y;
    if (translateY.value > 300) {
      setBgColor("black")
    } else {
      setBgColor("transparent")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`https://yt-music-api-zeta.vercel.app/playlists/${params.playlistId}`)
      setData(data)
      console.log(data, "data");
      return data
    }
    fetchData()
  }, [])

  const totalDuration = data && data.videos?.reduce((acc, item) => acc + item.duration, 0)
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
          const trackPromises =data&& data.videos?.map(async (item) => {
            const urls = await ytdl(`http://www.youtube.com/watch?v=${item.id}`, { quality: 'highestaudio' });

            return {
              title: item.title,
              artist: item.channel.name,
              artwork: item.thumbnail.url,
              id: item.id,
              duration: (item.duration) / 1000,
              url: urls[0].url,
            };
          });

          const tracks = await Promise.all(trackPromises);
          console.log(tracks, "tracks");
          await stop()
          await reset()
          await addTrack(tracks);
          await play();
        }
      } catch (error) {
        console.error("Error fetching and adding tracks:", error);
      }
    };

    fetchAndAddTracks();
  }, [data]);

  // useEffect(() => {
  //   const trackChangedListener = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async () => {
  //     const index = await TrackPlayer.getActiveTrackIndex();
  //     setImageUrl(data[index].thumbnailUrl);
  //     setSongName(data[index].title);
  //     setYoutubeId(data[index].youtubeId);
  //     setArtistName(data[index].artists.map((artist) => artist.name).join(', '));
  //     setDataType("musics");
  //     setHideFooter(false)
  //     console.log(data[index], "data[index]");
  //   });

  //   return () => {
  //     // Don't forget to remove the event listener when the component is unmounted
  //     trackChangedListener.remove();
  //   };
  // }, [data]);
  useEffect(() => {
    const url = params.thumbnailUrl;

    getColors(url, {
      fallback: "#000",
      cache: true,
      key: url,
    }).then(setColors);
  }, [params]);

  return (
    <ScreenContainer>
      <StatusBar backgroundColor={bgColor} translucent animated />
      <ScrollView
        contentContainerStyle={tw`pb-20`}
        showsVerticalScrollIndicator={false}
        style={[tw`flex-1 bg-black`]}
        onScroll={scrollHandler}
      >
        <ImageBackground
          source={{ uri: params.thumbnailUrl }}
          style={tw`h-100`}>
          <BlurView
            style={tw`absolute top-0 left-0 right-0 h-100`}
            blurType="dark"
            blurAmount={5}
            reducedTransparencyFallbackColor={colors?.vibrant || "black"}
          />
          <LinearGradient
            colors={["transparent", "black"]}
            style={tw`h-100`}>
            <View style={tw`flex-1 justify-center items-center`}>
              <Text style={tw`text-white text-xs my-4`}>{data && data.channel?.name}</Text>
              {/* <Text style={tw`text-white text-xs mb-4`}>{params.type} . {params.year}</Text> */}
              <Image
                source={{ uri: params.thumbnailUrl }}
                resizeMode='contain'
                style={[tw`h-60 z-500 rounded-md`, { aspectRatio: 1 / 1 }]}
              />
              <Text style={tw`text-white text-3xl font-bold mt-4`}>{params.title}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
        <View style={tw``}>
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
                <Text style={tw`text-sm`} numberOfLines={1}>{item.channel.name} . {secondToMinute((item.duration) / 1000)}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={tw`text-center`}>{data && data.videos?.length} tracks . {formatDurationString((totalDuration) / 1000)}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default PlaylistInfo