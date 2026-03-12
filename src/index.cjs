/**
 * AniPub JS — A full-featured client for the AniPub Anime API
 * Covers all 10 endpoints: info, getAll, find, details (v1), full details,
 * findbyGenre, check, findbyrating, search, searchall
 *
 * @module anipub
 * @see https://api.anipub.xyz
 */

const BASE_URL = 'https://www.anipub.xyz';



/**
 * Fix relative image paths by prepending the base domain.
 * @param {string|undefined} path
 * @returns {string}
 */
function fixImage(path) {
  if (!path) return '';
  return path.startsWith('https://') ? path : `https://anipub.xyz/${path}`;
}

/**
 * Fix all known image fields in an object.
 * @param {object} obj
 * @returns {object}
 */
function fixImages(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  for (const key of ['ImagePath', 'Cover', 'Image', 'image']) {
    if (clone[key]) clone[key] = fixImage(clone[key]);
  }
  return clone;
}

/**
 * Internal fetch wrapper with error handling.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AniPubError(res.status, `AniPub API error [${res.status}]: ${res.statusText}. ${text}`);
  }

  return res.json();
}



class AniPubError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(statusCode, message) {
    super(message);
    this.name = 'AniPubError';
    this.statusCode = statusCode;
  }
}



/**
 * GET /api/info/:id
 * Full metadata for one anime by integer ID or kebab-case slug.
 *
 * @param {number|string} idOrSlug - e.g. 61 or "black-clover" or "one-piece"
 * @returns {Promise<AnimeInfo>}
 *
 * @example
 * const anime = await getInfo(61);
 * const anime = await getInfo('black-clover');
 */
export async function getInfo(idOrSlug) {
  const data = await apiFetch(`${BASE_URL}/api/info/${encodeURIComponent(idOrSlug)}`);
  return fixImages(data);
}

/**
 * GET /api/getAll
 * Returns the total count of anime in the database.
 * Use to determine the valid integer ID range for getInfo().
 *
 * @returns {Promise<number>}
 *
 * @example
 * const total = await getTotal();
 * console.log(`IDs 1 to ${total}`);
 */
export async function getTotal() {
  return apiFetch(`${BASE_URL}/api/getAll`);
}

/**
 * GET /api/find/:name
 * Check if an anime exists by exact name.
 * Returns { exist: true, id, ep } or { exist: false }.
 *
 * @param {string} name - Anime title (will be URL-encoded automatically)
 * @returns {Promise<FindResult>}
 *
 * @example
 * const result = await findByName('One Piece');
 * if (result.exist) console.log(`ID: ${result.id}, Episodes: ${result.ep}`);
 */
export async function findByName(name) {
  return apiFetch(`${BASE_URL}/api/find/${encodeURIComponent(name)}`);
}

/**
 * GET /v1/api/details/:id
 * Returns streaming iframe links per episode.
 * - local.link  = Episode 1 (strip "src=" prefix to get the raw URL)
 * - local.ep[]  = Episodes 2+ (ep[0] = EP2, ep[1] = EP3, ...)
 *
 * @param {number|string} id - Numeric anime ID
 * @param {object} [options]
 * @param {boolean} [options.stripSrc=true] - Auto-strip "src=" prefix from links
 * @returns {Promise<StreamingDetails>}
 *
 * @example
 * const { episodes } = await getStreamingLinks(119);
 * // episodes[0] = { ep: 1, src: 'https://...' }
 */
export async function getStreamingLinks(id, { stripSrc = true } = {}) {
  const data = await apiFetch(`${BASE_URL}/v1/api/details/${id}`);
  const local = data.local;

  if (!local) return data;

  const strip = (link) => (stripSrc && link ? link.replace(/^src=/, '') : link);

  const episodes = [
    { ep: 1, src: strip(local.link) },
    ...(local.ep || []).map((e, i) => ({ ep: i + 2, src: strip(e.link) })),
  ];

  return { ...data, episodes };
}

/**
 * GET /anime/api/details/:id
 * Full details: local metadata + MAL/Jikan data + characters & voice actors.
 * This is the most complete single-anime endpoint.
 *
 * @param {number|string} id - Numeric anime ID
 * @returns {Promise<FullDetails>}
 *
 * @example
 * const { local, jikan, characters } = await getFullDetails(119);
 * console.log(local.Name, local.MALScore);
 * characters.forEach(c => console.log(c.character.name, c.role));
 */
export async function getFullDetails(id) {
  const data = await apiFetch(`${BASE_URL}/anime/api/details/${id}`);
  if (data.local) data.local = fixImages(data.local);
  return data;
}

/**
 * GET /api/findbyGenre/:genre
 * Paginated anime list filtered by genre.
 *
 * @param {string} genre - e.g. "action", "harem", "romance", "ecchi"
 * @param {number} [page=1] - Page number
 * @returns {Promise<GenreResult>}
 *
 * @example
 * const { currentPage, wholePage } = await findByGenre('action', 1);
 * wholePage.forEach(a => console.log(a.Name));
 */
export async function findByGenre(genre, page = 1) {
  const data = await apiFetch(`${BASE_URL}/api/findbyGenre/${encodeURIComponent(genre)}?Page=${page}`);
  if (Array.isArray(data.wholePage)) {
    data.wholePage = data.wholePage.map(fixImages);
  }
  return data;
}

/**
 * POST /api/check
 * Check if an anime exists by name and genre.
 *
 * @param {string} name - Anime title
 * @param {string|string[]} genre - Genre string or array of genres
 * @returns {Promise<any>}
 *
 * @example
 * await checkAnime('Black Clover', 'Action');
 * await checkAnime('Jujutsu Kaisen', ['Action', 'Drama']);
 */
export async function checkAnime(name, genre) {
  return apiFetch(`${BASE_URL}/api/check`, {
    method: 'POST',
    body: JSON.stringify({ Name: name, Genre: genre }),
  });
}

/**
 * GET /api/findbyrating
 * Top-rated anime sorted by MAL score descending, paginated.
 *
 * @param {number} [page=1] - Page number
 * @returns {Promise<RatingResult>}
 *
 * @example
 * const { AniData, currentPage } = await getTopRated(1);
 * AniData.forEach(a => console.log(a.Name, a.MALScore));
 */
export async function getTopRated(page = 1) {
  const data = await apiFetch(`${BASE_URL}/api/findbyrating?page=${page}`);
  if (Array.isArray(data.AniData)) {
    data.AniData = data.AniData.map(fixImages);
  }
  return data;
}

/**
 * GET /api/search/:name
 * Quick search — flat array of matches, ideal for autocomplete.
 * No pagination. Faster than searchAll.
 *
 * @param {string} query - Search query
 * @returns {Promise<SearchResult[]>}
 *
 * @example
 * const results = await search('One Piece');
 * results.forEach(r => console.log(r.Name, r.Id));
 */
export async function search(query) {
  const data = await apiFetch(`${BASE_URL}/api/search/${encodeURIComponent(query)}`);
  return Array.isArray(data) ? data.map(fixImages) : data;
}

/**
 * GET /api/searchall/:name
 * Full paginated search across all anime.
 * Returns more results than search(), with pagination.
 *
 * @param {string} query - Search query
 * @param {number} [page=1] - Page number
 * @returns {Promise<SearchAllResult>}
 *
 * @example
 * const { AniData, currentPage } = await searchAll('Naruto', 1);
 * AniData.forEach(a => console.log(a.Name, a.MALScore));
 */
export async function searchAll(query, page = 1) {
  const data = await apiFetch(
    `${BASE_URL}/api/searchall/${encodeURIComponent(query)}?page=${page}`
  );
  if (Array.isArray(data.AniData)) {
    data.AniData = data.AniData.map(fixImages);
  }
  return data;
}



/**
 * AniPub client class — wraps all endpoints as instance methods.
 * Useful when you want a single import and potential future config options.
 *
 * @example
 * import AniPub from 'anipub';
 * const client = new AniPub();
 * const anime = await client.getInfo('one-piece');
 */
class AniPub {
  constructor() {}

  getInfo(idOrSlug)             { return getInfo(idOrSlug); }
  getTotal()                    { return getTotal(); }
  findByName(name)              { return findByName(name); }
  getStreamingLinks(id, opts)   { return getStreamingLinks(id, opts); }
  getFullDetails(id)            { return getFullDetails(id); }
  findByGenre(genre, page)      { return findByGenre(genre, page); }
  checkAnime(name, genre)       { return checkAnime(name, genre); }
  getTopRated(page)             { return getTopRated(page); }
  search(query)                 { return search(query); }
  searchAll(query, page)        { return searchAll(query, page); }
}





/**
 * @typedef {object} AnimeInfo
 * @property {number} _id
 * @property {string} Name
 * @property {string} ImagePath
 * @property {string} Cover
 * @property {string} Synonyms
 * @property {string} Aired
 * @property {string} Premiered
 * @property {number} RatingsNum
 * @property {string[]} Genres
 * @property {string} Studios
 * @property {string} DescripTion
 * @property {string} Duration
 * @property {string} MALScore
 * @property {string} Status
 * @property {number} epCount
 */

/**
 * @typedef {object} FindResult
 * @property {boolean} exist
 * @property {number} [id]
 * @property {number} [ep]
 */

/**
 * @typedef {object} EpisodeLink
 * @property {number} ep
 * @property {string} src
 */

/**
 * @typedef {object} StreamingDetails
 * @property {object} local
 * @property {EpisodeLink[]} episodes
 */

/**
 * @typedef {object} FullDetails
 * @property {AnimeInfo} local
 * @property {object} jikan
 * @property {object[]} characters
 */

/**
 * @typedef {object} GenreResult
 * @property {number} currentPage
 * @property {AnimeInfo[]} wholePage
 */

/**
 * @typedef {object} RatingResult
 * @property {number} currentPage
 * @property {AnimeInfo[]} AniData
 */

/**
 * @typedef {object} SearchResult
 * @property {string} Name
 * @property {number} Id
 * @property {string} Image
 * @property {string} finder
 */

/**
 * @typedef {object} SearchAllResult
 * @property {number} currentPage
 * @property {AnimeInfo[]} AniData
 */

// CommonJS exports
module.exports = {
  AniPub,
  AniPubError,
  getInfo,
  getTotal,
  findByName,
  getStreamingLinks,
  getFullDetails,
  findByGenre,
  checkAnime,
  getTopRated,
  search,
  searchAll,
};
module.exports.default = AniPub;
