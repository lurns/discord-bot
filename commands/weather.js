import { SlashCommandBuilder } from '@discordjs/builders';
import { weatherEmoji } from '../util/emoji.js';
import fetch from "node-fetch";

export default {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Gets the weather (default is STL)')
    .addStringOption(option => 
      option.setName('city')
      .setDescription('City')),
	async execute(interaction) {
    let city;

    let coords = {
      lat: 38.6264256,
      lon: -90.1995853
    }

    // get coords
    if (interaction.options.get("city")) {
      city = interaction.options.get("city").value;

      if (city.toLowerCase() !== 'stl' && city.toLowerCase() !== 'st. louis') {
        const city = interaction.options.get("city").value;
        
        const coordData = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.OPEN_WEATHER_TOKEN}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(res => res.json());

        coords.lat = coordData[0].lat;
        coords.lon = coordData[0].lon;
      }
    }

    // get weather data
    const weatherData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=minutely,hourly&units=imperial&appid=${process.env.OPEN_WEATHER_TOKEN}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(res => res.json());

    // console.log(weatherData);

    // format message
    const weatherEmbed = {
      color: 0xffb535,
      title: `Today's Forecast for ${city ? city : 'STL'} (${weatherData.timezone})`,
      fields: [
        {
          name: `Current Temp ${weatherEmoji(weatherData.current.weather[0].id.toString())}`,
          value: `${weatherData.current.temp.toString()}°F | Feels like ${weatherData.current.feels_like}°F`,
          inline: false,
        },
        {
          name: `High`,
          value: `${weatherData.daily[0].temp.max}°F`,
          inline: true,
        },
        {
          name: `Low`,
          value: `${weatherData.daily[0].temp.min}°F`,
          inline: true,
        },
        {
          name: `Details`,
          value: `${weatherData.current.weather[0].description}`,
          inline: false,
        }
      ]
    };

		await interaction.reply({embeds: [weatherEmbed]});
	},
};