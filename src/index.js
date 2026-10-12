const BASE_URL = 'https://anipub.org';

function fixImage(path) {
  if (!path) return '';
  return path.startsWith('https://') ? path : `https://anipub.org/${path}`;
}

function fixImages(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  for (const key of ['ImagePath', 'Cover', 'Image', 'image']) {
    if (clone[key]) clone[key] = fixImage(clone[key]);
  }
  return clone;
}

export class AniPubError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'AniPubError';
    this.statusCode = statusCode;
  }
}

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

export async function getInfo(idOrSlug) {
  const data = await apiFetch(`${BASE_URL}/api/info/${encodeURIComponent(idOrSlug)}`);
  return fixImages(data);
}

export async function getTotal() {
  return apiFetch(`${BASE_URL}/api/getAll`);
}

export async function getLast() {
  return apiFetch(`${BASE_URL}/api/getlast`);
}

export async function findByName(name) {
  return apiFetch(`${BASE_URL}/api/find/${encodeURIComponent(name)}`);
}

export async function getStreamingLinks(id, { stripSrc = true } = {}) {
  const data = await apiFetch(`${BASE_URL}/v1/api/details/${encodeURIComponent(id)}`);
  const local = data.local;

  if (!local) return data;

  const strip = (link) => (stripSrc && link ? link.replace(/^src=/, '') : link);

  const episodes = [
    { ep: 1, src: strip(local.link) },
    ...(local.ep || []).map((e, i) => ({ ep: i + 2, src: strip(e.link) })),
  ];

  return { ...data, episodes };
}

export async function getFullDetails(id) {
  const data = await apiFetch(`${BASE_URL}/anime/api/details/${encodeURIComponent(id)}`);
  if (data.local) data.local = fixImages(data.local);
  return data;
}

export async function findByGenre(genre, page = 1) {
  const data = await apiFetch(
    `${BASE_URL}/api/findbyGenre/${encodeURIComponent(genre)}?Page=${page}`
  );
  if (Array.isArray(data.wholePage)) {
    data.wholePage = data.wholePage.map(fixImages);
  }
  return data;
}

export async function checkAnime(name, genre) {
  return apiFetch(`${BASE_URL}/api/check`, {
    method: 'POST',
    body: JSON.stringify({ Name: name, Genre: genre }),
  });
}

export async function getTopRated(page = 1) {
  const data = await apiFetch(`${BASE_URL}/api/findbyrating?page=${page}`);
  if (Array.isArray(data.AniData)) {
    data.AniData = data.AniData.map(fixImages);
  }
  return data;
}

export async function search(query) {
  const data = await apiFetch(`${BASE_URL}/api/search/${encodeURIComponent(query)}`);
  return Array.isArray(data) ? data.map(fixImages) : data;
}

export async function searchAll(query, page = 1) {
  const data = await apiFetch(
    `${BASE_URL}/api/searchall/${encodeURIComponent(query)}?page=${page}`
  );
  if (Array.isArray(data.AniData)) {
    data.AniData = data.AniData.map(fixImages);
  }
  return data;
}

export async function sort({ name, genre, ratefrom, rateto, page } = {}) {
  const params = new URLSearchParams();
  if (name !== undefined) params.set('name', name);
  if (genre !== undefined) params.set('genre', Array.isArray(genre) ? genre.join(',') : genre);
  if (ratefrom !== undefined) params.set('ratefrom', ratefrom);
  if (rateto !== undefined) params.set('rateto', rateto);
  if (page !== undefined) params.set('page', page);

  const query = params.toString();
  const [totalPages, results] = await apiFetch(`${BASE_URL}/api/sort${query ? `?${query}` : ''}`);
  return {
    totalPages,
    results: Array.isArray(results) ? results.map(fixImages) : [],
  };
}

export class AniPub {
  constructor() {}

  getInfo(idOrSlug)           { return getInfo(idOrSlug); }
  getTotal()                  { return getTotal(); }
  getLast()                   { return getLast(); }
  findByName(name)            { return findByName(name); }
  getStreamingLinks(id, opts) { return getStreamingLinks(id, opts); }
  getFullDetails(id)          { return getFullDetails(id); }
  findByGenre(genre, page)    { return findByGenre(genre, page); }
  checkAnime(name, genre)     { return checkAnime(name, genre); }
  getTopRated(page)           { return getTopRated(page); }
  search(query)               { return search(query); }
  searchAll(query, page)      { return searchAll(query, page); }
  sort(options)               { return sort(options); }
}

export default AniPub;
