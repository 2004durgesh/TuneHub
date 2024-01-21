import React from 'react';
import { useSegmentedButton } from '../../context/SegmentedButtonContext';
import { useTheme, SegmentedButtons } from 'react-native-paper';
import ItemListCards from '../ItemListCards';
import ScreenContainer from '../ScreenContainer';
import tw from "twrnc"
import { useSearch } from '../../context/SearchContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const SegmentedItemList = ({ dataType, navigateTo }) => {
    const { activeSegment, setActiveSegment } = useSegmentedButton();
    const { data } = useSearch();
    const { musicsResults, albumsResults, playlistsResults, artistsResults } = data ?? {};
    const results = data ? data[dataType.toLowerCase() + 'Results'] : {};
    setActiveSegment(dataType);
    const navigation = useNavigation()
    const theme = useTheme()
    return (
        <>
            <ScreenContainer>
                <SegmentedButtons
                    value={activeSegment}
                    onValueChange={setActiveSegment}
                    buttons={[
                        {
                            value: 'Musics',
                            label: 'Musics',
                            labelStyle: { color: theme.colors.secondary },
                            icon: () => <Ionicons name="musical-notes-outline" size={15} color={theme.colors.secondary} />,
                            onPress: () => navigation.navigate('Musics', { musicsResults, }),
                        },
                        {
                            value: 'Albums',
                            label: 'Albums',
                            labelStyle: { color: theme.colors.secondary },
                            icon: () => <Ionicons name="albums-outline" size={15} color={theme.colors.secondary} />,
                            onPress: () => navigation.navigate('Albums', { albumsResults, }),
                        },
                        {
                            value: 'Playlists',
                            label: 'Playlists',
                            labelStyle: { color: theme.colors.secondary },
                            icon: () => <MaterialCommunityIcons name="playlist-music-outline" size={15} color={theme.colors.secondary} />,
                            onPress: () => navigation.navigate('Playlists', { playlistsResults, }),
                        },
                        {
                            value: 'Artists',
                            label: 'Artists',
                            labelStyle: { color: theme.colors.secondary },
                            icon: () => <Ionicons name="person-outline" size={15} color={theme.colors.secondary} />,
                            onPress: () => navigation.navigate('Artists', { artistsResults, }),
                        },
                    ]}
                    style={tw`m-4`}
                />
                <ItemListCards data={results} dataType={dataType.toLowerCase()} navigateTo={navigateTo} />
            </ScreenContainer>
        </>
    );
};


const Musics = () => {
    return <SegmentedItemList dataType="Musics" navigateTo='MusicPlayer' />;
};

const Artists = () => {
    return <SegmentedItemList dataType="Artists" navigateTo='ArtistInfo' />;
};

const Playlists = () => {
    return <SegmentedItemList dataType="Playlists" navigateTo='PlaylistInfo' />;
};

const Albums = () => {
    return <SegmentedItemList dataType="Albums" navigateTo='AlbumInfo' />;
};

export { Musics, Artists, Playlists, Albums };
