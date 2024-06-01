import ytdl from 'react-native-ytdl'
// import ytdl from 'ytdl-core';

const getYoutubeAudioUrl = async (youtubeId) => {
    const youtubeURL = `http://www.youtube.com/watch?v=${youtubeId}`;
    const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });
    console.log("url has been fetched", urls[0].url);
    return urls[0].url
}

const getYoutubeAudioDuration = async (youtubeId) => {
    const info= await ytdl.getBasicInfo(youtubeId);
    // console.log("duration has been fetched", info.videoDetails.lengthSeconds);
    return info.videoDetails.lengthSeconds
}


// async function getYoutubeAudioUrl(youtubeId) {
//     try {
//         // Get YouTube video info using ytdl-core
//         const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${youtubeId}`);

//         // Find the audio stream URL
//         const audioStream = info.formats.find(format => format.mimeType.includes('audio/mp4'));
//         const audioUrl = audioStream ? audioStream.url : null;

//         if (!audioUrl) {
//             throw new Error("Audio stream not found");
//         }

//         // Return the audio stream URL
//         return audioUrl;
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }
// async function getYoutubeAudioDuration(youtubeId) {
//     try {
//         const info= await ytdl.getBasicInfo(youtubeId);
//         return info.videoDetails.lengthSeconds
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }



export { getYoutubeAudioUrl, getYoutubeAudioDuration }