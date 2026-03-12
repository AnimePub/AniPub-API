<div align="center">

# anipub

**A full-featured JavaScript/TypeScript client for the [AniPub Anime API](https://api.anipub.xyz)**

Search · Browse · Stream · MAL Data · Characters · Voice Actors

[![npm version](https://img.shields.io/npm/v/anipub?color=ef4444&labelColor=18181b&style=flat-square)](https://www.npmjs.com/package/anipub)
[![npm downloads](https://img.shields.io/npm/dm/anipub?color=f97316&labelColor=18181b&style=flat-square)](https://www.npmjs.com/package/anipub)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?labelColor=18181b&style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-3b82f6?labelColor=18181b&style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3b82f6?labelColor=18181b&style=flat-square)](src/index.d.ts)
[![ESM + CJS](https://img.shields.io/badge/ESM%20%2B%20CJS-supported-a855f7?labelColor=18181b&style=flat-square)](#)

</div>

---

## What is this?

`anipub` is a zero-dependency, isomorphic JavaScript wrapper for the [AniPub API](https://api.anipub.xyz) — a free, open anime metadata service with MAL integration. It covers **all 10 endpoints** in one clean package with full TypeScript support.

```bash
npm install anipub
```

```js
import { search, getInfo, getTopRated } from 'anipub';

const results = await search('One Piece');
const anime   = await getInfo('black-clover');
const top     = await getTopRated();
```

> **No API key. No account. No rate limits enforced by this wrapper.**

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [getInfo](#getinfoidorslug)
  - [getTotal](#gettotal)
  - [findByName](#findbynamename)
  - [search](#searchquery)
  - [searchAll](#searchallquery-page)
  - [findByGenre](#findbygenregenre-page)
  - [checkAnime](#checkanimename-genre)
  - [getTopRated](#gettopratedpage)
  - [getStreamingLinks](#getstreaminglinksid-options)
  - [getFullDetails](#getfulldetailsid)
- [Class-based Usage](#class-based-usage)
- [TypeScript](#typescript)
- [Error Handling](#error-handling)
- [Real-World Patterns](#real-world-patterns)
- [Publishing to NPM & GitHub](#publishing-to-npm--github)
- [License](#license)

---

## Installation

```bash
# npm
npm install anipub

# pnpm
pnpm add anipub

# yarn
yarn add anipub
```

**Requirements:** Node.js 18+ (uses native `fetch`). Works in Deno and modern browsers too.

---

## Quick Start

```js
import { search, getInfo, getTopRated, getFullDetails } from 'anipub';

// 1. Search for anime
const results = await search('attack on titan');
console.log(results[0].Name); // "Attack on Titan"
console.log(results[0].Id);   // 7

// 2. Get full metadata by ID or slug
const anime = await getInfo(7);
const same  = await getInfo('attack-on-titan'); // same result

console.log(anime.Name);      // "Attack on Titan"
console.log(anime.MALScore);  // "9.00"
console.log(anime.Genres);    // ["action", "drama", "fantasy"]
console.log(anime.epCount);   // 75
console.log(anime.ImagePath); // "https://anipub.xyz/..." (always absolute)

// 3. Top rated
const { AniData } = await getTopRated();
AniData.forEach(a => console.log(`${a.MALScore} — ${a.Name}`));

// 4. Characters + MAL synopsis
const { local, jikan, characters } = await getFullDetails(7);
console.log(jikan.synopsis);
characters.filter(c => c.role === 'Main').forEach(c => {
  const va = c.voice_actors.find(v => v.language === 'Japanese');
  console.log(`${c.character.name} — VA: ${va?.person.name}`);
});
```

---

## API Reference

All functions are `async` and return parsed JSON. Image paths (`ImagePath`, `Cover`, `Image`) are **automatically resolved to absolute URLs** — no manual string manipulation needed.

---

### `getInfo(idOrSlug)`

> `GET /api/info/:id`

Full metadata for one anime. Accepts a numeric **ID** or a **kebab-case slug**.

**Slug rules:** lowercase, spaces → hyphens, strip special characters.  
`"One Piece"` → `"one-piece"` · `"High School DxD"` → `"high-school-dxd"`

```js
import { getInfo } from 'anipub';

// By integer ID
const anime = await getInfo(61);

// By slug — spaces become hyphens, lowercase, no special chars
const anime = await getInfo('black-clover');
const anime = await getInfo('one-piece');
const anime = await getInfo('high-school-dxd');
const anime = await getInfo('date-a-live-iv');

console.log(anime.Name);       // "Black Clover"
console.log(anime.MALScore);   // "8.88"
console.log(anime.epCount);    // 170
console.log(anime.Status);     // "Finished Airing"
console.log(anime.Genres);     // ["action", "fantasy", "magic"]
console.log(anime.Aired);      // "Oct 3, 2017 to Mar 30, 2021"
console.log(anime.Studios);    // "Pierrot"
console.log(anime.ImagePath);  // "https://anipub.xyz/..." (always absolute)
```

**Returns:** `AnimeInfo`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `number` | Numeric ID |
| `Name` | `string` | Anime title |
| `ImagePath` | `string` | Poster image (absolute URL) |
| `Cover` | `string` | Banner image (absolute URL) |
| `MALScore` | `string` | MyAnimeList score |
| `Genres` | `string[]` | Genre tags |
| `Status` | `string` | Airing status |
| `epCount` | `number` | Episode count |
| `Aired` | `string` | Airing date range |
| `Studios` | `string` | Production studios |
| `DescripTion` | `string` | Synopsis |

---

### `getTotal()`

> `GET /api/getAll`

Returns the **total number of anime** in the database. Use this to determine the valid integer ID range.

```js
import { getTotal } from 'anipub';

const total = await getTotal();
console.log(`${total} anime available (IDs 1 to ${total})`);
// → 153 anime available (IDs 1 to 153)

// Use it to fetch a random anime
const randomId = Math.ceil(Math.random() * total);
const random   = await getInfo(randomId);
console.log(`Random: ${random.Name}`);
```

**Returns:** `number`

---

### `findByName(name)`

> `GET /api/find/:name`

Check if an anime **exists by exact title**. Returns existence status, ID, and episode count.

```js
import { findByName, getInfo } from 'anipub';

const result = await findByName('One Piece');
// → { exist: true, id: 10, ep: 1155 }

if (result.exist) {
  console.log(`Found! ID: ${result.id}, Episodes: ${result.ep}`);
  const anime = await getInfo(result.id); // fetch full data
}

// Non-existent
const none = await findByName('FakeAnime99999');
// → { exist: false }
```

**Returns:** `FindResult`

| Field | Type | Description |
|-------|------|-------------|
| `exist` | `boolean` | Whether the anime was found |
| `id` | `number?` | Numeric ID (if found) |
| `ep` | `number?` | Episode count (if found) |

---

### `search(query)`

> `GET /api/search/:name`

**Quick search** — returns a flat array of results. No pagination. Fastest endpoint; ideal for autocomplete and live search inputs.

```js
import { search } from 'anipub';

const results = await search('naruto');
// → [{ Name, Id, Image, finder }, ...]

results.forEach(r => {
  console.log(`[${r.Id}] ${r.Name}`);
  // → [1]  Naruto
  // → [2]  Naruto: Shippuden
});

// Autocomplete example
input.addEventListener('input', async (e) => {
  if (e.target.value.length < 2) return;
  const hits = await search(e.target.value);
  renderDropdown(hits.slice(0, 8));
});
```

**Returns:** `SearchResult[]`

| Field | Type | Description |
|-------|------|-------------|
| `Name` | `string` | Anime title |
| `Id` | `number` | Numeric ID |
| `Image` | `string` | Poster image (absolute URL) |
| `finder` | `string` | Kebab-case slug |

---

### `searchAll(query, page?)`

> `GET /api/searchall/:name?page=1`

**Full paginated search** with complete anime objects. Returns more results than `search()`.

```js
import { searchAll } from 'anipub';

const { AniData, currentPage } = await searchAll('sword art online', 1);
console.log(`Page ${currentPage}, ${AniData.length} results`);

AniData.forEach(a => {
  console.log(`[${a._id}] ${a.Name} — Score: ${a.MALScore}`);
});

// Load page 2
const page2 = await searchAll('sword art online', 2);
```

**Returns:** `SearchAllResult`

| Field | Type | Description |
|-------|------|-------------|
| `currentPage` | `number` | Current page number |
| `AniData` | `AnimeInfo[]` | Array of full anime objects |

---

### `findByGenre(genre, page?)`

> `GET /api/findbyGenre/:genre?Page=1`

Paginated anime list filtered by genre.

```js
import { findByGenre } from 'anipub';

const { currentPage, wholePage } = await findByGenre('action', 1);

wholePage.forEach(a => {
  console.log(`${a.Name} — ${a.MALScore}`);
});

// Page 2
const next = await findByGenre('harem', 2);
```

**Common genres:**

| | | | |
|--|--|--|--|
| `action` | `romance` | `harem` | `ecchi` |
| `fantasy` | `school` | `drama` | `supernatural` |
| `comedy` | `adventure` | `shounen` | `magic` |

**Returns:** `GenreResult`

| Field | Type | Description |
|-------|------|-------------|
| `currentPage` | `number` | Current page number |
| `wholePage` | `AnimeInfo[]` | Array of anime objects |

---

### `checkAnime(name, genre)`

> `POST /api/check`

Verify an anime exists with a specific **name and genre**. Genre accepts a string or an array.

```js
import { checkAnime } from 'anipub';

// Single genre
const result = await checkAnime('Black Clover', 'Action');

// Multiple genres
const result = await checkAnime('Jujutsu Kaisen', ['Action', 'Drama']);
```

---

### `getTopRated(page?)`

> `GET /api/findbyrating?page=1`

Top-rated anime sorted by **MAL score descending**, paginated.

```js
import { getTopRated } from 'anipub';

const { AniData, currentPage } = await getTopRated(1);

AniData.forEach((a, i) => {
  console.log(`${i + 1}. ${a.MALScore} — ${a.Name}`);
  // 1. 9.36 — Frieren: Beyond Journey's End
  // 2. 9.21 — Fullmetal Alchemist: Brotherhood
});

// Page 2
const more = await getTopRated(2);
```

**Returns:** `RatingResult`

| Field | Type | Description |
|-------|------|-------------|
| `currentPage` | `number` | Current page number |
| `AniData` | `AnimeInfo[]` | Anime sorted by score desc |

---

### `getStreamingLinks(id, options?)`

> `GET /v1/api/details/:id`

Returns **streaming iframe links** organized by episode number. The `src=` prefix is stripped automatically.

> **Note on episode numbering:** The raw API has an offset quirk — `local.link` = EP1, `local.ep[0]` = EP2. This wrapper normalizes everything into a clean `episodes` array starting at episode 1. No manual offset needed.

```js
import { getStreamingLinks } from 'anipub';

const { episodes } = await getStreamingLinks(119);
// episodes = [
//   { ep: 1, src: 'https://...' },
//   { ep: 2, src: 'https://...' },
//   { ep: 3, src: 'https://...' },
// ]

console.log(`${episodes.length} episodes available`);

// Jump to specific episode
const ep5 = episodes.find(e => e.ep === 5);
iframe.src = ep5.src;

// Keep raw src= prefix
const raw = await getStreamingLinks(119, { stripSrc: false });
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stripSrc` | `boolean` | `true` | Strip the `src=` prefix from links |

**Returns:** `StreamingDetails`

---

### `getFullDetails(id)`

> `GET /anime/api/details/:id`

The most **complete single-anime endpoint**. Returns local metadata + MAL/Jikan data + full cast with voice actors.

```js
import { getFullDetails } from 'anipub';

const { local, jikan, characters } = await getFullDetails(119);

// Local metadata
console.log(local.Name);      // "Black Clover"
console.log(local.MALScore);  // "8.88"

// MAL/Jikan enrichment
console.log(jikan.synopsis);  // full synopsis text

// Characters & voice actors
characters.forEach(c => {
  console.log(`${c.character.name} — ${c.role}`);
  // → "Asta — Main"

  c.voice_actors.forEach(va => {
    console.log(`  VA: ${va.person.name} (${va.language})`);
    // → "VA: Gakuto Kajiwara (Japanese)"
  });
});

// Filter main characters only
const mainCast = characters.filter(c => c.role === 'Main');

// Get the Japanese VA for a character
const jpVA = c.voice_actors.find(va => va.language === 'Japanese');
```

**Returns:** `FullDetails`

| Field | Type | Description |
|-------|------|-------------|
| `local` | `AnimeInfo` | Full local metadata |
| `jikan` | `object` | MAL/Jikan data (synopsis, etc.) |
| `characters` | `Character[]` | Full cast + voice actors |

---

## Class-based Usage

Use the `AniPub` class for an OOP-style API or when you want a single import.

```js
import AniPub from 'anipub';

const client = new AniPub();

// All 10 endpoints as instance methods
const total   = await client.getTotal();
const anime   = await client.getInfo('one-piece');
const results = await client.search('bleach');
const top     = await client.getTopRated(1);
const genre   = await client.findByGenre('action', 1);
const found   = await client.findByName('Naruto');
const full    = await client.getFullDetails(119);
const stream  = await client.getStreamingLinks(119);
const check   = await client.checkAnime('One Piece', 'Adventure');
const paged   = await client.searchAll('dragon ball', 1);
```

---

## TypeScript

Full type declarations are bundled. No `@types/` package needed.

```ts
import {
  getInfo,
  getFullDetails,
  AniPub,
  type AnimeInfo,
  type FullDetails,
  type Character,
  type SearchResult,
} from 'anipub';

// Typed anime object
const anime: AnimeInfo = await getInfo('demon-slayer');

// Typed full details
const full: FullDetails = await getFullDetails(61);
const mainChars: Character[] = full.characters.filter(c => c.role === 'Main');

// Typed class usage
const client = new AniPub();
const results: SearchResult[] = await client.search('bleach');

// Custom typed helper
async function getTopInGenre(genre: string, minScore: number): Promise<AnimeInfo[]> {
  const { wholePage } = await client.findByGenre(genre);
  return wholePage.filter(a => parseFloat(a.MALScore) >= minScore);
}
```

---

## Error Handling

All endpoints throw `AniPubError` on HTTP errors (404, 500, etc.).

```js
import { getInfo, AniPubError } from 'anipub';

try {
  const anime = await getInfo(99999999);
} catch (err) {
  if (err instanceof AniPubError) {
    console.error(`API error ${err.statusCode}: ${err.message}`);
    // → API error 404: AniPub API error [404]: Not Found.
  } else {
    console.error('Network error:', err.message);
  }
}

// Graceful fallback
async function safeGetInfo(id) {
  try { return await getInfo(id); }
  catch { return null; }
}
```

**`AniPubError` properties:**

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable error |
| `statusCode` | `number` | HTTP status (404, 500…) |
| `name` | `string` | Always `"AniPubError"` |

---

## Real-World Patterns

### Autocomplete search input

```js
import { search } from 'anipub';

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const handleSearch = debounce(async (query) => {
  if (query.length < 2) return clearDropdown();
  const hits = await search(query);
  renderDropdown(hits.slice(0, 8));
}, 300);

searchInput.addEventListener('input', e => handleSearch(e.target.value));
```

---

### Smart lookup (exact → fuzzy fallback)

```js
import { findByName, search, getInfo } from 'anipub';

async function smartLookup(query) {
  const found = await findByName(query);
  if (found.exist) return getInfo(found.id);      // exact match

  const results = await search(query);            // fuzzy fallback
  if (!results.length) return null;
  return getInfo(results[0].Id);
}

const anime = await smartLookup('Demon Slayer');
```

---

### Episode player builder

```js
import { getInfo, getStreamingLinks } from 'anipub';

async function buildPlayer(animeId) {
  const [info, { episodes }] = await Promise.all([
    getInfo(animeId),
    getStreamingLinks(animeId),
  ]);
  return { title: info.Name, cover: info.Cover, episodes, current: episodes[0] };
}

const player = await buildPlayer(61);
iframe.src = player.current.src;
```

---

### Fetch all pages in a genre

```js
import { findByGenre } from 'anipub';

async function getAllInGenre(genre, maxPages = 5) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const { wholePage } = await findByGenre(genre, page);
    if (!wholePage.length) break;
    all.push(...wholePage);
  }
  return all;
}

const allRomance = await getAllInGenre('romance');
```

---

### Parallel batch fetch

```js
import { getInfo } from 'anipub';

const ids = [61, 10, 119, 7, 3];
const batch = await Promise.all(ids.map(id => getInfo(id)));
batch.forEach(a => console.log(`${a.Name} — ${a.MALScore}`));
```

---

### Random anime picker

```js
import { getTotal, getInfo } from 'anipub';

async function randomAnime() {
  const total = await getTotal();
  return getInfo(Math.ceil(Math.random() * total));
}

const surprise = await randomAnime();
console.log(`Today's pick: ${surprise.Name}`);
```

---

### Search with score filter

```js
import { searchAll } from 'anipub';

async function searchHighRated(query, minScore = 8.0) {
  const { AniData } = await searchAll(query);
  return AniData.filter(a => parseFloat(a.MALScore) >= minScore);
}

const picks = await searchHighRated('fantasy', 8.5);
```

---

## License

[MIT](LICENSE) © Abdullah AL Adnan 

---

<div align="center">
  <sub>Built with ❤️ for the anime community · <a href="https://api.anipub.xyz">AniPub API Docs</a></sub>
</div>
