import fetch from "node-fetch";

export const fetchTimeGif = async () => {
    const timeKeywords = [
        'father time', 'encino man', 'space jam', 
        'lost tv show', `it's time`, 'owen wilson wow',
        'anime time', 'anime bread', 'naruto run',
        'crab clock', 'crab time'
    ];
    const searchTerm = timeKeywords[Math.floor(Math.random() * timeKeywords.length)];

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