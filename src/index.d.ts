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

export interface SortOptions {
  name?: string;
  genre?: string | string[];
  ratefrom?: number;
  rateto?: number;
  page?: number;
}

export interface SortResult {
  totalPages: number;
  results: AnimeInfo[];
}

export interface StreamingOptions {
  stripSrc?: boolean;
}

export class AniPubError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string);
}

export function getInfo(idOrSlug: number | string): Promise<AnimeInfo>;
export function getTotal(): Promise<number>;
export function getLast(): Promise<number>;
export function findByName(name: string): Promise<FindResult>;
export function getStreamingLinks(id: number | string, options?: StreamingOptions): Promise<StreamingDetails>;
export function getFullDetails(id: number | string): Promise<FullDetails>;
export function findByGenre(genre: string, page?: number): Promise<GenreResult>;
export function checkAnime(name: string, genre: string | string[]): Promise<unknown>;
export function getTopRated(page?: number): Promise<RatingResult>;
export function search(query: string): Promise<SearchResult[]>;
export function searchAll(query: string, page?: number): Promise<SearchAllResult>;
export function sort(options?: SortOptions): Promise<SortResult>;

export class AniPub {
  constructor();
  getInfo(idOrSlug: number | string): Promise<AnimeInfo>;
  getTotal(): Promise<number>;
  getLast(): Promise<number>;
  findByName(name: string): Promise<FindResult>;
  getStreamingLinks(id: number | string, options?: StreamingOptions): Promise<StreamingDetails>;
  getFullDetails(id: number | string): Promise<FullDetails>;
  findByGenre(genre: string, page?: number): Promise<GenreResult>;
  checkAnime(name: string, genre: string | string[]): Promise<unknown>;
  getTopRated(page?: number): Promise<RatingResult>;
  search(query: string): Promise<SearchResult[]>;
  searchAll(query: string, page?: number): Promise<SearchAllResult>;
  sort(options?: SortOptions): Promise<SortResult>;
}

export default AniPub;
