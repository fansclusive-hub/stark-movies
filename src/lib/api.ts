// VidSrc API utilities

export interface MediaItem {
  imdb_id: string;
  tmdb_id?: string;
  title: string;
  type: 'movie' | 'tv' | 'anime';
  image?: string;
  thumbnail_url?: string;
  rating?: string;
  description?: string;
  year?: number;
  actors?: string;
  cast?: string;
  rank?: number;
}

export interface ApiResponse {
  result: MediaItem[];
  pages: number;
}

export interface ImdbSearchResponse {
  ok: boolean;
  description: Array<{
    '#TITLE': string;
    '#YEAR': number;
    '#IMDB_ID': string;
    '#RANK': number;
    '#ACTORS': string;
    '#AKA': string;
    '#IMDB_URL': string;
    '#IMDB_IV': string;
    '#IMG_POSTER': string;
    photo_width: number;
    photo_height: number;
  }>;
}

const EMBED_BASE_1 = 'https://vidsrc.cc/v2/embed';
const EMBED_BASE_2 = 'https://vidsrc-embed.ru/embed';
const IMDB_SEARCH_API = 'https://imdb.iamidiotareyoutoo.com/search';
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com';

export type ServerId = '1' | '2';

// Mock data with real TMDB poster paths for when API has CORS issues
const MOCK_MOVIES: MediaItem[] = [
  { imdb_id: 'tt15398776', tmdb_id: 'pnXLFioDeftqjlCVlRmXvIdMsdP', title: 'No Way Up', type: 'movie' },
  { imdb_id: 'tt14230458', tmdb_id: 'z1p34vh7dEOnLDV8oFV8XpJEMzW', title: 'Godzilla x Kong', type: 'movie' },
  { imdb_id: 'tt6263850', tmdb_id: '8b8R8l88Qje9dn9OE8PY05Nxl1X', title: 'Dune: Part Two', type: 'movie' },
  { imdb_id: 'tt0111161', tmdb_id: '9cqNxx0GxF0bflZmeSMuL5tnGzr', title: 'The Shawshank Redemption', type: 'movie' },
  { imdb_id: 'tt0816692', tmdb_id: 'gEU2QniE6E77NI6lCU6MxlNBvIx', title: 'Interstellar', type: 'movie' },
  { imdb_id: 'tt1375666', tmdb_id: '8IB2e4r4oVhHnANbnm7O3Tj6tF8', title: 'Inception', type: 'movie' },
  { imdb_id: 'tt0468569', tmdb_id: 'qJ2tW6WMUDux911r6m7haRef0WH', title: 'The Dark Knight', type: 'movie' },
  { imdb_id: 'tt0110912', tmdb_id: 'd5iIlFn5s0ImszYzBPb8JPIfbXD', title: 'Pulp Fiction', type: 'movie' },
  { imdb_id: 'tt0133093', tmdb_id: 'f89U3ADr1oiB1s9GkdPOEpXUk5H', title: 'The Matrix', type: 'movie' },
  { imdb_id: 'tt0068646', tmdb_id: '3bhkrj58Vtu7enYsRolD1fZdja1', title: 'The Godfather', type: 'movie' },
];

const MOCK_TV: MediaItem[] = [
  { imdb_id: 'tt0944947', tmdb_id: '1XS1oqL89opfnbLl8WnZY1O1uJx', title: 'Game of Thrones', type: 'tv' },
  { imdb_id: 'tt0903747', tmdb_id: 'ggFHVNu6YYI5L9pCfOacjizRGt', title: 'Breaking Bad', type: 'tv' },
  { imdb_id: 'tt4574334', tmdb_id: '49WJfeN0moxb9IPfGn8AIqMGskD', title: 'Stranger Things', type: 'tv' },
  { imdb_id: 'tt7366338', tmdb_id: 'reEMJA1uzscCbkpeRJeTT2bjqUp', title: 'Money Heist', type: 'tv' },
  { imdb_id: 'tt2861424', tmdb_id: '4EYPN5mVIhKLfxGruy7Dy41dTVn', title: 'Lucifer', type: 'tv' },
  { imdb_id: 'tt2306299', tmdb_id: 'xf9wuDcqlUPWABZNeDKPbZUjWx0', title: 'The Walking Dead', type: 'tv' },
];

const MOCK_ANIME: MediaItem[] = [
  { imdb_id: 'tt5311514', tmdb_id: 'xUfRZu2mi8jH6SXsr2MzmFPc1Lb', title: 'Demon Slayer', type: 'anime' },
  { imdb_id: 'tt0409591', tmdb_id: 'g8Ejpj4ijlWSV1zuwFTvmGCXMLJ', title: 'Death Note', type: 'anime' },
  { imdb_id: 'tt0388629', tmdb_id: 'xppeysfvDKVx775MFuH8Z9BlpMk', title: 'Naruto', type: 'anime' },
  { imdb_id: 'tt2560140', tmdb_id: 'hTP1DtLGFamjfu8WqjnuQdP1n4i', title: 'Attack on Titan', type: 'anime' },
];

// Fetch movies list
// Fetch movies list (dynamic)
export async function fetchMovies(_page: number = 1): Promise<ApiResponse> {
  try {
    const results = await searchMediaRemote('movie 2025');
    if (results.length > 0) {
      return { result: results, pages: 1 };
    }
    // Fallback if no results
    return { result: MOCK_MOVIES, pages: 1 };
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    return { result: MOCK_MOVIES, pages: 1 };
  }
}

// Fetch TV series list
export async function fetchTVShows(_page: number = 1): Promise<ApiResponse> {
  return { result: MOCK_TV, pages: 1 };
}

// Fetch anime list
export async function fetchAnime(_page: number = 1): Promise<ApiResponse> {
  return { result: MOCK_ANIME, pages: 1 };
}

// Get embed URL for movie
export function getMovieEmbedUrl(id: string, server: ServerId = '1'): string {
  if (server === '2') {
    return `${EMBED_BASE_2}/movie/${id}`;
  }
  return `${EMBED_BASE_1}/movie/${id}`;
}

// Get embed URL for TV show
export function getTVEmbedUrl(id: string, season: number, episode: number, server: ServerId = '1'): string {
  if (server === '2') {
    return `${EMBED_BASE_2}/tv/${id}/${season}/${episode}`;
  }
  return `${EMBED_BASE_1}/tv/${id}/${season}/${episode}`;
}

// Get embed URL for anime
export function getAnimeEmbedUrl(id: string, episode: number, type: string = 'sub', server: ServerId = '1'): string {
  const formattedId = id.startsWith('tt') ? `imdb${id}` : id;
  if (server === '2') {
    return `${EMBED_BASE_2}/anime/${formattedId}/${episode}/${type}`;
  }
  return `${EMBED_BASE_1}/anime/${formattedId}/${episode}/${type}`;
}

// Search media by title using the new IMDb API
export async function searchMediaRemote(query: string, page: number = 1): Promise<MediaItem[]> {
  try {
    const response = await fetch(`${IMDB_SEARCH_API}?q=${encodeURIComponent(query)}&tt=&lsn=${page}&v=1`);
    if (!response.ok) throw new Error('Search failed');

    const data: ImdbSearchResponse = await response.json();
    if (!data.ok || !data.description) return [];

    return data.description.map(item => ({
      imdb_id: item['#IMDB_ID'],
      title: item['#TITLE'],
      year: item['#YEAR'],
      image: item['#IMG_POSTER'],
      actors: item['#ACTORS'],
      rank: item['#RANK'],
      type: 'movie'
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export interface OmdbSeasonDetails {
  Title: string;
  Season: string;
  totalSeasons: string;
  Episodes: Array<{
    Title: string;
    Released: string;
    Episode: string;
    imdbRating: string;
    imdbID: string;
  }>;
  Response: string;
}

export async function fetchTVShowDetails(imdbId: string): Promise<{ totalSeasons: number }> {
  try {
    console.log('[OMDB] Fetching TV details for:', imdbId, 'Key available:', !!OMDB_API_KEY);
    if (!OMDB_API_KEY) {
      console.warn('[OMDB] API key is missing');
      return { totalSeasons: 1 };
    }

    const url = `${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}&type=series`;
    console.log('[OMDB] URL:', url);

    const response = await fetch(url);
    const data = await response.json();
    console.log('[OMDB] Response:', data);

    if (data.Response === 'True' && data.totalSeasons) {
      return { totalSeasons: parseInt(data.totalSeasons, 10) };
    }
    return { totalSeasons: 1 };
  } catch (error) {
    console.error('[OMDB] Error fetching TV show details:', error);
    return { totalSeasons: 1 };
  }
}

export async function fetchSeasonDetails(imdbId: string, season: number): Promise<{ episodes: number }> {
  try {
    if (!OMDB_API_KEY) return { episodes: 1 };

    const url = `${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}&Season=${season}`;
    const response = await fetch(url);
    const data: OmdbSeasonDetails = await response.json();
    console.log('[OMDB] Season Response:', data);

    if (data.Response === 'True' && data.Episodes) {
      return { episodes: data.Episodes.length };
    }
    return { episodes: 1 };
  } catch (error) {
    console.error('[OMDB] Error fetching season details:', error);
    // Fallback to a reasonable default if offline or error
    return { episodes: 1 };
  }
}

export async function fetchMediaDetails(imdbId: string): Promise<{ type: 'movie' | 'series' | 'unknown' }> {
  try {
    if (!OMDB_API_KEY) return { type: 'unknown' };

    const url = `${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'True') {
      if (data.Type === 'movie') return { type: 'movie' };
      if (data.Type === 'series') return { type: 'series' };
    }
    return { type: 'unknown' };
  } catch (error) {
    console.error('[OMDB] Error fetching media details:', error);
    return { type: 'unknown' };
  }
}

// Client-side filter (fallback)
export function searchMedia(items: MediaItem[], searchTerm: string): MediaItem[] {
  const term = searchTerm.toLowerCase().trim();
  return items.filter(item =>
    item.title.toLowerCase().includes(term)
  );
}

// Player event types
export interface PlayerEventData {
  type: 'PLAYER_EVENT';
  data: {
    event: 'play' | 'pause' | 'time' | 'complete';
    tmdbId: number;
    duration: number;
    currentTime: number;
    mediaType: 'movie' | 'tv';
    season?: number;
    episode?: number;
  };
}

// Setup player event listener
export function setupPlayerEventListener(callback: (data: PlayerEventData['data']) => void): () => void {
  const handler = (event: MessageEvent) => {
    // Listen to both origins
    if (event.origin !== 'https://vidsrc.cc' && event.origin !== 'https://vidsrc-embed.ru') return;

    if (event.data && event.data.type === 'PLAYER_EVENT') {
      callback(event.data.data);
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}