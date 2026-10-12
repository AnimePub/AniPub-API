import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, '../src/index.js'), 'utf-8');

const declaration = /^export (async function|function|class|const|let|var) (\w+)/gm;
const names = [...src.matchAll(declaration)].map((match) => match[2]);

const defaultMatch = src.match(/^export default (\w+);?\s*$/m);
const defaultName = defaultMatch ? defaultMatch[1] : 'AniPub';

const body = src
  .replace(/^export (async function|function|class|const|let|var) /gm, '$1 ')
  .replace(/^export default .+;?\s*$/gm, '')
  .replace(/^export \{[^}]+\};?\s*$/gm, '')
  .trimEnd();

const cjs = `${body}

module.exports = {
${names.map((name) => `  ${name},`).join('\n')}
};
module.exports.default = ${defaultName};
`;

mkdirSync(join(__dirname, '../src'), { recursive: true });
writeFileSync(join(__dirname, '../src/index.cjs'), cjs);
console.log('CJS build complete → src/index.cjs');
