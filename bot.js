import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import fs from 'node:fs'
import nodeCron from 'node-cron';
import { fetchWeather } from './services/weather-handler.js';
import { fetchTasks } from './services/trello-handler.js';
import { fetchRecipe } from './services/delicious-handler.js';
import { fetchGif } from './services/gif-handler.js';
import { fetchYoutube } from './services/youtube-handler.js';
import { fetchSubs } from './services/sub-handler.js';
import { fetchMedia, handleMediaModalSubmit } from './services/media-handler.js';
import { rollDanceTime } from './util/time.js';

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildIntegrations],
  partials: [Partials.Message, Partials.Reaction] 
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = await import (`./commands/${file}`);

	client.commands.set(command.default.data.name, command);
}

client.on('clientReady', async () => {
	console.log('bot has logged in');
	console.log(`${client.user.username}`);

	const channel = client.channels.cache.find(c => c.id === process.env.CHANNEL_ID);

	// send weather + tasks every day at 8 AM
	nodeCron.schedule('0 0 8 * * *', async () => {
		try {
			const weatherEmbed = await fetchWeather();
			channel.send({ embeds: [weatherEmbed] });

			// check for subscriptions that are renewing soon
			const subs = await fetchSubs();
			if (subs) channel.send({ embeds: [subs] })

			// if it's a weekday, send tasks and schedule a dance break
			const today = new Date();

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

				const currentDance = nodeCron.schedule(`0 ${danceMin} ${danceHour} * * *`, async () => {
					try {
						let danceUrl = await fetchGif('dance');
						channel.send(danceUrl);
						channel.send('🚨 🪩 🦀 dance break 🦀 🪩 🚨');
					} catch (error) {
						console.log(error);
					}
				});

				nodeCron.schedule('0 59 23 * * *', async () => {
					currentDance.stop();
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
	try {
		// handle button interactions
		if (interaction.isButton()) {
			if (interaction.customId.startsWith('music')) {
				const videoUrl = await fetchYoutube(interaction);
				return interaction.reply(videoUrl);
			}

			if (interaction.customId.startsWith('media')) {
				return fetchMedia(interaction);
			}
		}

		// handle modal submissions
		if (interaction.customId === 'mediaModal') {
			await handleMediaModalSubmit(interaction);
			return interaction.reply({ content: 'Media added successfully!' });
		}

		// handle slash commands
		if (interaction.isCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (command) await command.default.execute(interaction);
		}
	} catch (error) {
		console.error('Interaction error:', error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(process.env.CRAB_BOT_TOKEN);