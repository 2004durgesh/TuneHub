import React, { useState, useEffect, useCallback } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import tw from 'twrnc'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useTheme } from 'react-native-paper'
import moment from 'moment'


const Controls = ({ playerRef, duration, isPlaying, setPlaying, state }) => {
    // console.log(isPlaying ? "playing" : "not playing")
    const [currentProgress, setCurrentProgress] = useState(0)
    const secondToMinute = (seconds) => {
        return moment.utc(seconds * 1000).format('mm:ss')
    }
    //calculation of currentProgress
    useEffect(() => {
        let timeUpdateIntervalId;
        const startProgressUpdate = () => {
            timeUpdateIntervalId = setInterval(() => {
                if (isPlaying) {
                    setCurrentProgress(prevProgress => {
                        const updatedProgress = prevProgress + 1;  // Update every second, adjust as needed
                        if (updatedProgress >= duration) {
                            clearInterval(timeUpdateIntervalId);
                            return duration;
                        }
                        return updatedProgress;
                    });
                }
            }, 1000);  // Adjust the interval as needed
        };

        startProgressUpdate();

        // Cleanup interval when component unmounts
        return () => {
            clearInterval(timeUpdateIntervalId)
        }
    }, [isPlaying]);
    const theme = useTheme()

    const skipToNext = () => {


    }
    const skipToPrevious = () => {


    }

    const togglePlayback = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);
    return (
        <>
            <View style={tw`w-full`}>
                <Slider
                    value={currentProgress}
                    minimumValue={0}
                    maximumValue={duration}
                    thumbTintColor="#FFF"
                    maximumTrackTintColor="#FFF"
                    minimumTrackTintColor={theme.colors.primary}
                    onSlidingComplete={(value) => {
                        setCurrentProgress(value);
                        playerRef.current?.seekTo(value, true);
                    }}
                />
                <View style={tw`flex-row justify-between`}>
                    <Text style={tw`text-xs font-bold`}>
                        {secondToMinute(currentProgress)}
                    </Text>
                    
                    <Text style={tw`text-xs font-bold`}>
                        {secondToMinute(duration)}
                    </Text>
                </View>
            </View>
            <View style={tw`flex-row items-center justify-center w-full gap-10`}>
                <Ionicons onPress={skipToPrevious} name="play-skip-back" size={25} />
                <Ionicons
                    onPress={togglePlayback}
                    name={isPlaying ? "pause" : "play"}
                    size={25} />
                <Ionicons onPress={skipToNext} name="play-skip-forward" size={25} />
            </View>
        </>
    )
}

export default Controls