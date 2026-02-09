import { loadRecipes } from '../util/backfill-recipes.js';

let recipesCache;

const searchRecipes = async (searchTerm) => {
  recipesCache = await loadRecipes();
  const lower = searchTerm.toLowerCase();

  return Object.values(recipesCache).filter(r =>
    r.title.toLowerCase().includes(lower) ||
    r.description.toLowerCase().includes(lower)
  );
}

export const fetchRecipe = async (interaction) => {
  const keywords = [
    'italian', 'asian', 'noodle', 'rice', 'chicken', 
    'thai', 'healthy', 'easy', 'pasta', 'ground beef', 
    'garlic', 'burger'
  ];

  let searchTerm = '';

  // if interaction, get a search term from it if given
  if (interaction && interaction.options.get("keyword")) {
    searchTerm = interaction.options.get("keyword").value;
  } else {
    searchTerm = keywords[Math.floor(Math.random() * keywords.length)];
  }

  // select random recipe
  const matches = await searchRecipes(searchTerm);
  const allRecipes = Object.values(recipesCache);

  if (!allRecipes.length) {
    throw new Error('Recipe cache is empty');
  }

  const recipe = matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : allRecipes[Math.floor(Math.random() * allRecipes.length)];

  // format message embed
  const recipeEmbed = {
    color: 0x91ff56,
    title: recipe.title,
    url: recipe.url,
    description: recipe.description,
    thumbnail: {
      url: recipe.image,
    }
  };

  return recipeEmbed;
}