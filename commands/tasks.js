import { SlashCommandBuilder } from '@discordjs/builders'
import { fetchTasks } from '../services/trello-handler.js';

export default {
	data: new SlashCommandBuilder()
		.setName('tasks')
		.setDescription('Get most recent tasks from Trello')
    .addSubcommand(subcommand => 
      subcommand
        .setName('work')
        .setDescription('Get work tasks')
    )
    .addSubcommand(subcommand => 
      subcommand
        .setName('personal')
        .setDescription('Get personal tasks')
    ),
	async execute(interaction) {
    const msg = await fetchTasks(interaction);

    // send to channel
    await interaction.reply(msg)
	},
};