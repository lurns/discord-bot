import dotenv from 'dotenv';
dotenv.config()

import { Client, Collection, Intents, CommandInteraction } from 'discord.js';
import fs from 'node:fs'
import nodeCron from 'node-cron';
import { fetchWeather } from './services/weather-handler.js';
import { fetchTasks } from './services/trello-handler.js';

const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS],
  partials: ['MESSAGE','REACTION'] 
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = await import (`./commands/${file}`);

	client.commands.set(command.default.data.name, command);
}

client.on('ready', async () => {
  console.log('bot has logged in')
  console.log(`${client.user.username}`)

	const channel = client.channels.cache.find(c => c.id === process.env.CHANNEL_ID)

	// send weather every day at 8 AM
	nodeCron.schedule('* * 8 * * *', async () => {
		try {
			const weatherEmbed = await fetchWeather();
			channel.send({ embeds: [weatherEmbed] });

			// if it's a weekday, send tasks
			const today = new Date();

			if (today.getDay() === 6) {
				const workTasks = await fetchTasks();
				channel.send(workTasks)
			}

		} catch (error) {
			console.log(error);
		}
	});

});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.default.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.CRAB_BOT_TOKEN);