import { useEffect, useRef, useState } from 'react';
import { Feather } from './chrome';
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

/** Loops silently. It starts paused under reduced motion, and the button can stop it either way. */
function Footage({ item, shape, poster }: { item: Media; shape: object; poster: string }) {
  const reduced = usePrefersReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(reduced);
  useEffect(() => setPaused(reduced), [reduced]);
  useEffect(() => {
    if (paused) video.current?.pause();
    else video.current?.play().catch(() => setPaused(true)); // A browser that refuses autoplay gets the play button.
  }, [paused]);
  return (
    <div className="footage">
      {/* Muted footage with no speech, so captions have nothing to carry. The aria-label says what it shows. */}
      <video {...shape} ref={video} src={asset(`/media/${item.file}.mp4`)} poster={poster} muted loop playsInline preload="none" aria-label={item.caption} />
      <button type="button" aria-label={paused ? 'Play video' : 'Pause video'} title={paused ? 'Play' : 'Pause'} onClick={() => setPaused(!paused)}><Feather name={paused ? 'play' : 'pause'} /></button>
    </div>
  );
}

/** The video or still alone, with its aspect ratio reserved. */
export function MediaFrame({ item }: { item: Media }) {
  const poster = asset(`/media/${item.file}.jpg`);
  const [width, height] = (sizes as Record<string, number[]>)[item.file]!;
  const shape = { width, height, style: { aspectRatio: `${width} / ${height}` } };
  return item.kind === 'video'
    ? <Footage item={item} shape={shape} poster={poster} />
    : <img {...shape} src={poster} alt={item.caption} loading="lazy" />;
}

export function MediaFigure({ item }: { item: Media }) {
  return (
    <figure className="capture">
      <MediaFrame item={item} />
      <figcaption><strong>{item.platform}</strong>{item.caption}</figcaption>
    </figure>
  );
}
