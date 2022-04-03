# discord-bot

A bot designed to fetch data via discord commands. Sends out weather and work tasks automatically each morning, and a recipe each afternoon.

## Commands

`/tasks personal` grabs tasks from my personal Trello board

`/tasks work` grabs tasks from my work-related Trello board

![](/src/weather.png 'Example of /weather command')

`/weather` grabs weather for STL by default

`/weather [city]` grabs weather for specified city

`/recipe` grabs a random recipe from an array of options that are typically safe choices in my house

`/recipe [keyword]` searches for a recipe via given keyword

## Technologies

- [Node.js](https://nodejs.org/)
- [discord.js](https://discord.js.org/)
- [cron](https://npmjs.com/package/cron)
- [Trello API](https://developer.atlassian.com/cloud/trello/)
- [OpenWeather API](https://openweathermap.org/)
- [Puppeteer](https://github.com/puppeteer/puppeteer)
