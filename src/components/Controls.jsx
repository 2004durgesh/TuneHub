import React, { useState, useEffect, useCallback } from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import tw from 'twrnc'
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player'
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper'
import { useTrackPlayer } from '../context/TrackPlayerContext'
import moment from 'moment'
import FavoritesButton from './FavoriteButton';
import { useControlFooter } from '../context/ControlFooterContext';

const Controls = () => {
    const { imageUrl, songName, artistName, youtubeId,dataType} = useControlFooter()
    const { position, duration } = useProgress();
    const playerState = usePlaybackState();
    // console.log(playerState.state, "playerState")
    const { skipToNext, skipToPrevious, play, pause } = useTrackPlayer();
    const theme = useTheme();
    const secondToMinute = (seconds) => {
        let format = seconds > 3600 ? "hh:mm:ss" : "mm:ss"
        return moment.utc(seconds * 1000).format(format)
    }
    return (
        <>
            <>
                <View style={tw`w-full`}>
                    <Slider
                        value={position}
                        minimumValue={0}
                        maximumValue={duration}
                        thumbTintColor={theme.colors.secondary}
                        maximumTrackTintColor="#000"
                        minimumTrackTintColor={theme.colors.secondary}
                        onValueChange={(value) => {
                            TrackPlayer.seekTo(value)
                        }}
                        style={tw``}
                    />
                    <View style={tw`flex-row justify-between px-4`}>
                        <Text style={tw`text-xs font-bold text-white`}>{secondToMinute(position)}</Text>
                        <Text style={tw`text-xs font-bold text-white`}>{secondToMinute(duration)}</Text>
                    </View>
                </View>
                <View style={tw`flex-row items-center justify-center w-full gap-10`}>
                    <TouchableOpacity onPress={skipToPrevious}>
                        <Ionicons name="play-skip-back" size={25} color='white' />
                    </TouchableOpacity>
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
                    <TouchableOpacity onPress={skipToNext}>
                        <Ionicons name="play-skip-forward" size={25} color='white' />
                    </TouchableOpacity>
                </View>
                <View style={tw`flex-row items-center justify-between`}>
                    <Ionicons name="play-skip-forward" size={18} color='white' style={tw`ml-20`}/>
                    <FavoritesButton dataType={dataType} youtubeId={youtubeId} songName={songName} imageUrl={imageUrl} artistName={artistName} duration={secondToMinute(duration)}/>
                </View>
            </>
        </>
    );
};

export default Controls;