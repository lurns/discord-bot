import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const parser = new Parser();
const DISCLAIMER = 'This post may contain affiliate links. Please see our privacy policy for details. ';

export const loadRecipes = () => {
  if (!fs.existsSync(process.env.RECIPE_CACHE_PATH)) {
    return {};
  }

  try {
    const path = process.env.RECIPE_CACHE_PATH || path.resolve(process.cwd(), './recipes.json');
    const raw = fs.readFileSync(path, 'utf-8');

    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse recipes.json', err);
    return {};
  }
}

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

const mergeRecipes = (existing, incoming) => {
  let added = 0;

  for (const [url, recipe] of Object.entries(incoming)) {
    if (!existing[url]) {
      existing[url] = recipe;
      added++;
    }
  }

  return { merged: existing, added };
}

const retrieveRecipes = async (baseUrl, maxPages = 3) => {
  const recipes = loadRecipes();
  let page = 8;

  while (page <= maxPages) {
    const url = page === 1
      ? `${baseUrl}/feed/`
      : `${baseUrl}/feed/?paged=${page}`;

    const feed = await parser.parseURL(url);

    if (!feed.items.length) break;

    if (page === 1) {
      fs.writeFileSync('./item.json', JSON.stringify(feed.items[1], null, 2), 'utf-8')
      // console.(JSON.stringify(feed.items[0], null, 2));
    }

    for (const item of feed.items) {
      recipes[item.link] = {
        title: item.title,
        url: item.link,
        description: rmDisclaimer(item.contentSnippet) || '',
        image: item.enclosure?.url || extractImageFromContent(item['content:encoded']) || extractImageFromContent(item.content)
      };
    }

    page++;
  }

  return recipes;
}

const writeRecipesToFile = async (recipes) => {
  const path = './recipes.json';
  const tmpPath = './recipes.tmp.json';

  await fs.writeFileSync(tmpPath, JSON.stringify(recipes, null, 2), 'utf-8');
  await fs.renameSync(tmpPath, path);
}

export const backfillRecipes = async (baseUrl, maxPages = 7) => {
  const existing = loadRecipes();
  const newRecipes = await retrieveRecipes(baseUrl, maxPages);

  const { merged, added } = mergeRecipes(existing, newRecipes);

  if (added > 0) {
    writeRecipesToFile(merged);
    console.log(`Added ${added} new recipes from ${baseUrl}`);
  } else {
    console.log(`No new recipes found from ${baseUrl}`);
  }
}