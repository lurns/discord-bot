import { 
  ActionRowBuilder,
  MessageFlags,
  ModalBuilder, 
  LabelBuilder, 
  StringSelectMenuBuilder, 
  StringSelectMenuOptionBuilder, 
  TextInputBuilder, 
  TextInputStyle
} from "discord.js";
import supabase from "../util/db.js";
import { notesBuilder, ratingBuilder, statusesBuilder, titleBuilder, typesBuilder } from "../util/media-builder.js";

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
const filterMedia = async (filters) => {
  let query = supabase
    .from('media')
    .select('*')
    .order('date', { ascending: false });

  if (filters.mediaType)  { query = query.eq('type', filters.mediaType) }
  if (filters.mediaStatus)  { query = query.eq('status', filters.mediaStatus) }
  if (filters.startDate) { query = query.gte('date', filters.startDate.toISOString()) }
  if (filters.endDate) { query = query.lte('date', filters.endDate.toISOString()) }
  if (filters.count) { query = query.limit(filters.count) }

  const { data, error } = await query;

  if (error) {
    console.error('Error filtering media:', error);
    return [];
  } else {
    return data;
  }
};

export const fetchMedia = async (interaction) => {
  if (interaction) {
    switch (interaction.customId) {
      case 'media-add':
        return addMediaModal(interaction);
      case 'media-edit':
        return searchMediaModal(interaction);
      case 'media-view':
        return interaction.reply({ embeds: [await viewMedia()] });
      default:
        return interaction.reply({ content: 'Unknown media action.', flags: MessageFlags.Ephemeral });
    }
  }
}

const viewMedia = async (mediaReq) => {
  console.log('Viewing media with request:', mediaReq);
  let mediaItems = [];

  if (mediaReq) {
    console.log('Media request provided, fetching and filtering media...');
    const filters = formatMediaReq(mediaReq);

    mediaItems = await filterMedia(filters);
  } else {
    console.log('No media request provided, fetching last 10 media items...');
    const { data, error } = await supabase.from('media').select('*').order('date', { ascending: false }).limit(10);
    
    if (error) {
      console.error('Error fetching media:', error);
    } else {
      mediaItems = [...data];
    }
  }

  console.log(`Found ${mediaItems.length} media items.`);

  // set up media embed
  let viewMediaEmbed = {
    color: 0x0b5394,
    title: mediaItems.length ? `Here's your recent media consumption 🎬📚🎧` : `No media found. 😱`,
    description: ''
  }

  // append value to each embed field
  for (const media of mediaItems) {
    viewMediaEmbed.description += `${mediaEmoji(media.type)} ${mediaStatusEmoji(media.status)} ** ${media.title} ** *${media.date}*\n`;
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
      const header = key.charAt(0).toLowerCase() + key.slice(1);

      submittedData[header] = value;
    }

    // Add today's date in MM/DD/YYYY format
    submittedData.date = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });

    // Convert rating to a number if it exists
    submittedData.rating = parseFloat(submittedData.rating) ?? null;
    
    // save to db
    const { data: addedMedia, error } = await supabase.from('media').insert(submittedData).select();

    if (error) {
      console.error('Error adding media:', error);
    } else {
      console.log('Media added successfully:', addedMedia);
    }
  } catch (e) {
    console.error(e);
  }
}

// modal for searching media by title - used for edit flow
const searchMediaModal = async (interaction) => {
  // create modal
  const modal = new ModalBuilder()
    .setCustomId('searchMediaModal')
    .setTitle('Search by Media Title');

  // search by title input component
  modal.addLabelComponents(
    new LabelBuilder()
      .setLabel("Title")
      .setDescription("Name of media to search for")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("searchMediaTitleInput")
          .setPlaceholder("Mean Girls")
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
      )
  );

  // Show the modal to the user
  return await interaction.showModal(modal); 
}

// parse media search results and return embed with select menu of results
export async function handleSearchMediaModalSubmit(interaction) {
  try {
    const searchTitle = interaction.components[0].component.value;

    // search for titles like the input
    const { data: mediaItems, error } = await supabase
      .from('media')
      .select('*')
      .ilike('title', `%${searchTitle}%`)
      .order('date', { ascending: false });

    if (error) {
      console.error(`Error searching media with title "${searchTitle}":`, error);
    } else {
      console.log('Media search results:', mediaItems);
      if (mediaItems.length === 0) {
        return interaction.reply({ content: `No media found with title like "${searchTitle}".`, flags: MessageFlags.Ephemeral });
      }

      // set up media search results embed
      // todo make this look nicer
      let searchSelectOptions = [];
      let searchMediaResultsEmbed = {
        color: 0x0b5394,
        title: `Search results for "${searchTitle}" 🎬📚🎧`,
        description: ''
      }

      // create select menu options from search results
      for (const media of mediaItems) {
        searchSelectOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`${media.title} (${media.type})`)
            .setValue(media.id.toString())
            .setDescription( `Status: ${media.status}, Date: ${media.date}`) 
        );
      }

      // add select menu to embed
      const select = new StringSelectMenuBuilder().setCustomId('searchMediaResultsSelect').addOptions(searchSelectOptions);
		  const selectRow = new ActionRowBuilder().addComponents(select);

     return { embeds: [searchMediaResultsEmbed], components: [selectRow], withResponse: true };
    }
  } catch (e) {
    console.error(e);
  }
}

export async function handleEditMediaModalSubmit(interaction) {
  try {
    // fetch media item by id
    const mediaId = interaction.customId.split('_')[1];
    let { data: mediaItem } = await supabase.from('media').select('*').eq('id', mediaId).single();

    for (const component of interaction.components) {
      const comp = component.component;
      const value = comp.type === 3 ? comp.values[0] : comp.value;

      // extract key from customId
      const key = comp.customId
        .replace(/^media/i, "")
        .replace(/Input$/i, "");
      const header = key.charAt(0).toLowerCase() + key.slice(1);

      mediaItem[key.toLowerCase()] = value;
    }

    // Add today's date in MM/DD/YYYY format
    mediaItem.date = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });

    // Convert rating to a number if it exists
    mediaItem.rating = parseFloat(mediaItem.rating) ?? null;
    
    // save to db
    const { error: editError } = await supabase.from('media').update(mediaItem).eq('id', mediaId).select();

    if (editError) console.error('Error updating media:', editError);

  } catch (e) {
    console.error(e);
  }
}

const buildMediaModal = (mediaItem = null) => {
  let title = titleBuilder();
  let types = typesBuilder();
  let statuses = statusesBuilder();
  let rating = ratingBuilder();
  let notes = notesBuilder();
  
  // if editing an item, pre-fill modal values
  if (mediaItem) {
    // prefill title
    title.data.component.setValue(mediaItem.title);

    // preselect type
    for (let option of types.data.component.options) {
      if (option.data.value === mediaItem.type) {
        option.setDefault(true);
        break;
      }
    }

    // preselect status
    for (const option of statuses.data.component.options) {
      if (option.data.value === mediaItem.status) {
        option.setDefault(true);
        break;
      }
    }

    // prefill rating
    if (mediaItem.rating) {
      rating.data.component.setValue(mediaItem.rating.toString());
    }

    // prefill notes
    if (mediaItem.notes) {
      notes.data.component.setValue(mediaItem.notes);
    }
  }

  return [title, types, statuses, rating, notes];
}

// edit media modal
export const editMediaModal = async (interaction, mediaId) => {
  // fetch media item by id
  const { data: mediaItem } = await supabase.from('media').select('*').eq('id', mediaId).single();

  let modal = new ModalBuilder()
    .setCustomId(`editMediaModal_${mediaId}`)
    .setTitle('Edit Media Consumption');

  const modalComponents = buildMediaModal(mediaItem);

  // set up modal form components with pre-filled values
  modal.addLabelComponents(...modalComponents);

  // Show the modal to the user
  await interaction.showModal(modal);
}

const addMediaModal = async (interaction) => {
  // create modal
  const modal = new ModalBuilder()
    .setCustomId(`addMediaModal_${Date.now()}`)
    .setTitle('Add Media Consumption');

  // get modal components
  const modalComponents = buildMediaModal();

  // set up modal form components
  modal.addLabelComponents(...modalComponents);

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