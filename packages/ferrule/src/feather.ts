import { PixelRatio } from 'react-native';
import { FEATHER } from './feather-data';
import { flatten, rasterize, toPngUri } from './feather-raster';

// Its own entry point, `ferrule/lib/feather`, so an app with no icons does not carry the table.
// shortcut: every app using Icon carries all 287 paths, about 44 KB with the drawing code. Upgrade to per-icon modules if that ever matters.
export { FEATHER };
export type FeatherName = keyof typeof FEATHER;
export const FEATHER_NAMES = Object.keys(FEATHER) as FeatherName[];

/** Icons that point along the reading direction, so they mirror in right-to-left. Media controls and compass directions do not. */
const DIRECTIONAL = /^(arrow-(left|right|up-left|up-right|down-left|down-right)|arrow-(left|right)-circle|chevrons?-(left|right)|corner-.*|log-in|log-out)$/;
export const isDirectional = (name: FeatherName) => DIRECTIONAL.test(name);

const segments = new Map<string, number[]>();
const images = new Map<string, string>();

/** An image source for a Feather icon, sharp at this size on this screen. Drawn once per name and pixel size. */
export function featherSource(name: FeatherName, size: number) {
  const px = Math.max(1, Math.ceil(size * PixelRatio.get()));
  const key = `${name}:${px}`;
  let uri = images.get(key);
  if (!uri) {
    let shape = segments.get(name);
    if (!shape) segments.set(name, shape = flatten(FEATHER[name]));
    uri = toPngUri(rasterize(shape, px), px);
    images.set(key, uri);
  }
  return { uri, width: px, height: px, scale: px / size };
}
