import TrackPlayer, { Event, State } from "react-native-track-player";


export async function PlaybackService() {

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        TrackPlayer.pause()
    })

    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        TrackPlayer.play()
    })
    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        TrackPlayer.skipToNext()
    })
    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        TrackPlayer.skipToPrevious()
    })
    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        TrackPlayer.stop()
    })
    TrackPlayer.addEventListener(Event.RemoteDuck, event => {
        if (event.paused) {
            // The audio has been interrupted, pause playback
            TrackPlayer.pause();
        } else {
            // The interruption has ended, resume playback
            TrackPlayer.play();
        }
    });

    // TrackPlayer.removeEventListener(Event.RemotePause);
    // TrackPlayer.removeEventListener(Event.RemotePlay);
    // TrackPlayer.removeEventListener(Event.RemoteNext);
    // TrackPlayer.removeEventListener(Event.RemotePrevious);
}