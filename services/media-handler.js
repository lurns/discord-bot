import { ModalBuilder, LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import * as sheet from "../util/sheets.js";

const mediaEmoji = (mediaType) => {
  switch (mediaType) {
    case 'Movie':
      return '🎬';
    case 'Book':
      return '📚';
    case 'Podcast':
      return '🎧';
    case 'Videogame':
      return '🎮';
    case 'Music':
      return '🎵';
    case 'TV':
    default:
      return '📺';
  }
}

export const fetchMedia = async (interaction) => {
  if (interaction) {
    switch (interaction.customId) {
      case 'media-add':
        return addMediaModal(interaction);
      case 'media-edit':
        return interaction.reply({ content: 'Edit definitely coming soon 🚧', ephemeral: true });
      case 'media-view':
        return interaction.reply({ embeds: [await viewMedia()] });
      default:
        return interaction.reply({ content: 'Unknown media action.', ephemeral: true });
    }
  }
}

const viewMedia = async () => {
  const sheetRes = await sheet.readSheet("media", "media!A1:F11");

  let viewMediaEmbed = {
    color: 0x0b5394,
    title: `Here's your recent media consumption 🎬📚🎧`,
    description: ''
  }

  // rm header
  // used google app script to auto-sort sheet by date
  for (var media of sheetRes.slice(1,11)) {
    viewMediaEmbed.description += `${mediaEmoji(media[1])} ${media[0]} ${media[2]} \n`
  }

  return viewMediaEmbed;
}

export async function handleMediaModalSubmit(interaction) {
  try {
    const submittedData = {};

    for (const component of interaction.components) {
      const comp = component.component;
      const value = comp.type === 3 ? comp.values[0] : comp.value;

      // extract key from customId
      const key = comp.customId
        .replace(/^media/i, "")
        .replace(/Input$/i, "");
      const header = key.charAt(0).toUpperCase() + key.slice(1);

      submittedData[header] = value;
    }

    // Add today's date in MM/DD/YYYY format
    submittedData.Date = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });

    // save to sheet
    await sheet.addRow("media", submittedData);
  } catch (e) {
  }
}

const addMediaModal = async (interaction) => {
  // create modal
  const modal = new ModalBuilder()
    .setCustomId('mediaModal')
    .setTitle('Add Media Consumption');

  // set up modal form components
  modal.addLabelComponents(
    // title
    new LabelBuilder()
      .setLabel("Title")
      .setDescription("Name of media")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("mediaTitleInput")
          .setPlaceholder("Mean Girls")
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
      ),
    // type
    new LabelBuilder()
      .setLabel("Type")
      .setDescription("Select the type of media")
      .setStringSelectMenuComponent(new StringSelectMenuBuilder()
        .setCustomId("mediaTypeInput")
        .setPlaceholder("Choose media type")
        .setRequired(true)
        .setOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Movie")
            .setDescription("Seen any good flicks lately?")
            .setEmoji("🎬")
            .setValue("Movie"),
          new StringSelectMenuOptionBuilder()
            .setLabel("TV")
            .setDescription("Anything good on?")
            .setEmoji("📺")
            .setValue("TV"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Podcast")
            .setDescription(`Who's yappin'?`)
            .setEmoji("🎧")
            .setValue("Podcast"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Videogame")
            .setDescription("Are ya winning, son?")
            .setEmoji("🎮")
            .setValue("Videogame"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Music")
            .setDescription("Are ya winning, son?")
            .setEmoji("🎵")
            .setValue("Music"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Book")
            .setDescription(`Let's get those personal pan pizzas cookin'!`)
            .setEmoji("📚")
            .setValue("Book")
        )
      ),
    // status
    new LabelBuilder()
      .setLabel("Status")
      .setDescription("Select status of where you're at")
      .setStringSelectMenuComponent(new StringSelectMenuBuilder()
        .setCustomId("mediaStatusInput")
        .setPlaceholder("Choose your status")
        .setRequired(true)
        .setOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Completed")
            .setDescription("Done-zo")
            .setEmoji("🤝")
            .setValue("Completed"),
          new StringSelectMenuOptionBuilder()
            .setLabel("In Progress")
            .setDescription("Workin on it")
            .setEmoji("🚧")
            .setValue("In Progress"),
          new StringSelectMenuOptionBuilder()
            .setLabel('Abandoned')
            .setDescription(`Ugh this sucks, I'm outta here`)
            .setEmoji("✌️")
            .setValue('Abandoned'),
          new StringSelectMenuOptionBuilder()
            .setLabel('In Queue')
            .setDescription(`Upcoming stuff to check out`)
            .setEmoji("✍️")
            .setValue('In Queue')
        )
      ),
    // rating
    new LabelBuilder()
      .setLabel("Rating")
      .setDescription("Give it a ⭐️ rating (1-5)")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("mediaRatingInput")
          .setPlaceholder("5")
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
      ),
    // notes
    new LabelBuilder()
      .setLabel("Notes")
      .setDescription("Any thoughts? Any????")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("mediaNotesInput")
          .setPlaceholder("brb buying army pants and flip flops")
          .setMaxLength(1_000)
          .setRequired(false)
          .setStyle(TextInputStyle.Paragraph)
      )
  );

  // Show the modal to the user
  await interaction.showModal(modal); 
}