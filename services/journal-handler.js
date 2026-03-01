import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { readSheet, updateRow, rowsToObjects } from "../util/sheets.js";

let lastPromptSent = {};

// update last sent date for prompt when confirmed completed via button interaction
export const updateLastSent = async () => {
  const today = new Date().toLocaleDateString();

  // update google sheet using prompt as unique key
  await updateRow(
    "journal",
    "Prompt", 
    lastPromptSent.Prompt,
    { ['Last Sent']: today }
  );
};

export const fetchPrompt = async () => {
  // get all rows from the "journal" sheet
  const rows = await readSheet("journal");
  if (!rows.length) return;

  const prompts = rowsToObjects(rows);

  // filter to prompts that haven't been sent within the last 60 days
  const today = new Date().toLocaleDateString();

  let validPrompts = [];

  for (const prompt of prompts) {
    // if never sent, add to valid prompts
    if (!prompt['Last Sent']) {
      validPrompts.push(prompt);
      continue;
    }

    const lastSentDate = new Date(prompt['Last Sent']).toLocaleDateString();
    const daysSinceLastSent = (new Date(today) - new Date(lastSentDate)) / (1000 * 60 * 60 * 24);

    if (daysSinceLastSent >= 60) validPrompts.push(prompt);
  }

  console.log(`Found ${validPrompts.length} valid prompts.`);

  // set base embed template and button
  let promptEmbed = new EmbedBuilder()
    .setTitle('Journal Prompt ✍️');
    
  const completedButton = new ButtonBuilder()
    .setCustomId('completed_prompt')
    .setLabel('Mark Completed')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(completedButton);

  // select a random prompt from the valid prompts or send default, return embed
  if (validPrompts.length > 0) {
    const randomIndex = Math.floor(Math.random() * validPrompts.length);
    const selectedPrompt = validPrompts[randomIndex];

    promptEmbed
      .setColor(0x18e3c1)
      .setDescription(`${selectedPrompt.Prompt}`);

    // set last prompt sent so we can mark it updated later
    lastPromptSent = selectedPrompt;

    return { embeds: [promptEmbed], components: [row] };
  } else {
    promptEmbed 
      .setColor(0xff7a7a)
      .setDescription(`
        Didn't find any new prompts! \n
        You can always write about something you're grateful for, 
        something that challenged you recently, 
        or something you're looking forward to.
      `);

    return { embeds: [promptEmbed] };
  }
};