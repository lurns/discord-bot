import { ModalBuilder, LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import * as sheet from "../util/sheets.js";
import { rowsToObjects } from "../util/sheets.js";

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

const mediaStatusEmoji = (status) => {
  switch (status) {
    case 'Completed':
      return '🤝';
    case 'In Progress':
      return '🚧';
    case 'Abandoned':
      return '✌️';
    case 'In Queue':
      return '✍️';
    default:
      return '';
  }
}

// determine any intent filters and format request
const formatMediaReq = (mediaReq = {}) => ({
  mediaType: mediaReq.mediaType ?? null,
  mediaStatus: mediaReq.mediaStatus ?? null,
  startDate: mediaReq.startDate ?? null,
  endDate: mediaReq.endDate ?? null,
  count: mediaReq.count ?? 10,
});

// filter media based on user input
const filterMedia = (mediaObjects, filters) => {
  return mediaObjects.filter(media => {
    if (filters.mediaType && media.Type !== filters.mediaType) {
      return false;
    }

    if (filters.mediaStatus && media.Status !== filters.mediaStatus) {
      return false;
    }

    if (filters.startDate && filters.endDate) {
      const mediaDate = new Date(media.Date);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      if (mediaDate < start || mediaDate > end) {
        return false;
      }
    }

    return true;
  });
};

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

const viewMedia = async (mediaReq) => {
  console.log('Viewing media with request:', mediaReq);

  const sheetRes = await sheet.readSheet("media", `media!A:F`);
  let mediaObjects = rowsToObjects(sheetRes);

  // filter media based on user input if available
  const filters = formatMediaReq(mediaReq);
  mediaObjects = filterMedia(mediaObjects, filters);

  console.log(`Found ${mediaObjects.length} media items after filtering.`);
  console.log('Media items:', JSON.stringify(mediaObjects));

  // set up media embed
  let viewMediaEmbed = {
    color: 0x0b5394,
    title: mediaObjects.length ? `Here's your recent media consumption 🎬📚🎧` : `No media found. 😱`,
    description: ''
  }

  // append value to each embed field
  // used google app script to auto-sort sheet by date
  for (const media of mediaObjects.slice(0, filters.count)) {
    viewMediaEmbed.description += `${mediaEmoji(media.Type)} ${mediaStatusEmoji(media.Status)} ** ${media.Title} ** *${media.Date}*\n`;
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
    console.error(e);
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

export const parseFindMedia = async (modelResponse) => {
  let mediaReq = {};

  // extract entities
  for (const entity of modelResponse) {
    switch (entity.entity) {
      case 'mediaType':
        mediaReq.mediaType = entity.option;
        break;
      case 'mediaStatus':
        mediaReq.mediaStatus = entity.option;
        break;
      case 'mediaCount':
      // case 'number':
        const parsedCount = parseInt(entity.sourceText);
        if (!isNaN(parsedCount) && parsedCount > 0) mediaReq.count = parsedCount;
        break;
      case 'daterange':
        mediaReq.startDate = entity.resolution?.start;
        mediaReq.endDate = entity.resolution?.end;
        break;
      default:
        break;
    }
  }

  // fetch and return media view embed
  return viewMedia(mediaReq);
}