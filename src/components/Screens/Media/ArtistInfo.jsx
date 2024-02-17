import { View, Text, ImageBackground, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from "twrnc"
import ScreenContainer from '../../ScreenContainer'
import LinearGradient from 'react-native-linear-gradient';
import { resizeImageUrl } from '../../../utils/imageUtils';
import axios from 'axios'
import { useControlFooter } from '../../../context/ControlFooterContext'
import { useTrackPlayer } from '../../../context/TrackPlayerContext'
import { FlatList } from 'react-native-gesture-handler';
import AnimatedScrollView from '../../AnimatedScrollView';
import { getYoutubeAudioDuration, getYoutubeAudioUrl } from '../../../utils/ytdlUtils';

const ArtistInfo = ({ route, navigation }) => {
  const params = route.params ?? {}
  console.log(params, "params")
  const { setImageUrl, setSongName, setArtistName, setYoutubeId, setDataType, setHideFooter } = useControlFooter()
  const { isPlayerReady, addTrack, play, reset, stop } = useTrackPlayer()
  const [data, setData] = useState({})
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`https://yt-music-api-zeta.vercel.app/artists/${params.artistId}`)
      setData(data)
      console.log(data, "data");
      return data
    }
    fetchData()
  }, [params.artistId])
  return (
    <ScreenContainer>
      <AnimatedScrollView>
        <ImageBackground
          source={{ uri: resizeImageUrl(params.thumbnailUrl) }}
          style={tw`h-100`}>
          <LinearGradient
            colors={["transparent", "black"]}
            style={tw`h-100`}>
            <View style={tw`flex-1 justify-end items-center`}>
              <Text style={tw`text-white text-center text-5xl font-bold mt-4`}>{params.name}</Text>
              <Text style={tw`text-red-500 mt-4`}>{params.subscribers}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
        <View style={tw`px-4 py-2`}>
          <Text style={tw`text-white text-2xl font-bold w-90`}>Top Songs</Text>
          {data && data.topSongs?.map((item, index) => (
            <View key={index} style={tw`flex-row items-center py-2`}>
              <Image
                source={{ uri: item.thumbnails[1].url }}
                resizeMode='contain'
                style={[tw`h-15 rounded-md`, { aspectRatio: 1 / 1 }]}
              />
              <TouchableOpacity style={tw`p-2`} onPress={async () => {
                if (!isPlayerReady) {
                  return;
                }
                setImageUrl(item.thumbnails[1].url);
                setSongName(item.album.name);
                setYoutubeId(item.videoId);
                setArtistName(item.artist.name);
                setDataType("musics")
                setHideFooter(false)
                // await stop()
                await reset()
                // const youtubeURL = `http://www.youtube.com/watch?v=${data.videoId}`;
                // const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
                // let info = await ytdl.getBasicInfo(data.videoId);
                await addTrack({
                  id: item.videoId,
                  url: await getYoutubeAudioUrl(item.videoId),
                  title: item.name,
                  artist: item.artist.name,
                  artwork: resizeImageUrl(item.thumbnails[1].url),
                  duration: await getYoutubeAudioDuration(item.videoId)
                });
                await play()
                console.log("songitem clicked");
              }}>
                <Text style={tw`text-white font-bold w-90`} numberOfLines={2}>{item.album.name}</Text>
                <Text style={tw``} numberOfLines={1}>{item.artist.name}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <Text style={tw`text-white text-2xl font-bold w-90 px-4 py-2`}>Top Albums</Text>
        <FlatList
          data={data?.topAlbums}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={tw`items-center py-2`}>
              <TouchableOpacity style={tw`p-2`} onPress={() => navigation.navigate("AlbumInfo", {
                albumId: item.albumId,
                thumbnailUrl: item.thumbnails[1].url,
                artist: item.artist.name,
                year: item.year,
                title: item.name
              })}>
                <Image
                  source={{ uri: item.thumbnails[1].url }}
                  resizeMode='contain'
                  style={[tw`h-50 rounded-md`, { aspectRatio: 1 / 1 }]}
                />
                <Text style={tw`text-white font-bold w-50`} numberOfLines={1}>{item.name}</Text>
                <Text style={tw``} numberOfLines={1}>{item.year}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {/* <Text style={tw`text-white text-2xl font-bold w-90 px-4 py-2`}>Featured On</Text>
        <FlatList
          data={data?.featuredOn}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={tw`items-center py-2`}>
              <TouchableOpacity style={tw`p-2`} onPress={()=>navigation.navigate("PlaylistInfo",{
                playlistId:item.playlistId,
                thumbnailUrl:item.thumbnails[1].url,
                title:item.name,
                })}>
                <Image
                  source={{ uri: item.thumbnails[1].url }}
                  resizeMode='contain'
                  style={[tw`h-50 rounded-full`, { aspectRatio: 1 / 1 }]}
                />
                <Text style={tw`text-white font-bold w-50 text-center`} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            </View>
          )}
        /> */}
      </AnimatedScrollView>
    </ScreenContainer>
  )
}

export default ArtistInfo