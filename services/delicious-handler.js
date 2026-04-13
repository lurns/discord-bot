import supabase from '../util/db.js';

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
  let recipe;
  let { data, error } = await supabase
    .from('random_recipe')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .limit(1);

  recipe = data?.[0];
  if (error) console.error('Error fetching recipe:', error);

  // if no match found, select random recipe from the view
  if (!data || data.length === 0) {
    let { data: randomRecipe, error: randomError } = await supabase
      .from('random_recipe')
      .select('*')
      .limit(1);
    recipe = randomRecipe?.[0];

    if (randomError) console.error('Error fetching random recipe:', randomError);
  }

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