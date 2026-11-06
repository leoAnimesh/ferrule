import { useEffect, useState } from 'react';
import { asset } from './router';
import type { Media } from './captures';
import sizes from './generated/media-sizes.json';

const usePrefersReducedMotion = () => {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setReduced(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return reduced;
};

export function MediaFigure({ item }: { item: Media }) {
  const reduced = usePrefersReducedMotion();
  const poster = asset(`/media/${item.file}.jpg`);
  const [width, height] = (sizes as Record<string, number[]>)[item.file]!;
  const shape = { width, height, style: { aspectRatio: `${width} / ${height}` } };
  return (
    <figure className="capture">
      {item.kind === 'video'
        // Muted footage with no speech, so captions have nothing to carry. The figcaption says what it shows.
        ? <video {...shape} key={String(reduced)} src={asset(`/media/${item.file}.mp4`)} poster={poster} muted loop playsInline controls preload="none" autoPlay={!reduced} aria-label={item.caption} />
        : <img {...shape} src={poster} alt={item.caption} loading="lazy" />}
      <figcaption><strong>{item.platform}</strong>{item.caption}</figcaption>
    </figure>
  );
}
