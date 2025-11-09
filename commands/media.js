import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, ButtonStyle } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('media')
		.setDescription('View or manage media consumption.'),
	async execute(interaction) {
    await interaction.reply(`CONSUMING...`);

    const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('media-view')
        .setLabel('View Recent 👀')
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('media-add')
        .setLabel('Add ✨')
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('media-edit')
        .setLabel('Edit ✏️')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply(
      { content: `Here's yer media ya lazy oaf`, components: [row] }
    );
	},
};