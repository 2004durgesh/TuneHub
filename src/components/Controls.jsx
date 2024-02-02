import React, { useState, useEffect, useCallback } from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import tw from 'twrnc'
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player'
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper'
import { useTrackPlayer } from '../context/TrackPlayerContext'
import moment from 'moment'


const Controls = () => {
    const { position, duration } = useProgress();
    const playerState = usePlaybackState();
    console.log(playerState.state, "playerState")
    const { skipToNext, skipToPrevious, play, pause } = useTrackPlayer();
    const theme = useTheme();
    const secondToMinute = (seconds) => {
        let format = seconds > 3600 ? "hh:mm:ss" : "mm:ss"
        return moment.utc(seconds * 1000).format(format)
    }
    return (
        <>
            <View style={tw`w-full`}>
                <Slider
                    value={position}
                    minimumValue={0}
                    maximumValue={duration}
                    thumbTintColor="#FFF"
                    maximumTrackTintColor="#FFF"
                    minimumTrackTintColor={theme.colors.secondary}
                    onSlidingComplete={(value) => {
                        TrackPlayer.seekTo(value)
                    }
                    }
                />
                <View style={tw`flex-row justify-between`}>
                    <Text style={tw`text-xs font-bold`}>{secondToMinute(position)}</Text>
                    <Text style={tw`text-xs font-bold`}>{secondToMinute(duration)}</Text>
                </View>
            </View>
            <View style={tw`flex-row items-center justify-center w-full gap-10`}>
                <Ionicons onPress={skipToPrevious} name="play-skip-back" size={25} />
                {
                    playerState.state === "playing"
                    ?
                    <Ionicons onPress={pause} name={'pause'} size={25} />:
                    playerState.state === "buffering" || playerState.state === "loading"?
                    <ActivityIndicator size="small" color={theme.colors.secondary} />
                    :
                    <Ionicons onPress={play} name={'play'} size={25} />
                    }
                <Ionicons onPress={skipToNext} name="play-skip-forward" size={25} />
            </View>
        </>
    );
};

export default Controls;