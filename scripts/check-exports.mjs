// Verifies every target in package.json "exports" exists on disk and actually
// loads — import for ESM, require for CJS.
//
// Extracted from publish.yml so CI can run it too. It used to live only in the
// publish job, which triggers on tag push, so a broken export shape was
// discovered during a release. Run after `npm run build`; it inspects dist/.

import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const map = JSON.parse(readFileSync('./package.json', 'utf8')).exports['.'];
const rel = (p) => p.replace(/^\.\//, '');

let bad = 0;
for (const target of new Set(Object.values(map))) {
  if (!existsSync(rel(target))) {
    console.error('::error::exports target missing: ' + target);
    bad++;
  }
}
if (bad) process.exit(1);

await import(pathToFileURL(resolve(rel(map.import))).href);
createRequire(import.meta.url)(resolve(rel(map.require)));

console.log('exports OK: import=' + map.import + ' require=' + map.require);
