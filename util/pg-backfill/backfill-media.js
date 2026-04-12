import supabase from "../db.js";
import { readSheet } from "../sheets.js";

// fetch all media from google sheet and add to supabase
const media = await readSheet('media', 'media!A:F');

// set media objects
let formattedMedia = media.map(media => {
  return {
    title: media[0],
    type: media[1],
    date: new Date(media[2]),
    status: media[3],
    rating: parseFloat(media[4]) ?? null,
    notes: media[5] ?? null 
  }
});

formattedMedia.shift(); // remove header row

// commit to supabase
const { data, error } = await supabase.from('media').insert(formattedMedia).select();

if (error) {
  console.error('Error inserting media:', error);
} else {
  console.log('Media inserted successfully:', data);
}