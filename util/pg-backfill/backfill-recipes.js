import supabase from "../db.js";
import fs from 'fs/promises';

const recipes = await fs.readFile('./recipes.json', 'utf-8').then(JSON.parse);
let entries = []

Object.keys(recipes).forEach(key => {
  const recipe = recipes[key];
  entries.push({
    title: recipe.title,
    image: recipe.image,
    url: recipe.url,
    description: recipe.description,
  })
});

const { data, error } = await supabase.from('recipe').upsert(entries).eq('title', entries.map(e => e.title)).select('title');

if (error) {
  console.error('Error upserting recipes:', error);
} else {
  console.log(`Successfully upserted ${data.length} recipes:`, data.map(d => d.title));
}