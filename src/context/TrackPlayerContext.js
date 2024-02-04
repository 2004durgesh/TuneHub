// TrackPlayerContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import TrackPlayer, { Event, State,Capability, RepeatMode } from 'react-native-track-player';

const TrackPlayerContext = createContext();

const TrackPlayerProvider = ({ children }) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    setupPlayer();
  }, []);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer().then(async() => {
        await TrackPlayer.updateOptions({
            stopWithApp: true,
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.Stop
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
            ]
          });
      })
      // await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      
      setIsPlayerReady(true);
      console.log("TrackPlayer is set up");
      // Add event listeners or other setup logic if needed
    } catch (error) {
      console.error('Error setting up TrackPlayer:', error);
    }
  };

  const addTrack = async (track) => {
    try {
      await TrackPlayer.add(track);
      console.log(track, "track added")
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  const play = async () => {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  const pause = async () => {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  const skipToNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to the next track:', error);
    }
  };

  const skipToPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to the previous track:', error);
    }
  };

  return (
    <TrackPlayerContext.Provider
      value={{
        isPlayerReady,
        setupPlayer,
        addTrack,
        play,
        pause,
        skipToNext,
        skipToPrevious,
      }}
    >
      {children}
    </TrackPlayerContext.Provider>
  );
};

const useTrackPlayer = () => {
  return useContext(TrackPlayerContext);
};

export { TrackPlayerProvider, useTrackPlayer };
