import fetch from "node-fetch";

const timeKeywords = [
    'father time', 'encino man', 'space jam', 
    'lost tv show', `it's time`, 'owen wilson wow',
    'anime time', 'anime bread', 'naruto run',
    'crab clock', 'crab time'
];

const danceKeywords = [
    'anime dance', 'party time', 'pokemon dance', 
    'britney spears', 'nsync bye bye bye', 'twerk', 
    'bridgerton dance', 'beyonce', 'disco ball', 
    'jazzercise', 'mosh', 'rave', 'soul train', 
    'night at the roxbury', 'skeleton dance', 'dance', 
    'funny dance'
]

export const fetchGif = async (type) => {
    let keywords;

    switch(type) {
        case 'dance':
          keywords = danceKeywords;
          break;
        case 'time':
          keywords = timeKeywords
          break;
        default:
          keywords = ['shrug', 'idk', 'unknown']
      }

    const searchTerm = keywords[Math.floor(Math.random() * keywords.length)];

    // fetch options from tenor
    const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${process.env.TENOR_KEY}&limit=10`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        return response.text();
    })
    .then(text => {
        return text;
    })
    .catch(err => console.error(err));

    const gifs = JSON.parse(res);
    const selectedGif = gifs.results[Math.floor(Math.random() * gifs.results.length)];

    return selectedGif.media_formats.gif.url;
}