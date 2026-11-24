import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'PoliticsPresentation', inputProps: {voiceover: ''}, browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'});
console.log('duration', composition.durationInFrames);
for (const f of frames) {
  await renderStill({composition, serveUrl, frame: f, output: `/tmp/claude-0/stills/f${f}.jpg`, imageFormat: 'jpeg', inputProps: {voiceover: ''}, browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'});
  console.log('ok', f);
}
