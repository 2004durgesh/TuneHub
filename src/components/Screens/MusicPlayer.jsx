import { Text, View, Dimensions, Image } from 'react-native'
import React, { useState,useEffect } from 'react'
import ScreenContainer from '../ScreenContainer'
import { getColors } from 'react-native-image-colors'
import tw from 'twrnc'
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper'
import Controls from '../Controls'
import TrackPlayer, { Event } from 'react-native-track-player'
import ytdl from 'react-native-ytdl'
import { useTrackPlayer } from '../../context/TrackPlayerContext'
import CustomImage from '../CustomImage'

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const MusicPlayer = ({ route }) => {
  // const playerRef = useRef();
  const params = route.params ?? {}
  // console.log(params, "params")
  const theme = useTheme()
  const { isPlayerReady, addTrack } = useTrackPlayer();
  const [colors, setColors] = useState(null)
  // function resizeImageUrl(url, width = 2000, height = 2000) {
  //   if (!url) {
  //     return ''; // return a default image URL or an empty string
  //   }
  //   return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);

  // }

  useEffect(() => {
    const setupAndPlayTrack = async () => {
      if (!isPlayerReady) {
        return;
      }

      const youtubeURL = `http://www.youtube.com/watch?v=${params.youtubeId}`;
      const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
      let info = await ytdl.getBasicInfo(params.youtubeId);
      // console.log(info, "info");

      // Reset the player
      await TrackPlayer.reset();

      // Add the new track
      await addTrack({
        url: urls[0].url,
        title: params.title,
        artwork: resizeImageUrl(params.thumbnailUrl),
        duration: info.videoDetails.lengthSeconds,
      });
      // Start playing the new track
      await TrackPlayer.play();
    };


    setupAndPlayTrack();
  }, [isPlayerReady, addTrack, params]);

  useEffect(() => {
    const url = params.thumbnailUrl;

    getColors(url, {
      fallback: theme.colors.primary,
      cache: true,
      key: url,
    }).then(setColors);
  }, [params, theme.colors.primary]);

  return (
    <ScreenContainer>
      <View style={tw`flex-row justify-center`}>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.average }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.darkMuted }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.darkVibrant }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.dominant }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.lightMuted }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.lightVibrant }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.muted }]}></View>
        <View style={[tw`h-20 border w-1/8`, { backgroundColor: colors?.vibrant }]}></View>
      </View>


      <LinearGradient
        colors={[colors?.vibrant || theme.colors.primary, colors?.darkVibrant || theme.colors.primary]}
        style={tw`flex-1 p-4`}
      >
        <View style={tw`h-150 justify-center items-center`}>
          {/* <CustomImage imageSrc={params.thumbnailUrl} style={`w-90 h-90`} resizeMode='contain' /> */}
          {/* <Controls /> */}
        </View>
      </LinearGradient>
    </ScreenContainer>
  )
}

export default MusicPlayer