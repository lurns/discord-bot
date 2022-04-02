import { SlashCommandBuilder } from '@discordjs/builders'
import fetch from "node-fetch";

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
    let board = ''

    // get type of board from subcommand
    if (interaction.options.getSubcommand() === 'work') {
      board = process.env.WORK_BOARD;
    } else if (interaction.options.getSubcommand() === 'personal') {
      board = process.env.PERSONAL_BOARD;
    }

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

    //console.log(tasks[0])

    let msg = `here's what's in the crab pot for ${interaction.options.getSubcommand()}: \n --- \n`;

    // format message
    for (var i = 0; i < 3; i++) {
      const resList = await fetch(`https://api.trello.com/1/cards/${tasks[i].id}/list?key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`, {
        method: 'GET'
      })
        .then(response => {
          // console.log(
          //   `Response: ${response.status} ${response.statusText}`
          // );
          return response.text();
        })
        .then(text => text)
        .catch(err => console.error(err));
      
      let list = JSON.parse(resList);
      let status = '';

      if (list.name === 'Completed') {
        status = `🥳`
      } else if (list.name === 'To Do') {
        status = `👀`
      } else {
        status = `👷🏽‍♀️`
      }

      msg += `***card ${i + 1}*** / ${status} ${list.name} / ${tasks[i].name} \n`
    }

    // send to channel
    await interaction.reply(msg)
	},
};