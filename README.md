# discord-bot

![](/src/morning.png 'Scheduled morning message with weather and renewing subscription')

A bot designed to fetch data via discord commands. Sends out weather and work tasks automatically each morning, and a recipe each afternoon. Keeps track of subscriptions and sends out a reminder when they're close to renewing.

## Commands

`/tasks personal` grabs tasks from my personal Trello board

`/tasks work` grabs tasks from my work-related Trello board

`/weather` grabs weather for STL by default

`/weather [city]` grabs weather for specified city

`/recipe` grabs a random recipe from an array of options that are typically safe choices in my house

`/recipe [keyword]` searches for a recipe via given keyword

`/music` gives option of 'work' or 'break' and selects a random video from an appropriate 
youtube playlist

![](/src/media.png 'Example of using /media command to view media')

`/media` 🆕 gives option to view my recent media or add a new thing I've consumed 

🆕 Alternatively, find media based on type (ex. TV, movies), date range consumed (ex. December 2025), and/or status (ex. Completed, In Progress). Chat directly in the channel and let the crab NLP parse that request for ya. 

## Technologies

- [Node.js](https://nodejs.org/)
- [discord.js](https://discord.js.org/)
- [cron](https://npmjs.com/package/cron)
- [Trello API](https://developer.atlassian.com/cloud/trello/)
- [Tomorrow Weather API](https://www.tomorrow.io/)
- [Youtube Data API](https://developers.google.com/youtube/v3)
- [Google API](https://www.npmjs.com/package/googleapis)
- [NLP.js](https://github.com/axa-group/nlp.js)
