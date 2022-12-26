import dotenv from 'dotenv';
dotenv.config()

import { Client, Collection, Intents } from 'discord.js';
import fs from 'node:fs'
import nodeCron from 'node-cron';
import { fetchWeather } from './services/weather-handler.js';
import { fetchTasks } from './services/trello-handler.js';
import { fetchRecipe } from './services/delicious-handler.js';
import { fetchGif } from './services/gif-handler.js';
import { rollDanceTime } from './util/time.js';

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
	console.log('bot has logged in');
	console.log(`${client.user.username}`);

	const channel = client.channels.cache.find(c => c.id === process.env.CHANNEL_ID);

	// send weather + tasks every day at 8 AM
	nodeCron.schedule('0 0 8 * * *', async () => {
		try {
			const weatherEmbed = await fetchWeather();
			channel.send({ embeds: [weatherEmbed] });

			// if it's a weekday, send tasks and schedule a dance break
			const today = new Date();
			let danceSchedule;

			// clear dance time if applicable
			danceSchedule ? danceSchedule.stop() : '';

			if (today.getDay() > 0 && today.getDay() < 6) {
				const workTasks = await fetchTasks();
				channel.send(workTasks);

				// send a timesheet reminder on mondays
				if (today.getDay() === 1) {
					let timeUrl = await fetchGif('time');
					channel.send(timeUrl);
					channel.send(`If you haven't already, be sure to complete your timesheet!`);
				}

				// schedule a random dance break
				const danceBreak = rollDanceTime();
				const danceHour = danceBreak.getHours().toString();
				const danceMin = danceBreak.getMinutes().toString();

				danceSchedule = nodeCron.schedule(`0 ${danceMin} ${danceHour} * * *`, async () => {
					try {
						let danceUrl = await fetchGif('dance');
						channel.send(danceUrl);
						channel.send('🚨 🪩 🦀 dance break 🦀 🪩 🚨');
					} catch (error) {
						console.log(error);
					}
				});
			}

		} catch (error) {
			console.log(error);
		}
	});

	// send recipe every day at 12 PM
	nodeCron.schedule('0 0 12 * * *', async () => {
		try {
			const recipeEmbed = await fetchRecipe();
			console.log('sending recipe');
			channel.send({ embeds: [recipeEmbed] });
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