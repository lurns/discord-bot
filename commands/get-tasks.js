import { SlashCommandBuilder } from '@discordjs/builders'
import fetch from "node-fetch";

const board = process.env.PERSONAL_BOARD;

export default {
	data: new SlashCommandBuilder()
		.setName('get-tasks')
		.setDescription('Get most recent tasks from Trello'),
	async execute(interaction) {
    // get tasks from trello board
    const res = await fetch(`https://api.trello.com/1/boards/${board}/cards?key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => {
        // console.log(
        //   `Response: ${response.status} ${response.statusText}`
        // );
        return response.text();
      })
      .then(text => {
        //console.log(text)
        return text;
      })
      .catch(err => console.error(err));
  
    var tasks = JSON.parse(res);

    // sort by most recent
    tasks.sort((a, b) => {
      return new Date(b.dateLastActivity) - new Date(a.dateLastActivity);
    });

    let msg = `here's what's in the crab pot: \n`;

    // format message
    for (var i = 0; i < 3; i++) {
      msg += `***card ${i + 1}*** / ${tasks[i].name} \n`
    }

    // send to channdel
    await interaction.reply(msg)
	},
};