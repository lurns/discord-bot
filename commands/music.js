import { MessageActionRow, MessageButton } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
	data: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Gets a youtube video based on mood.'),
	async execute(interaction) {
    await interaction.reply(`Get ready to jam...`);

    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('music-work')
        .setLabel('I need to work')
        .setStyle('PRIMARY')
    )
    .addComponents(
      new MessageButton()
        .setCustomId('music-break')
        .setLabel('I need a break')
        .setStyle('SUCCESS')
    );

    await interaction.editReply(
      { content: 'Aye aye matey pick yer poison', components: [row] }
    );

	},
};