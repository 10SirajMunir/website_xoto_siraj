/* Adaptive loading: low-end phones, Data Saver users and browsers without WebGL get a still hero
   instead of video and 3D. deviceMemory and hardwareConcurrency are Chromium hints; where a browser lacks
   them we assume a capable device and rely on the 3D scene's frame-rate monitor to step quality down. */

/** Runs inline in <head> before first paint, so CSS can show the still render straight away. */
export const LITE_SCRIPT = `(function(){var n=navigator,d=document.documentElement;d.classList.add('js');
if((n.connection&&n.connection.saveData)||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2))d.classList.add('lite')})()`;

export function isLiteDevice() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('lite');
}

/** Cheap check before downloading three.js at all. */
export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}
