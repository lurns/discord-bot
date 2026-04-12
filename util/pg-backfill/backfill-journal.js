import supabase from "../db.js";
import { readSheet } from "../sheets.js";

// fetch all prompts from google sheet and add to supabase
const prompts = await readSheet('journal');

// set prompt objects
let formattedPrompts = prompts.map(prompt => {
  return {
    prompt: prompt[0],
    last_sent: prompt[1] ? new Date(prompt[1]) : null,
  }
});

formattedPrompts.shift(); // remove header row

// commit to supabase
const { data, error } = await supabase.from('journal').insert(formattedPrompts).select();

if (error) {
  console.error('Error inserting prompts:', error);
} else {
  console.log('Successfully inserted prompts:', data);
}