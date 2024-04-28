import { SlashCommandBuilder } from 'discord.js';
import { fetchRecipe } from '../services/delicious-handler.js';

export default {
	data: new SlashCommandBuilder()
		.setName('recipe')
		.setDescription('Gets a random recipe.')
    .addStringOption(option => 
      option.setName('keyword')
      .setDescription('Keyword')),
	async execute(interaction) {
    await interaction.deferReply();

		const recipeEmbed = await fetchRecipe(interaction);
			await interaction.editReply({embeds: [recipeEmbed]}).catch(err => console.log('err', err));
	},
};