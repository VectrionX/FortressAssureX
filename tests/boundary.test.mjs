import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const reachable = `${app}\n${html}`;

for (const token of ['fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'localStorage', 'sessionStorage', 'indexedDB']) {
  assert.equal(reachable.includes(token), false, `reachable UI must not use ${token}`);
}
for (const token of ['run automated audit', 'issue an assurance rating', 'provide an attestation', 'provide certification']) {
  assert.equal(reachable.toLowerCase().includes(token), false, `reachable UI must not expose ${token}`);
}
assert.match(app, /user-supplied evidence only/i);
assert.match(app, /does not scan, validate controls, calculate posture/i);
assert.match(app, /Unavailable domains remain unavailable/i);
console.log('boundary tests passed: no egress, no storage, no assurance claims, unavailable domains stay unavailable');
