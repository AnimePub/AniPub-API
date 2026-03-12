/**
 * Simple build script to generate a CommonJS version of the library.
 * Run: node scripts/build-cjs.js
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, '../src/index.js'), 'utf-8');

// Transform ESM → CJS
const cjs = src
  // Remove export keywords from declarations
  .replace(/^export (class|function|const|let|var) /gm, '$1 ')
  // Remove "export default AniPub;"
  .replace(/^export default .+;$/gm, '')
  // Remove named export blocks like export { ... }
  .replace(/^export \{[^}]+\};?\s*$/gm, '')
  // Add CJS module.exports at end
  + `
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
`;

mkdirSync(join(__dirname, '../src'), { recursive: true });
writeFileSync(join(__dirname, '../src/index.cjs'), cjs);
console.log('✅ CJS build complete → src/index.cjs');
