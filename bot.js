import dotenv from 'dotenv';
dotenv.config()

import { Client, Collection, Intents } from 'discord.js';
import fs from 'node:fs'

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

client.on('ready', () => {
  console.log('bot has logged in')
  console.log(`${client.user.username}`)
})

client.on('interactionCreate', async (interaction) => {
  console.log('uhhh')
  if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
    console.log(command)
		await command.default.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})

client.login(process.env.CRAB_BOT_TOKEN);