import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, ButtonStyle } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Gets a youtube video based on mood.'),
	async execute(interaction) {
    await interaction.reply(`Get ready to jam...`);

    const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('music-work')
        .setLabel('I need to work')
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('music-break')
        .setLabel('I need a break')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.editReply(
      { content: 'Aye aye matey pick yer poison', components: [row] }
    );

	},
};