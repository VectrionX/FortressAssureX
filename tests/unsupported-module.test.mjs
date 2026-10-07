import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const setup = fs.readFileSync(new URL('../components/AssessmentSetup.tsx', import.meta.url), 'utf8');

assert.match(setup, /export const SUPPORTED_MODULES/);
assert.match(setup, /SUPPORTED_MODULES\.map\(module/);
assert.match(setup, /if \(!SUPPORTED_MODULES\.includes\(module\)\) return/);
assert.match(app, /SUPPORTED_MODULES\.includes\(form\.module\)/);
assert.match(app, /enabledModules: initData\.enabledModules\.filter/);
assert.doesNotMatch(app, /Object\.values\(AssessmentModule\).*enabledModules/);
console.log('unsupported-module regression passed: UI and submit path enforce the supported-module allowlist');
