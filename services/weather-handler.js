import { weatherEmoji } from "../util/emoji.js";

const celsiusToFahrenheit = (temp) => {
  return ((temp * (9/5)) + 32).toFixed(1);
}

export const fetchWeather = async (interaction) => {
  let city = "st. louis mo";

  if (interaction) {
    // get coords
    if (interaction.options.get("city")) {
      city = interaction.options.get("city").value;
    }
  }

  // get weather data
  const weatherData = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${city}&apikey=${process.env.TOMORROW_WEATHER_KEY}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(res => res.json());

  const currentWeather = weatherData.timelines.minutely[0].values;
  const todaysWeather = weatherData.timelines.daily[0].values;

  // format message
  const weatherEmbed = {
    color: 0xffb535,
    title: `Today's Forecast for ${weatherData.location.name}`,
    fields: [
      {
        name: `Current Temp ${weatherEmoji(currentWeather.weatherCode)} | ${weatherEmoji(todaysWeather.weatherCodeMax)}`,
        value: `${celsiusToFahrenheit(currentWeather.temperature)}°F | Feels like ${celsiusToFahrenheit(currentWeather.temperatureApparent)}°F`,
        inline: false,
      },
      {
        name: `High`,
        value: `${celsiusToFahrenheit(todaysWeather.temperatureMax)}°F`,
        inline: true,
      },
      {
        name: `Low`,
        value: `${celsiusToFahrenheit(todaysWeather.temperatureMin)}°F`,
        inline: true,
      },
      {
        name: `UV Index`,
        value: `Avg: ${todaysWeather.uvIndexAvg} | Max: ${todaysWeather.uvIndexMax}`,
        inline: false,
      }
    ]
  };

  return weatherEmbed;

}