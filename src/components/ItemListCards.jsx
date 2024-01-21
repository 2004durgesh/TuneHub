import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { useTheme } from 'react-native-paper'
import { useSearch } from './../context/SearchContext'
import { useNavigation } from '@react-navigation/native'
import Loading from './Loading'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import ScreenContainer from './ScreenContainer'
const { ...textAttributes } = {
    style: tw`text-gray-300 text-xs w-75`,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
}

const ItemListCards = ({ data, dataType,navigateTo }) => {
    const navigation = useNavigation()
    const theme = useTheme()
    const { isLoading, error } = useSearch()
    return isLoading ? <Loading dataType={dataType}/> : (
        <ScreenContainer>
            {data ?
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate(navigateTo,{item})}>
                            <View style={tw`flex-row items-center gap-4 p-2`}>
                                <Image src={item.thumbnailUrl}
                                    style={tw`h-20 w-20 ${dataType === 'artists' ? 'rounded-full' : 'rounded-md'}`}
                                    resizeMode='contain' />
                                <View style={tw``}>
                                    <Text style={tw`text-white font-bold w-80`} numberOfLines={1} ellipsizeMode='tail'>
                                        {item.title || item.name}
                                    </Text>
                                    <View style={tw`flex-row items-center gap-2`}>
                                        {item.isExplicit && <MaterialIcons name='explicit' size={15} color={theme.colors.secondary} />}
                                        {dataType === 'musics' && <Text {...textAttributes}>
                                            {item.artists.map((artist) => artist.name).join(', ')} . {item.duration.label}
                                        </Text>}
                                        {dataType === 'albums' && <Text {...textAttributes}>
                                            {item.artist} . {item.type} . {item.year}
                                        </Text>}
                                        {dataType === 'playlists' && <Text {...textAttributes}>
                                            {item.totalSongs} songs
                                        </Text>}
                                        {dataType === 'artists' && <Text {...textAttributes}>
                                            {item.subscribers}
                                        </Text>}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.youtubeId}
                />
                : null}
        </ScreenContainer>
    )
}

export default ItemListCards