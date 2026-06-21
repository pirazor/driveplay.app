import { Platform } from 'youtubei.js';
import { Jinter } from 'jintr';

/**
 * youtubei.js v17+ refuses to decipher YouTube's signature in Node unless you
 * supply your own JavaScript interpreter (for security/size reasons). We plug
 * in `jintr` — a sandboxed JS interpreter — so resolve() can produce playable
 * stream URLs. YouTube's player script changes often, so this is best-effort.
 */
let installed = false;

export function installYouTubeRuntime() {
  if (installed) return;
  installed = true;
  try {
    Platform.shim.eval = (data, env) => {
      const jinter = new Jinter(data.output);
      for (const [key, value] of Object.entries(env)) {
        jinter.defineObject(key, value);
      }
      return jinter.evaluate();
    };
  } catch (err) {
    console.warn('Failed to install YouTube JS runtime:', err?.message);
  }
}
