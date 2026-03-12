/**
 * AniPub JS — TypeScript declarations
 * Full-featured client for the AniPub Anime API
 * @see https://api.anipub.xyz
 */

export interface AnimeInfo {
  _id: number;
  Name: string;
  ImagePath: string;
  Cover: string;
  Synonyms: string;
  Aired: string;
  Premiered: string;
  RatingsNum: number;
  Genres: string[];
  Studios: string;
  DescripTion: string;
  Duration: string;
  MALScore: string;
  Status: string;
  epCount: number;
  finder?: string;
}

export interface FindResult {
  exist: boolean;
  id?: number;
  ep?: number;
}

export interface EpisodeLink {
  ep: number;
  src: string;
}

export interface StreamingDetails {
  local: {
    name: string;
    link: string;
    ep: Array<{ link: string }>;
  };
  episodes: EpisodeLink[];
}

export interface Character {
  character: {
    mal_id: number;
    url: string;
    images: { jpg: { image_url: string } };
    name: string;
  };
  role: string;
  voice_actors: Array<{
    person: {
      mal_id: number;
      url: string;
      images: { jpg: { image_url: string } };
      name: string;
    };
    language: string;
  }>;
}

export interface FullDetails {
  local: AnimeInfo;
  jikan: {
    synopsis?: string;
    background?: string;
    [key: string]: unknown;
  } | null;
  characters: Character[];
}

export interface GenreResult {
  currentPage: number;
  wholePage: AnimeInfo[];
}

export interface RatingResult {
  currentPage: number;
  AniData: AnimeInfo[];
}

export interface SearchResult {
  Name: string;
  Id: number;
  Image: string;
  finder: string;
}

export interface SearchAllResult {
  currentPage: number;
  AniData: AnimeInfo[];
}

export interface StreamingOptions {
  stripSrc?: boolean;
}

// ─── Named exports ─────────────────────────────────────────────────────────

/** GET /api/info/:id — Full metadata by integer ID or slug */
export function getInfo(idOrSlug: number | string): Promise<AnimeInfo>;

/** GET /api/getAll — Total anime count in the database */
export function getTotal(): Promise<number>;

/** GET /api/find/:name — Check existence + episode count by exact name */
export function findByName(name: string): Promise<FindResult>;

/** GET /v1/api/details/:id — Streaming iframe links, normalized by episode */
export function getStreamingLinks(id: number | string, options?: StreamingOptions): Promise<StreamingDetails>;

/** GET /anime/api/details/:id — Full details: local + MAL + characters */
export function getFullDetails(id: number | string): Promise<FullDetails>;

/** GET /api/findbyGenre/:genre — Paginated list by genre */
export function findByGenre(genre: string, page?: number): Promise<GenreResult>;

/** POST /api/check — Verify anime exists by name and genre */
export function checkAnime(name: string, genre: string | string[]): Promise<unknown>;

/** GET /api/findbyrating — Top-rated anime, paginated */
export function getTopRated(page?: number): Promise<RatingResult>;

/** GET /api/search/:name — Quick flat search, great for autocomplete */
export function search(query: string): Promise<SearchResult[]>;

/** GET /api/searchall/:name — Full paginated search */
export function searchAll(query: string, page?: number): Promise<SearchAllResult>;

// ─── Class ─────────────────────────────────────────────────────────────────

export class AniPubError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string);
}

export class AniPub {
  constructor();
  getInfo(idOrSlug: number | string): Promise<AnimeInfo>;
  getTotal(): Promise<number>;
  findByName(name: string): Promise<FindResult>;
  getStreamingLinks(id: number | string, options?: StreamingOptions): Promise<StreamingDetails>;
  getFullDetails(id: number | string): Promise<FullDetails>;
  findByGenre(genre: string, page?: number): Promise<GenreResult>;
  checkAnime(name: string, genre: string | string[]): Promise<unknown>;
  getTopRated(page?: number): Promise<RatingResult>;
  search(query: string): Promise<SearchResult[]>;
  searchAll(query: string, page?: number): Promise<SearchAllResult>;
}

export default AniPub;
