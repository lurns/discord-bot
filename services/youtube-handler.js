import fetch from "node-fetch";

export const fetchYoutube = async (interaction) => {
  let playlistId;

  if (interaction) {
    switch (interaction.customId) {
      case 'music-work':
        playlistId = process.env.WORK_PLAYLIST_ID;
        break;
      case 'music-break':
        playlistId = process.env.BREAK_PLAYLIST_ID;
        break;
      default:
        playlistId = process.env.WORK_PLAYLIST_ID;
        break;
    }
  }

  // get playlist data
  const playlist = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,id,snippet&maxResults=50&playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(res => res.json());

  // pick a random video from playlist
  const videoNum = Math.floor(Math.random() * playlist.items.length);
  const videoData = playlist.items[videoNum];

  return `https://www.youtube.com/watch?v=${videoData.contentDetails.videoId}`;


  console.log(videoNum);
  console.log(playlistId);
  // console.log(playlist.items[0].snippet);
  // console.log(playlist.items[0].contentDetails);

}