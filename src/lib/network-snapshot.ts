/**
 * Geometry snapshot of the background node network, in CSS pixels.
 * The canvas component registers a provider on mount; consumers (the CV
 * download) call `getNetworkSnapshot()` to capture the frame currently on
 * screen and re-draw it as vectors elsewhere (e.g. in a PDF).
 */
export type NetworkSnapshot = {
  width: number;
  height: number;
  /** [x, y] per node */
  nodes: Array<[number, number]>;
  /** [i, j, closeness] where closeness is 0..1 (1 = touching) */
  links: Array<[number, number, number]>;
  /** [i, j, k, alpha] for the soft triangle fills */
  triangles: Array<[number, number, number, number]>;
};

let provider: (() => NetworkSnapshot | null) | null = null;

export function registerNetworkSnapshot(fn: () => NetworkSnapshot | null) {
  provider = fn;
  return () => {
    if (provider === fn) provider = null;
  };
}

export function getNetworkSnapshot(): NetworkSnapshot | null {
  try {
    return provider ? provider() : null;
  } catch {
    return null;
  }
}
