import { NlpManager } from "node-nlp";
import fs from 'node:fs';

const MEDIA_REGEX_TYPES = '(?:movies?|books?|games?|podcasts?|videos?|albums?|music|tv|shows?|things?|media)';

export const manager = new NlpManager({ languages: ['en'], forceNER: true });

/*
  ADD TRAINING DOCUMENTS FOR INTENT
    - find_media
*/
manager.addDocument('en', 'list my %mediaCount% most recent books', 'find_media');
manager.addDocument('en', 'latest %mediaCount%  movies watched', 'find_media');
manager.addDocument('en', 'most recent music I listened to', 'find_media');

manager.addDocument('en', 'recent games', 'find_media');
manager.addDocument('en', 'list last %mediaCount% games I completed', 'find_media');

manager.addDocument('en', 'list my books that are in progress', 'find_media');
manager.addDocument('en', 'list my completed books', 'find_media');

manager.addDocument('en', 'show my abandoned books', 'find_media');
manager.addDocument('en', 'list my in progress movies', 'find_media');

manager.addDocument('en', 'give me new movies to watch', 'find_media');
manager.addDocument('en', 'give me %mediaCount%  new books to read', 'find_media');

manager.addDocument('en', `podcasts i haven't started`, 'find_media');
manager.addDocument('en', `albums i haven't started`, 'find_media');

manager.addDocument('en', 'movies i finished', 'find_media');
manager.addDocument('en', '%mediaCount% tv shows in progress', 'find_media');
manager.addDocument('en', 'media in progress', 'find_media');

/*
  ADD ENTITIES
    - mediaType
    - mediaStatus
    - mediaCount (regex to find the count more reliably)
*/
manager.addNamedEntityText('mediaType', 'Movie', ['en'], ['movie', 'movies']);
manager.addNamedEntityText('mediaType', 'Book', ['en'], ['book', 'books']);
manager.addNamedEntityText('mediaType', 'TV', ['en'], ['tv', 'tv shows', 'TV']);
manager.addNamedEntityText('mediaType', 'Videogame', ['en'], ['game', 'videogame', 'games', 'videogames', 'video game', 'video games']);
manager.addNamedEntityText('mediaType', 'Music', ['en'], ['music', 'album', 'albums']);
manager.addNamedEntityText('mediaType', 'Podcast', ['en'], ['podcast', 'podcasts']);

manager.addNamedEntityText('mediaStatus', 'Abandoned', ['en'], ['abandoned', 'gave up on', 'quit']);
manager.addNamedEntityText('mediaStatus', 'In Progress', ['en'], ['in progress', 'podcasts']);
manager.addNamedEntityText('mediaStatus', 'In Queue', ['en'], ['in queue', `haven't started`, 'new']);
manager.addNamedEntityText('mediaStatus', 'Completed', ['en'], ['completed', 'finished', 'done']);

manager.addRegexEntity(
  'mediaCount',
  'en',
  `/\\b(\\d+)\\s+${MEDIA_REGEX_TYPES}\\b/i`
);

// Train model
export const train = async () => {
  await manager.train();
  manager.save(); // saves to ./model.nlp
}

// Process text
export const processText = async (text) => {
  console.log(`Processing text for NLP: ${text}`);
  return manager.process('en', text);
}

// Load model if exists, otherwise train
export const loadNLP = async () => {
  if (fs.existsSync('./model.nlp')) {
    manager.load();
    console.log("Loaded NLP model.");
  } else {
    console.log("Training NLP model...");
    await train();
    console.log("Model trained & saved.");
  }
}