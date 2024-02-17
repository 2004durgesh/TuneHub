import ytdl from 'react-native-ytdl'

const getYoutubeAudioUrl = async (youtubeId) => {
    const youtubeURL = `http://www.youtube.com/watch?v=${youtubeId}`;
    const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
    console.log("url has been fetched", urls[0].url);
    return urls[0].url
}

const getYoutubeAudioDuration = async (youtubeId) => {
    const info= await ytdl.getBasicInfo(youtubeId);
    console.log("duration has been fetched", info.videoDetails.lengthSeconds);
    return info.videoDetails.lengthSeconds
}

export { getYoutubeAudioUrl, getYoutubeAudioDuration }