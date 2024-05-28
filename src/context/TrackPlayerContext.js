import React, { createContext, useContext, useEffect, useState } from 'react';
import TrackPlayer, { Capability, RatingType } from 'react-native-track-player';

const TrackPlayerContext = createContext();

const TrackPlayerProvider = ({ children }) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    setupPlayer();
  }, []);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        stopWithApp: true,
        ratingType: RatingType.Heart,
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
      });
      // await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setIsPlayerReady(true);
      console.log("TrackPlayer is set up");
    } catch (error) {
      console.error('Error setting up TrackPlayer:', error);
    }
  };

  const reset = async () => {
    try {
      await TrackPlayer.reset();
    } catch (error) {
      console.error('Error resetting TrackPlayer:', error);
    }
  };

  const stop = async () => {
    try {
      await TrackPlayer.stop();
    } catch (error) {
      console.error('Error stopping TrackPlayer:', error);
    }
  };

  const addTrack = async (track) => {
    try {
      await TrackPlayer.add(track);
      console.log(track, "track added");
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
        reset,
        stop,
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
