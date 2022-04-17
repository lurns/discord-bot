import puppeteer from "puppeteer";

export const fetchRecipe = async (interaction) => {
  const keywords = ['italian', 'asian', 'noodle', 'rice', 'chicken', 'thai', 'healthy', 'easy', 'pasta']
  let searchTerm = '';

  // if interaction, get a search term from it if given
   if (interaction && interaction.options.get("keyword")) {
    searchTerm = interaction.options.get("keyword").value;
  } else {
    searchTerm = keywords[Math.floor(Math.random() * keywords.length)];
  }

  // set up puppeteer
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage()
  await page.goto(`https://damndelicious.net/?s=${searchTerm}`, {waitUntil: 'networkidle0'});

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
  if (findPagination[findPagination.length-1] > 1) {
    pageNum = Math.floor(Math.random() * findPagination[findPagination.length-1]);

    if (pageNum < 1) {
      pageNum = 1;
    }
    
    await page.goto(`https://damndelicious.net/page/${pageNum}/?s=${searchTerm}`, {waitUntil: 'networkidle0'});
  }

  // choose a random recipe on the page
  const recipe = await page.evaluate(() => {
    const recipeElements = document.querySelectorAll('.teaser-post');
    let count = 0;

    recipeElements.forEach(recipe => count++);

    const recipeNum = Math.floor(Math.random() * count);

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

  await browser.close()

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