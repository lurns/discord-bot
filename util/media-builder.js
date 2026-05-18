import { 
  LabelBuilder, 
  StringSelectMenuBuilder, 
  StringSelectMenuOptionBuilder, 
  TextInputBuilder, 
  TextInputStyle
} from "discord.js";

const mediaTypes = [
  {
    label: "Movie",
    description: "Seen any good flicks lately?",
    emoji: "🎬",
    value: "Movie"
  },
  {
    label: "TV",
    description: "Anything good on?",
    emoji: "📺",
    value: "TV"
  },
  {
    label: "Podcast",
    description: `Who's yappin'?`,
    emoji: "🎧",
    value: "Podcast"
  },
  {
    label: "Videogame",
    description: "Are ya winning, son?",
    emoji: "🎮",
    value: "Videogame"
  },
  {
    label: "Music",
    description: "What tunes are you spinning?",
    emoji: "🎵",
    value: "Music"
  },
  {
    label: "Book",
    description: `Let's get those personal pan pizzas cookin'!`,
    emoji: "📚",
    value: "Book"
  }
]

const mediaStatuses = [
  {
    label: "Completed",
    description: "Done-zo",
    emoji: "🤝",
    value: "Completed"
  },
  {
    label: "In Progress",
    description: `Workin' on it...`,
    emoji: "🚧",
    value: "In Progress"
  },
  {
    label: "Abandoned",
    description: `Ugh this sucks, I'm outta here`,
    emoji: "✌️",
    value: "Abandoned"
  },
  {
    label: "In Queue",
    description: `Upcoming stuff to check out`,
    emoji: "✍️",
    value: "In Queue"
  }
]

export const titleBuilder = () => {
  return new LabelBuilder()
    .setLabel("Title")
    .setDescription("Name of media")
    .setTextInputComponent(
      new TextInputBuilder()
        .setCustomId("mediaTitleInput")
        .setPlaceholder("Mean Girls")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
    );
}

export const typesBuilder = () => {
  let mediaTypeOptions = mediaTypes.map(type => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(type.label)
      .setDescription(type.description)
      .setEmoji(type.emoji)
      .setValue(type.value);
  });

  return new LabelBuilder()
    .setLabel("Type")
    .setDescription("Select the type of media")
    .setStringSelectMenuComponent(new StringSelectMenuBuilder()
      .setCustomId("mediaTypeInput")
      .setPlaceholder("Choose media type")
      .setRequired(true)
      .setOptions(mediaTypeOptions)
    );
}

export const statusesBuilder = () => {
  let mediaStatusOptions = mediaStatuses.map(status => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(status.label)
      .setDescription(status.description)
      .setEmoji(status.emoji)
      .setValue(status.value);
  });

  return new LabelBuilder()
    .setLabel("Status")
    .setDescription("Select status of where you're at")
    .setStringSelectMenuComponent(new StringSelectMenuBuilder()
      .setCustomId("mediaStatusInput")
      .setPlaceholder("Choose your status")
      .setRequired(true)
      .setOptions(mediaStatusOptions)
    );
}

export const ratingBuilder = () => {
  return new LabelBuilder()
    .setLabel("Rating")
    .setDescription("Give it a ⭐️ rating (1-5)")
    .setTextInputComponent(
      new TextInputBuilder()
        .setCustomId("mediaRatingInput")
        .setPlaceholder("5")
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
    );
}

export const notesBuilder = () => {
  return new LabelBuilder()
    .setLabel("Notes")
    .setDescription("Any thoughts? Any????")
    .setTextInputComponent(
      new TextInputBuilder()
        .setCustomId("mediaNotesInput")
        .setPlaceholder("brb buying army pants and flip flops")
        .setMaxLength(1_000)
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
    );
}
