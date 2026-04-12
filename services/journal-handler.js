import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import supabase from "../util/db.js";

let lastPromptSent = {};

// update last sent date for prompt when confirmed completed via button interaction
export const updateLastSent = async () => {
  console.log('Updating last sent date for prompt:', JSON.stringify(lastPromptSent));
  const today = new Date();

  const { error } = await supabase.from('journal')
    .update({ last_sent: today })
    .eq('id', lastPromptSent.id);

  if (error) console.error('Error updating last sent date for prompt:', error);
};

export const fetchPrompt = async () => {
  // set base embed template and button
  let promptEmbed = new EmbedBuilder()
    .setTitle('Journal Prompt ✍️');
  
  // get all rows from supabase journal table 
  // where last_sent is null or more than 60 days ago
  const { data: prompts, error } = await supabase.from('journal')
    .select('*')
    .or('last_sent.is.null,last_sent.lte.' + new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

  if (error) console.error('Error fetching prompts from database:', error);

  // if no prompts found/err, send default message
  if (!prompts || !prompts.length) {
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

  // set up completed button
  const completedButton = new ButtonBuilder()
    .setCustomId('completed_prompt')
    .setLabel('Mark Completed')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(completedButton);

  // pick random prompt from list
  const randomIndex = Math.floor(Math.random() * prompts.length);
  const selectedPrompt = prompts[randomIndex];

  promptEmbed
    .setColor(0x18e3c1)
    .setDescription(`${selectedPrompt.prompt}`);

  // set last prompt sent so we can mark it completed later
  lastPromptSent = selectedPrompt;

  return { embeds: [promptEmbed], components: [row] };
};