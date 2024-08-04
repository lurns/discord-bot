import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const deliciousScrape = async (searchTerm) => {
  // set up puppeteer
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage()
  await page.goto(`https://damndelicious.net/?s=${searchTerm}`, { waitUntil: 'domcontentloaded' });

  // get page numbers
  let pageNum = 1;

  const findPagination = await page.evaluate(() => {
    const paginationElement = document.querySelectorAll('.nav-links a.page-numbers')
    let list = [];

    paginationElement.forEach(num => {
      list.push(Number(num.innerText));
    });
    list.pop();

    return list;
  });

  // search via page num
  if (findPagination[findPagination.length - 1] > 1) {
    pageNum = Math.floor(Math.random() * findPagination[findPagination.length - 1]);

    if (pageNum < 1) {
      pageNum = 1;
    }

    await page.goto(`https://damndelicious.net/page/${pageNum}/?s=${searchTerm}`, { waitUntil: 'domcontentloaded' });
  }

  // choose a random recipe on the page
  const recipe = await page.evaluate(() => {
    const recipeElements = document.querySelectorAll('.teaser-post');

    const recipeNum = Math.floor(Math.random() * recipeElements.length);

    // parse recipe
    const recipeChoice = recipeElements[recipeNum];

    let recipeURL = recipeChoice.querySelector('a');
    recipeURL = recipeURL.getAttribute('href');

    let recipeIMG = recipeChoice.querySelector('img');
    recipeIMG = recipeIMG.getAttribute('src');

    let recipeTitle = recipeChoice.querySelector('.post-title');
    recipeTitle = recipeTitle.innerText;

    let recipeDesc = recipeChoice.querySelector('.excerpt');
    recipeDesc = recipeDesc.innerText;

    return { recipeURL, recipeIMG, recipeTitle, recipeDesc };

  });

  await browser.close();

  return recipe;
}

const harvestScrape = async (searchTerm) => {
  // set up puppeteer
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage()
  await page.goto(`https://www.halfbakedharvest.com/#search/q=${searchTerm}`, { waitUntil: 'domcontentloaded' });

  // get results
  const frames = await page.frames();
  const topResultsButton = await frames[0].waitForSelector('pierce/#titleLink');
  await topResultsButton.click();

  await page.waitForSelector('pierce/#slickTemplateCellContainer');

  // get recipes
  const recipeElements = await page.$$eval(
    "pierce/#slickTemplateCellContainer",
    r => r.map(e => e)
  );

  await browser.close();

  // select + format a random recipe
  const recipeNum = Math.floor(Math.random() * recipeElements.length);
  const recipeChoice = recipeElements[recipeNum].slickPageDescriptor;

  let recipeURL = recipeChoice.url;
  let recipeIMG = recipeChoice.image.url;
  let recipeTitle = recipeChoice.titleText;
  // TODO: remove markup tags in desc
  let recipeDesc = recipeChoice.descriptionHtml;

  return { recipeURL, recipeIMG, recipeTitle, recipeDesc };
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

  // pick a site to get a recipe
  const site = Math.round(Math.random());
  let recipe;

  switch (site) {
    case 0:
      recipe = await deliciousScrape(searchTerm);
      break;
    case 1:
      recipe = await harvestScrape(searchTerm);
      break;
    default:
      recipe = await deliciousScrape(searchTerm);
      break;
  }

  // format message embed
  const recipeEmbed = {
    color: 0x91ff56,
    title: recipe.recipeTitle,
    url: recipe.recipeURL,
    description: recipe.recipeDesc,
    thumbnail: {
      url: recipe.recipeIMG,
    }
  };

  return recipeEmbed;
}