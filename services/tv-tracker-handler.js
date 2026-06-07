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

const STATUS = {
  AIRING: 'Airing',
  BETWEEN_SEASONS: 'Between Seasons',
  UPCOMING: 'Upcoming',
  ENDED: 'Ended'
}

// modal for searching tv to track by title
export const searchMediaToTrackModal = async (interaction) => {
  // create modal
  const modal = new ModalBuilder()
    .setCustomId('searchMediaToTrackModal')
    .setTitle('Search by Media Title');

  // search by title input component
  modal.addLabelComponents(
    new LabelBuilder()
      .setLabel("Title")
      .setDescription("Name of tv show to track")
      .setTextInputComponent(
        new TextInputBuilder()
          .setCustomId("searchMediaToTrackTitleInput")
          .setPlaceholder("The Office")
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
      )
  );

  // Show the modal to the user
  return await interaction.showModal(modal); 
}

// search results from modal submission
export const handleSearchMediaToTrackModalSubmit = async (interaction) => {
  try {
    const searchTitle = interaction.components[0].component.value;

    // search tmdb using title to get list of potential matches to select from
    const res = await searchShowByTitle(searchTitle);

    if (!res.results) {
      console.error(`Error searching media with title "${searchTitle}":`, error);
    } else if (res.results.length === 0) {
      return interaction.reply({ content: `No media found with title like "${searchTitle}".`, flags: MessageFlags.Ephemeral });
    } else {
      // set up media search results embed
      let searchSelectOptions = [];
      let searchMediaResultsEmbed = {
        color: 0x0b5394,
        title: `Search results for "${searchTitle}" 📺`,
        description: ''
      }

      // create select menu options from search results
      for (const show of res.results) {
        searchSelectOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`${show.name} | First Air Date: ${show.first_air_date}`)
            .setValue(show.id.toString())
            .setDescription( `${show.overview.substring(0, 90)}...` ) 
        );
      }

      // add select menu to embed
      const select = new StringSelectMenuBuilder().setCustomId('searchMediaToTrackResultsSelect').addOptions(searchSelectOptions);
		  const selectRow = new ActionRowBuilder().addComponents(select);

     return { embeds: [searchMediaResultsEmbed], components: [selectRow], withResponse: true };
    }
  } catch (error) {
    console.log(error);
    return { content: 'An error occurred while searching for media.' };
  }
}

// called by cron job to check for shows with new episodes airing today and send back embed if any found
export const checkNewEpisodes = async () => {
  const { data: trackedShows, error } = await supabase
    .from('tracked_shows')
    .select('*')
    .eq('next_check_at', new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" }));

  if (error) {
    console.error('Error fetching tracked shows:', error);
    return null;
  }
  
  if (trackedShows.length === 0) {
    console.log('No tracked shows with new episodes airing today.');
    return null;
  }

  let showsToPost = [];

  // we need to check the api for each show to see if there's a new ep
  // and we need to update the db either way to set the next check date and update the last known episode
  for (const show of trackedShows) {
    const showRes = await getShowDetails(show.tmdb_id);

    // if next episode to air is different than last known episode, we know a new episode is airing
    if (isNewEpisode(show, showRes)) {
      const isFinale = showRes.last_episode_to_air.episode_type === 'finale' ? true : false;

      showsToPost.push({
        name: show.show_name,
        next_episode_number: showRes.next_episode_to_air.episode_number,
        isFinale
      });
    }
    
    // update tracked show with new episode info and next check date
    await updateTrackedMedia(show.id, showRes);
  }

  if (showsToPost.length > 0) {
    // set up airing embed
    let showsAiringEmbed = {
      color: 0xf669dd,
      title: `Here's what's on today 📺`,
      description: ''
    }

    // append value to embed desc
    for (const airingShow of showsToPost) {
      showsAiringEmbed.description += `** ${airingShow.name} ** #${airingShow.next_episode_number} ${airingShow.isFinale ? '(Finale)' : ''}\n`;
    }

    return showsAiringEmbed;
  }
}

const updateTrackedMedia = async (showId, showRes) => {
  try {
    const status = determineStatus(showRes);

    const today = new Date();

    await supabase
      .from('tracked_shows')
      .update({
        status: status,
        last_known_episode: {
          season: showRes.last_episode_to_air.season_number,
          episode: showRes.last_episode_to_air.episode_number,
          episode_name: showRes.last_episode_to_air.name,
          air_date: new Date(showRes.last_episode_to_air.air_date)
        },
        next_episode_at: showRes.next_episode_to_air ? new Date(showRes.next_episode_to_air.air_date) : null,
        next_check_at: showRes.next_episode_to_air ? new Date(showRes.next_episode_to_air.air_date) : determineCheckDate(status),
        updated_at: today.toLocaleDateString("en-US", { timeZone: "America/Chicago" })
      })
      .eq('id', showId);
  } catch (error) {
    console.error('Error updating tracked media:', error);
  }
}

export const addToTrackedMedia = async (showId) => {
  try {
    // get details based on selected show
    const showRes = await getShowDetails(showId);

    // get status based on tvdb status/whether new episodes are airing
    let status = determineStatus(showRes);

    // setup dates for when to check for new episodes based on status
    const today = new Date();

    let { data, error } = await supabase
      .from('tracked_shows')
      .insert([
        { 
          tmdb_id: showRes.id, 
          show_name: showRes.name, 
          last_known_episode: {
            season: showRes.last_episode_to_air.season_number,
            episode: showRes.last_episode_to_air.episode_number,
            episode_name: showRes.last_episode_to_air.name,
            air_date: new Date(showRes.last_episode_to_air.air_date)
          }, 
          status: status, 
          next_episode_at: showRes.next_episode_to_air ? new Date(showRes.next_episode_to_air.air_date) : null,
          next_check_at: showRes.next_episode_to_air ? new Date(showRes.next_episode_to_air.air_date) : determineCheckDate(status),
          updated_at: today.toLocaleDateString("en-US", { timeZone: "America/Chicago" })
        }
      ]);

    if (error) {
      console.error('Error tracking media:', error);
    } else {
      console.log('Tracking media added successfully:', data);
    }
  } catch (error) {
    console.log(error);
  }
}

// HELPERS
const isNewEpisode = (show, showRes) => {
  const nextTVDB = showRes.next_episode_to_air;
  const lastTVDB = showRes.last_episode_to_air;

  // Nothing airing and nothing has ever aired — nothing to report
  if (!nextTVDB && !lastTVDB) return false;

  // Compare our last known episode air date to the next episode to air from the API
  // if it's newer, then we know something new is airing
  if (nextTVDB) {
    const nextAirDate = new Date(nextTVDB.air_date);
    const knownAirDate = show.last_known_episode && show.last_known_episode.air_date ? new Date(show.last_known_episode.air_date) : null;

    // New if the upcoming episode's air date is beyond what we last recorded
    if (!knownAirDate || nextAirDate > knownAirDate) {
      return true;
    }
  }

  // Check TVDB last_episode_to_air as a fallback
  // Handles the case where an episode already aired between intervals
  // and next_episode_to_air has already moved on (or is null, mid-hiatus)
  if (lastTVDB) {
    const lastAirDate = new Date(lastTVDB.air_date);
    const knownAirDate = show.last_known_episode && show.last_known_episode.air_date ? new Date(show.last_known_episode.air_date) : null;

    if (!knownAirDate || lastAirDate > knownAirDate) {
      return true;
    }
  }

  return false;
}

// determine status based on whether show is currently airing, between seasons, upcoming, or ended
// used for frequency of checking for new episodes and reference
const determineStatus = (show) => {
  if (show.status === 'Ended' || show.status === 'Canceled') return STATUS.ENDED;
  if (show.next_episode_to_air) return STATUS.AIRING;
  if (show.status === 'Returning Series') return STATUS.BETWEEN_SEASONS;
  return STATUS.UPCOMING;
}

// set frequency of checks based on whether show is currently airing or not
const determineCheckDate = (status) => {
  const today = new Date();

  if (status === STATUS.AIRING || status === STATUS.UPCOMING) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek.toLocaleDateString("en-US", { timeZone: "America/Chicago" });
  } else {
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    return nextMonth.toLocaleDateString("en-US", { timeZone: "America/Chicago" });
  }
}

// TMDB API calls
const searchShowByTitle = async (title) => {
  const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&language=en-US&page=1`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`
    }
  };

  const res = await fetch(url, options)
    .then(response => response.json())
    .catch(err => console.error(err));
  return res;
}

const getShowDetails = async (showId) => {
    const url = `https://api.themoviedb.org/3/tv/${showId}?language=en-US`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
      }
    };
    
    const showRes = await fetch(url, options)
      .then(response => response.json())
      .catch(err => console.error(err));
    return showRes;
}