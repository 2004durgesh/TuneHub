import { View, Text, TouchableOpacity } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'
import React, { useState, useEffect } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const FavoritesButton = ({ dataType, youtubeId, songName, imageUrl,artistName}) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const theme = useTheme()
    // Define a key to force a re-render when the component re-mounts
    const [componentRemountKey, setComponentRemountKey] = useState(0);
    const favoritesInfo = {
        youtubeId: youtubeId,
        title: songName,
        thumbnailUrl: imageUrl,
        dataType: dataType,
        duration: "3:00",
        // artistName:artistName,
    };

    useEffect(() => {
        const fetchData = async () => {
            const storedData = await AsyncStorage.getItem('favoriteSongs');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                console.log(parsedData)
                setFavoriteSongs(parsedData);
            }
        };
        fetchData();
    }, [componentRemountKey]);

    useEffect(() => {
        setIsFavorite(favoriteSongs.some(favorite => favorite.youtubeId === youtubeId));
    }, [youtubeId, favoriteSongs]);

    const addToFavoritesHandler = () => {
        if (isFavorite) {
            const newFavorites = favoriteSongs.filter(favorite => favorite.youtubeId !== youtubeId);
            AsyncStorage.setItem('favoriteSongs', JSON.stringify(newFavorites));
        } else {
            favoriteSongs.push(favoritesInfo);
            AsyncStorage.setItem('favoriteSongs', JSON.stringify(favoriteSongs));
        }
        // Increment the key to trigger a re-render when the component re-mounts
        setComponentRemountKey((prevKey) => prevKey + 1);
        ReactNativeHapticFeedback.trigger("impactHeavy",
            {
                enableVibrateFallback: true,
                ignoreAndroidSystemSettings: false,
            });
    };
    

    return (
        <TouchableRipple style={tw`items-center justify-center ml-auto w-40 h-10 rounded-full`} onPress={addToFavoritesHandler}
            rippleColor={theme.colors.secondary}
            borderless={true}
        >
            <>
                {isFavorite ?
                    <Ionicons name="heart" size={18} color="#D3D3D3" />
                    :
                    <Ionicons name="heart-outline" size={18} color="#D3D3D3" />}
            </>
        </TouchableRipple>
    )
}

export default FavoritesButton;
