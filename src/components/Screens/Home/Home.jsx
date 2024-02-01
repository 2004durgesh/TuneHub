import { View, Text, FlatList, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from "twrnc"
import { useTheme } from 'react-native-paper'
import ScreenContainer from '../../ScreenContainer'
import SongItem from './SongItem'
import PlaylistItem from './PlaylistItem'
const YTMusic = require("ytmusic-api").default;

const Home = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    const ytmusic = new YTMusic();
    const fetchHomeData = async () => {
      await ytmusic.initialize();
      const home = await ytmusic.getHome()
      setData(home)
      console.log(home);
    }
    fetchHomeData()
  }, [])

  const ContentList = ({ contents }) => {
    return (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={contents}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: content, index: contentIndex }) => (
          content.type === 'SONG' ? (
            <SongItem key={contentIndex} data={content} />
          ) : (
            <PlaylistItem key={contentIndex} data={content} />
          )
        )}
      />
    );
  };

  const theme = useTheme()
  return (
    <ScreenContainer>
      {data.map((item, index) => (
        <View style={tw``}>
          <Text style={tw`font-bold text-xl mx-4`}>{item.title}</Text>
          <View key={index} style={tw`flex-row`}>
            <ContentList contents={item.contents} />
          </View>
        </View>
      ))}
    </ScreenContainer>
  )
}

export default Home