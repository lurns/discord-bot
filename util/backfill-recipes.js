import Parser from 'rss-parser';
import supabase from './db.js';

const parser = new Parser();
const DISCLAIMER = 'This post may contain affiliate links. Please see our privacy policy for details. ';

const extractImageFromContent = (html) => {
  if (!html) return null;

  const match = html.match(/<img[^>]+src="([^">]+)"/i);
  return match ? match[1] : null;
}

const rmDisclaimer = (desc) => {
  if (desc.includes(DISCLAIMER)) {
    return desc.split(DISCLAIMER)[1];
  }
  return desc;
}

const retrieveRecipes = async (baseUrl, maxPages = 3) => {
  let recipes = [];
  let page = 1;

  while (page <= maxPages) {
    const url = `${baseUrl}/feed/?paged=${page}`;

    const feed = await parser.parseURL(url);

    if (!feed.items.length) break;

    for (const item of feed.items) {
      recipes.push({
        title: item.title,
        url: item.link,
        description: rmDisclaimer(item.contentSnippet) || '',
        image: item.enclosure?.url || extractImageFromContent(item['content:encoded']) || extractImageFromContent(item.content)
      });
    }

    page++;
  }

  return recipes;
}

export const backfillRecipes = async (baseUrls = [], maxPages = 3) => {
  let allNewRecipes = [];

  // fetch recipes from each base url and aggregate
  for (const url of baseUrls) {
    const newRecipes = await retrieveRecipes(url, maxPages);

    allNewRecipes.push(...newRecipes);
  }

  // upsert to db, will check for any duplicates based on url and only insert new ones
  const { data, error } = await supabase
    .from('recipe')
    .upsert(allNewRecipes, { 
      onConflict: 'url', ignoreDuplicates: true 
    }).select('title');
    
  if (error) {
    console.error('Error upserting recipes:', error);
  } else {
    console.log(`Successfully upserted ${data.length} recipes:`, data.map(d => d.title));
  }
}