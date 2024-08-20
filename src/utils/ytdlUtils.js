import ytdl from 'react-native-ytdl'
// import ytdl from 'ytdl-core';

import axios from "axios";

const getYoutubeAudioUrl = async (youtubeId) => {
    // const youtubeURL = `http://www.youtube.com/watch?v=${youtubeId}`;
    // const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
    // console.log("url has been fetched", urls[0].url);
    // return urls[0].url
    // const {data}=await axios.get(`https://yt-music-api-peta.vercel.app/convert/${youtubeId}`)
    // console.log(data);
    // return data.audioLink
    const requestBody = {
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        isAudioOnly: true,
        disableMetadata: true
    };

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    const { data } = await axios.post(`https://api.cobalt.tools/api/json`, requestBody, { headers });

    console.log(data.url);
    return data.url

}

const getYoutubeAudioDuration = async (youtubeId) => {
    const info = await ytdl.getBasicInfo(youtubeId);
    // console.log("duration has been fetched", info.videoDetails.lengthSeconds);
    return Number(info.videoDetails.lengthSeconds)
}


export { getYoutubeAudioUrl, getYoutubeAudioDuration }