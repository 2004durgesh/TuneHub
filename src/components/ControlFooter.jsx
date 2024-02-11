import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { View, Image, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, {
    useSharedValue, useDerivedValue, interpolate, Extrapolation, useAnimatedStyle, useAnimatedScrollHandler
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import tw from "twrnc"
import TrackPlayer, { usePlaybackState } from 'react-native-track-player'
import { getColors } from 'react-native-image-colors'
import ytdl from 'react-native-ytdl'
import Controls from './Controls';
import { useTheme } from 'react-native-paper';
import { useTrackPlayer } from '../context/TrackPlayerContext';
import { useControlFooter } from '../context/ControlFooterContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Marquee } from '@animatereactnative/marquee';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


const ControlFooter = () => {

    function resizeImageUrl(url, width = 2000, height = 2000) {
        if (!url) {
            return 'https://unsplash.com/photos/a-black-and-white-photo-of-a-black-surface-ilVYjf0J378';
        }
        return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);

    }
    const theme = useTheme()
    const playerState = usePlaybackState();
    const bottomSheetRef = useRef(null);
    const { imageUrl, songName, artistName, youtubeId, setImageUrl, setSongName, setArtistName, setYoutubeId,setHideFooter } = useControlFooter()
    // console.log({ imageUrl, songName, artistName, youtubeId });
    const { isPlayerReady, addTrack, play, pause } = useTrackPlayer();
    const [colors, setColors] = useState(null)
    const translateY = useSharedValue(0);

    useLayoutEffect(() => {
        // This is an async function that restores the player state from AsyncStorage
        const restoreState = async () => {
            try {
                // Try to get the saved state from AsyncStorage
                const savedState = await AsyncStorage.getItem('playerState');
                console.log("savedState", JSON.parse(savedState));
                // If there is a saved state...
                if (savedState) {
                    // Parse the saved state from JSON
                    const { imageUrl, songName, artistName, youtubeId } = JSON.parse(savedState);
                    // And use it to set the state of our component
                    setImageUrl(imageUrl);
                    setSongName(songName);
                    setArtistName(artistName);
                    setYoutubeId(youtubeId);
                }
            } catch (error) {
                console.log(error, "error");
            }
        };
        restoreState();
    }, []);

    // This effect runs when any of the state variables change
    useEffect(() => {
        const saveState = async () => {
            const state = { imageUrl, songName, artistName, youtubeId };
            await AsyncStorage.setItem('playerState', JSON.stringify(state));
            console.log('State saved:', state);
        };

        saveState();
    }, [imageUrl, songName, artistName, youtubeId]); // This effect runs whenever any of these variables change

    useEffect(() => {
        const setupAndPlayTrack = async () => {
            if (!isPlayerReady) {
                return;
            }
            const youtubeURL = `http://www.youtube.com/watch?v=${youtubeId}`;
            const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
            let info = await ytdl.getBasicInfo(youtubeId);
            // console.log(info, "info");

            // stop the player
            await TrackPlayer.stop();
            
            // Reset the player
            await TrackPlayer.reset();

            // Add the new track
            await addTrack({
                id: youtubeId,
                url: urls[0].url,
                title: songName,
                artist: artistName,
                artwork: resizeImageUrl(imageUrl),
                duration: info.videoDetails.lengthSeconds,
            });
            // Start playing the new track
            await TrackPlayer.play();
        };


        setupAndPlayTrack();
    }, [isPlayerReady, addTrack, youtubeId]);

    useEffect(() => {
        const url = imageUrl;

        getColors(url, {
            fallback: "#000",
            cache: true,
            key: url,
        }).then(setColors);
    }, [theme.colors.primary, imageUrl]);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            translateY.value = event.contentOffset.y;
        },
    });

    const handleControlFooter=async()=>{
        await TrackPlayer.stop()
        await TrackPlayer.reset()
        //clear the playerState local storage
        await AsyncStorage.removeItem('playerState')
        setHideFooter(true)
        //checking if local storage is cleared
        const savedState = await AsyncStorage.getItem('playerState');
        console.log("savedState after clearing", savedState);
    }

    const animatedImageHeight = useDerivedValue(() => {
        return interpolate(translateY.value, [0, SCREEN_HEIGHT - 90], [400, 5], Extrapolation.CLAMP);
    });

    const animatedImageMarginLeft = useDerivedValue(() => {
        return interpolate(translateY.value, [0, SCREEN_HEIGHT - 90], [SCREEN_WIDTH / 2 - 130, 10], Extrapolation.CLAMP);
    });
    const animatedOpacity = useDerivedValue(() => {
        return interpolate(
            translateY.value,
            [0, SCREEN_HEIGHT - 550, SCREEN_HEIGHT - 90],
            [0, 0, 1],
            Extrapolation.CLAMP
        );
    });
    const animatedHeaderHeight = useDerivedValue(() => {
        return interpolate(
            translateY.value,
            [0, SCREEN_HEIGHT * 0.1, SCREEN_HEIGHT * 0.75],
            [100, 50, 650],
            Extrapolation.CLAMP
        );
    });

    const animatedSongDetailsOpacity = useDerivedValue(() => {
        return interpolate(
            translateY.value,
            [0, SCREEN_HEIGHT - 500, SCREEN_HEIGHT - 90],
            [1, 0, 0],
            Extrapolation.CLAMP
        );
    });
    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: animatedImageHeight.value,
            width: animatedImageHeight.value,
            marginHorizontal: animatedImageMarginLeft.value,
        };
    });

    return (
        <View style={tw`absolute bottom-0 left-0 right-0 top-0 flex-1`}>
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={['10%', '75%']}
                enableDynamicSizing={true}
                animatedPosition={translateY}
                detached={true}
                backgroundStyle={{ backgroundColor: colors?.vibrant || "black" }}
            >
                <BottomSheetScrollView onScroll={scrollHandler} >
                    <View style={[tw`flex-1 items-center flex-row`]}>
                        <Animated.View style={[animatedStyle]}>
                            <Image
                                style={tw`flex-1`}
                                source={{ uri: resizeImageUrl(imageUrl || 'https://unsplash.com/photos/a-black-and-white-photo-of-a-black-surface-ilVYjf0J37') }}
                            />
                        </Animated.View>
                        <Animated.View style={[tw``, { opacity: animatedOpacity }]}>
                            <Marquee spacing={300}>
                                <View style={tw`flex-row items-center gap-2 w-75`}>
                                    <Text style={[tw`text-white font-bold`]} numberOfLines={1} ellipsizeMode='tail'>{songName || "No Songs Playing"} .</Text>
                                    <Text style={[tw`text-white text-xs`]} numberOfLines={1} ellipsizeMode='tail'>{artistName || "No Songs Playing"}</Text>
                                </View>
                            </Marquee>
                            <View style={tw`flex-row items-center gap-4`}>
                                {
                                    playerState.state === "playing"
                                        ?
                                        <TouchableOpacity onPress={pause}>
                                            <Ionicons name={'pause'} size={25} color='white' />
                                        </TouchableOpacity> :
                                        playerState.state === "buffering" || playerState.state === "loading" ?
                                            <ActivityIndicator size="small" color={theme.colors.secondary} />
                                            :
                                            <TouchableOpacity onPress={play}>
                                                <Ionicons name={'play'} size={25} color='white' />
                                            </TouchableOpacity>
                                }
                                <TouchableOpacity onPress={handleControlFooter}>
                                    <Ionicons name={'close'} size={25} color='white' />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                    <Animated.View style={[tw`mt-8`, { height: animatedHeaderHeight }]}>
                        <View style={tw`items-center`}>
                            <Text style={tw`font-bold text-xl text-white`} numberOfLines={1} ellipsizeMode='tail'>{songName || "No Songs Playing"}</Text>
                            <Text style={[tw`text-white`]} numberOfLines={1} ellipsizeMode='tail'>{artistName || "No Songs Playing"}</Text>
                        </View>
                        <Controls />
                    </Animated.View>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
};

export default ControlFooter;