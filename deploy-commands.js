import dotenv from 'dotenv';
dotenv.config()

import fs from 'node:fs'
import {REST} from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = await import (`./commands/${file}`);

	commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.CRAB_BOT_TOKEN);

await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

// (async () => {
//   try {
//     console.log('Started refreshing application (/) commands.');

//     await rest.put(
//       Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
//       { body: commands },
//     );

//     console.log('Successfully reloaded application (/) commands.');
//   } catch (error) {
//     console.log('error')
//     console.error(error);
//   }
// })();