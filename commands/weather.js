import { SlashCommandBuilder } from 'discord.js';
import { fetchWeather } from '../services/weather-handler.js';

export default {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Gets the weather (default is STL)')
    .addStringOption(option => 
      option.setName('city')
      .setDescription('City')),
	async execute(interaction) {
    const weatherEmbed = await fetchWeather(interaction);

		await interaction.reply({embeds: [weatherEmbed]});
	},
};