import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import tw from 'twrnc'
import { useTheme } from 'react-native-paper'
import { useSearch } from './../context/SearchContext'
import { useNavigation } from '@react-navigation/native'
import Loading from './Loading'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import ScreenContainer from './ScreenContainer'
import CustomImage from './CustomImage'
import { useControlFooter } from '../context/ControlFooterContext'
import { useTrackPlayer } from '../context/TrackPlayerContext'
import { resizeImageUrl } from '../utils/imageUtils'
import { getYoutubeAudioDuration, getYoutubeAudioUrl } from '../utils/ytdlUtils'
const { ...textAttributes } = {
    style: tw`text-gray-300 text-xs w-75`,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
}
const ItemListCards = ({ data, dataType, navigateTo }) => {
    const navigation = useNavigation()
    const theme = useTheme()
    const { setImageUrl, setSongName, setArtistName, setYoutubeId, setDataType, setHideFooter } = useControlFooter()
    const { isPlayerReady, addTrack, play, reset, stop } = useTrackPlayer()
    const [refreshing, setRefreshing] = useState(false);
    const [key, setKey] = useState(0); // Add a key state

    const onRefresh = useEffect(() => {
        setRefreshing(true);

        // Remount the component by changing the key
        setKey(prevKey => prevKey + 1);

        setRefreshing(false);
    }, []);
    const { isLoading, error } = useSearch()
    const handleOnPress = async (item) => {
        console.log(item, "item");
        if (!isPlayerReady) {
            return;
        }
        if (dataType === "musics") {
            setImageUrl(item.thumbnailUrl);
            setSongName(item.title || item.name);
            setYoutubeId(item.youtubeId);
            setArtistName(item.artists?.map((artist) => artist.name).join(', ') ?? item.artistName);
            setDataType(dataType)
            setHideFooter(false)
        } else {
            navigation.navigate(navigateTo, item);
        }
        // await stop()
        await reset()
        await addTrack({
            id: item.youtubeId,
            url: await getYoutubeAudioUrl(item.youtubeId),
            title: item.title || item.name,
            artist: item.artists?.map((artist) => artist.name).join(', ') ?? item.artistName,
            artwork: resizeImageUrl(item.thumbnailUrl),
            duration: await getYoutubeAudioDuration(item.youtubeId)
        });
        await play()
    }
    return isLoading ? <Loading /> : (
        <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.primary }]}>
            {data ?
                <FlatList
                    data={data}
                    key={key}
                    contentContainerStyle={tw`mb-20`}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleOnPress(item)}>
                            <View style={tw`flex-row items-center gap-4 p-2`}>
                                {/* <Image src={item.thumbnailUrl}
                                    style={tw`h-20 w-20 ${dataType === 'artists' ? 'rounded-full' : 'rounded-md'}`}
                                    resizeMode='contain' /> */}
                                <CustomImage
                                    imageSrc={item.thumbnailUrl}
                                    type={dataType}
                                    resizeMode='contain'
                                />
                                <View style={tw``}>
                                    <Text style={tw`text-white font-bold w-80`} numberOfLines={1} ellipsizeMode='tail'>
                                        {item.title || item.name}
                                    </Text>
                                    <View style={tw`flex-row items-center gap-2`}>
                                        {item?.isExplicit && <MaterialIcons name='explicit' size={15} color={theme.colors.secondary} />}
                                        {dataType === 'musics' && <Text {...textAttributes}>
                                            {item.artists?.map((artist) => artist.name).join(', ') ?? item.artistName} . {item.duration?.label ?? item.duration}
                                        </Text>}
                                        {dataType === 'albums' && <Text {...textAttributes}>
                                            {item?.artist} . {item.type} . {item.year}
                                        </Text>}
                                        {dataType === 'playlists' && <Text {...textAttributes}>
                                            {item?.totalSongs} songs
                                        </Text>}
                                        {dataType === 'artists' && <Text {...textAttributes}>
                                            {item?.subscribers}
                                        </Text>}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.youtubeId}
                />
                : null}
        </SafeAreaView>
    )
}

export default ItemListCards