import TrackPlayer, { Event, RepeatMode } from "react-native-track-player";


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

    // TrackPlayer.removeEventListener(Event.RemotePause);
    // TrackPlayer.removeEventListener(Event.RemotePlay);
    // TrackPlayer.removeEventListener(Event.RemoteNext);
    // TrackPlayer.removeEventListener(Event.RemotePrevious);
}