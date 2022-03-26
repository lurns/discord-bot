import dotenv from 'dotenv';

dotenv.config()

import { Client, Intents } from 'discord.js';

const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILDS],
  partials: ['MESSAGE','REACTION'] 
});

client.on('ready', () => {
  console.log('bot has logged in')
  console.log(`${client.user.username}`)
})

client.login(process.env.CRAB_BOT_TOKEN);