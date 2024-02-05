import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Dimensions, Text } from 'react-native';
import Animated, {
    useSharedValue, useDerivedValue, interpolate, Extrapolation, useAnimatedStyle, useAnimatedScrollHandler
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import tw from "twrnc"
import TrackPlayer from 'react-native-track-player'
import { getColors } from 'react-native-image-colors'
import ytdl from 'react-native-ytdl'
import Controls from './Controls';
import { useTheme } from 'react-native-paper';
import { useTrackPlayer } from '../context/TrackPlayerContext';
import { useControlFooter } from '../context/ControlFooterContext';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const ControlFooter = () => {
    function resizeImageUrl(url, width = 2000, height = 2000) {
        if (!url) {
            return 'https://unsplash.com/photos/a-black-and-white-photo-of-a-black-surface-ilVYjf0J378';
        }
        return url.replace(/=w\d+/, `=w${width}`).replace(/-h\d+/, `-h${height}`);

    }
    const theme=useTheme()
    const bottomSheetRef = useRef(null);
    const { imageUrl, songName, artistName,youtubeId } = useControlFooter()
    const { isPlayerReady, addTrack } = useTrackPlayer();
    const [colors, setColors] = useState(null)
    const translateY = useSharedValue(0);
    useEffect(() => {
        const setupAndPlayTrack = async () => {
          if (!isPlayerReady) {
            return;
          }
    
          const youtubeURL = `http://www.youtube.com/watch?v=${youtubeId}`;
          const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
          let info = await ytdl.getBasicInfo(youtubeId);
          // console.log(info, "info");
    
          // Reset the player
          await TrackPlayer.reset();
    
          // Add the new track
          await addTrack({
            url: urls[0].url,
            title: songName,
            artwork: resizeImageUrl(imageUrl),
            duration: info.videoDetails.lengthSeconds,
          });
          // Start playing the new track
          await TrackPlayer.play();
        };
    
    
        setupAndPlayTrack();
      }, [isPlayerReady, addTrack,youtubeId]);
    
      useEffect(() => {
        const url = imageUrl;
    
        getColors(url, {
          fallback: theme.colors.primary,
          cache: true,
          key: url,
        }).then(setColors);
      }, [theme.colors.primary,imageUrl]);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            translateY.value = event.contentOffset.y;
        },
    });

    const animatedImageHeight = useDerivedValue(() => {
        return interpolate(translateY.value, [0, SCREEN_HEIGHT - 90], [400, 32], Extrapolation.CLAMP);
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
            [100, 70, 350],
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
                snapPoints={['15%', '75%']}
                enableDynamicSizing={true}
                animatedPosition={translateY}
                detached={true}
                backgroundStyle={{backgroundColor: colors?.vibrant || theme.colors.primary}}
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
                            <Text style={[tw`text-red-500 font-bold w-75 -mb-8`]} numberOfLines={1} ellipsizeMode='tail'>{songName || "No Songs Playing"}</Text>
                            <View style={tw`flex-1 flex-row items-center gap-2`}>
                                <Text style={[tw`text-red-500 font-bold`]}>{artistName}</Text>
                            </View>
                        </Animated.View>
                    </View>
                    <Animated.View style={{ height: animatedHeaderHeight, opacity: animatedSongDetailsOpacity, backgroundColor: "green" }}>
                        <View style={tw`flex-1 items-center justify-end`}>
                            <Text style={tw`font-bold text-xl`} numberOfLines={1} ellipsizeMode='tail'>{songName}</Text>
                        </View>
                        <Controls />
                    </Animated.View>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
};

export default ControlFooter;
