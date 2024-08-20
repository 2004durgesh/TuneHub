import { View, Text, FlatList, ScrollView, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from "twrnc"
import { useTheme, Divider } from 'react-native-paper'
import ScreenContainer from '../../ScreenContainer'
import SongItem from './SongItem'
import PlaylistItem from './PlaylistItem'
import Loading from '../../Loading'
const YTMusic = require("ytmusic-api").default;
import ControlFooter from '../../ControlFooter'
import { getYoutubeAudioUrl } from '../../../utils/ytdlUtils'
const Home = () => {
  const theme = useTheme()
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ytmusic = new YTMusic();
    const fetchHomeData = async () => {
      try {
        await ytmusic.initialize();
        const home = await ytmusic.getHome();
        console.log(home, "home");
        setData(home);
        setIsLoading(false);
        return home
      } catch (error) {
        console.error("An error occurred while fetching home data: ", error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchHomeData();
  }, []);

  const ContentList = ({ contents }) => {
    return (
      <ScrollView
        horizontal
        // showsHorizontalScrollIndicator={false}
        snapToInterval={Dimensions.get('window').width}
        snapToAlignment='center'
        decelerationRate='normal'>
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={contents}
          numColumns={(contents.length) / 4}
          keyExtractor={(item, index) => item ? (item.type === 'SONG' ? (item.videoId ?? index.toString()) : (item.playlistId ?? index.toString())) : index.toString()}
          renderItem={({ item: content, index: contentIndex }) => {
            if (!content) {
              return null
            }

            return content.type === 'SONG' ? (
              <SongItem key={content?.videoId ?? contentIndex} data={content} />
            ) : (
              <PlaylistItem key={content?.playlistId} data={content} />
            );
          }}
        />
      </ScrollView>
    );
  };

  return (
    <>
      <ScreenContainer>
        {isLoading ? <Loading /> : <ScrollView showsVerticalScrollIndicator={false}>
          {data.map((item, index) => (
            <View style={tw``}>
              <Text style={tw`font-bold text-xl mx-4 text-white`}>{item.title}</Text>
              <View key={item.title} style={tw`flex-row`}>
                <ContentList contents={item.contents} />
              </View>
              <Divider bold horizontalInset />
            </View>
          ))}
          <View style={tw`mb-20`}></View>
        </ScrollView>}
      </ScreenContainer>
      {/* <ControlFooter /> */}
    </>
  )
}

export default Home