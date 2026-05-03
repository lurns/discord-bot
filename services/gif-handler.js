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
];

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

    // fetch options from klipy
    const res = await fetch(`https://api.klipy.com/api/v1/${process.env.KLIPY_KEY}/gifs/search?q=${searchTerm}&per_page=15`, {
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
    const selectedGif = gifs.data.data[Math.floor(Math.random() * gifs.data.data.length)];

    return selectedGif.file.md.gif.url;
}