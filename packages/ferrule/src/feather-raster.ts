// Draws Feather's strokes with no native code. React Native core cannot show an SVG, and react-native-svg would be a
// required native dependency. Feather is uniform, a 2-unit stroke with round caps and joins on a 24-unit grid and no
// fills, which is exactly "every pixel within 1 unit of the path". So the shape is that distance, written out as a PNG.

type Segments = number[];

const TAU = Math.PI * 2;

/** Path data to straight segments, in Feather's 24-unit grid: x1, y1, x2, y2, ... */
export function flatten(d: string): Segments {
  const out: Segments = [];
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  let i = 0, cmd = '';
  let x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0; // Current, subpath start, last control point.
  const num = () => Number(tokens[i++]);
  const line = (nx: number, ny: number) => { out.push(x, y, nx, ny); x = nx; y = ny; };
  const curve = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) => {
    const [ax, ay] = [x, y];
    const steps = 12;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps, u = 1 - t;
      line(u * u * u * ax + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * nx, u * u * u * ay + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ny);
    }
    cx = x2; cy = y2;
  };
  // The SVG spec's endpoint-to-center conversion. Feather's arcs are not rotated, so rotation is ignored.
  const arc = (rxIn: number, ryIn: number, large: number, sweep: number, nx: number, ny: number) => {
    let rx = Math.abs(rxIn), ry = Math.abs(ryIn);
    if (!rx || !ry) { line(nx, ny); return; }
    const dx = (x - nx) / 2, dy = (y - ny) / 2;
    const fit = dx * dx / (rx * rx) + dy * dy / (ry * ry);
    if (fit > 1) { rx *= Math.sqrt(fit); ry *= Math.sqrt(fit); }
    const den = rx * rx * dy * dy + ry * ry * dx * dx;
    const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, (rx * rx * ry * ry - den) / den));
    const px = k * rx * dy / ry, py = -k * ry * dx / rx;
    const ox = px + (x + nx) / 2, oy = py + (y + ny) / 2;
    const start = Math.atan2((dy - py) / ry, (dx - px) / rx);
    let delta = Math.atan2((-dy - py) / ry, (-dx - px) / rx) - start;
    if (sweep && delta < 0) delta += TAU;
    if (!sweep && delta > 0) delta -= TAU;
    const steps = Math.max(4, Math.ceil(Math.abs(delta) / TAU * 32));
    for (let s = 1; s < steps; s++) {
      const angle = start + delta * s / steps;
      line(ox + rx * Math.cos(angle), oy + ry * Math.sin(angle));
    }
    line(nx, ny);
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i]!)) cmd = tokens[i++]!;
    const rel = cmd === cmd.toLowerCase();
    const bx = rel ? x : 0, by = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case 'M': x = sx = bx + num(); y = sy = by + num(); cmd = rel ? 'l' : 'L'; break;
      case 'L': { const a = bx + num(); line(a, by + num()); break; }
      case 'H': line(bx + num(), y); break;
      case 'V': line(x, by + num()); break;
      case 'C': { const a = bx + num(), b = by + num(), c = bx + num(), e = by + num(), f = bx + num(); curve(a, b, c, e, f, by + num()); break; }
      case 'S': { const a = 2 * x - cx, b = 2 * y - cy, c = bx + num(), e = by + num(), f = bx + num(); curve(a, b, c, e, f, by + num()); break; }
      case 'A': { const a = num(), b = num(); i++; const c = num(), e = num(), f = bx + num(); arc(a, b, c, e, f, by + num()); break; }
      case 'Z': line(sx, sy); break;
      default: throw new Error(`Unsupported path command ${cmd}`);
    }
    if (!/[CScs]/.test(cmd)) { cx = x; cy = y; }
  }
  return out;
}

/** One alpha byte per pixel. */
export function rasterize(segments: Segments, px: number): Uint8Array {
  const alpha = new Uint8Array(px * px);
  const unit = px / 24;
  const half = unit; // Half of the 2-unit stroke.
  const reach = half + 0.5; // Half a pixel of antialiasing past the edge.
  for (let n = 0; n < segments.length; n += 4) {
    const x1 = segments[n]! * unit, y1 = segments[n + 1]! * unit, x2 = segments[n + 2]! * unit, y2 = segments[n + 3]! * unit;
    const dx = x2 - x1, dy = y2 - y1;
    const len = dx * dx + dy * dy;
    const top = Math.max(0, Math.floor(Math.min(y1, y2) - reach)), bottom = Math.min(px - 1, Math.ceil(Math.max(y1, y2) + reach));
    const left = Math.max(0, Math.floor(Math.min(x1, x2) - reach)), right = Math.min(px - 1, Math.ceil(Math.max(x1, x2) + reach));
    for (let row = top; row <= bottom; row++) {
      const py = row + 0.5 - y1;
      for (let col = left; col <= right; col++) {
        const pxx = col + 0.5 - x1;
        const t = len ? Math.min(1, Math.max(0, (pxx * dx + py * dy) / len)) : 0;
        const ex = pxx - t * dx, ey = py - t * dy;
        const distance = Math.sqrt(ex * ex + ey * ey);
        const coverage = Math.min(1, reach - distance);
        if (coverage > 0) {
          const value = Math.round(coverage * 255);
          if (value > alpha[row * px + col]!) alpha[row * px + col] = value;
        }
      }
    }
  }
  return alpha;
}

const CRC = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Alpha bytes to a PNG data URI: an indexed image of white at 256 opacities. Stored, not compressed, so it needs no zlib. */
export function toPngUri(alpha: Uint8Array, px: number): string {
  const raw = px * px + px; // A filter byte per row.
  const blocks = Math.max(1, Math.ceil(raw / 65535));
  const idat = 2 + raw + blocks * 5 + 4;
  const size = 8 + (12 + 13) + (12 + 768) + (12 + 256) + (12 + idat) + 12;
  const out = new Uint8Array(size);
  let at = 0;
  const u32 = (v: number) => { out[at++] = v >>> 24; out[at++] = (v >>> 16) & 255; out[at++] = (v >>> 8) & 255; out[at++] = v & 255; };
  const chunk = (type: string, length: number, write: () => void) => {
    u32(length);
    const start = at;
    for (let i = 0; i < 4; i++) out[at++] = type.charCodeAt(i);
    write();
    let c = -1;
    for (let i = start; i < at; i++) c = CRC[(c ^ out[i]!) & 255]! ^ (c >>> 8);
    u32((c ^ -1) >>> 0);
  };
  for (const b of [137, 80, 78, 71, 13, 10, 26, 10]) out[at++] = b;
  chunk('IHDR', 13, () => { u32(px); u32(px); out[at++] = 8; out[at++] = 3; at += 3; });
  chunk('PLTE', 768, () => { out.fill(255, at, at + 768); at += 768; });
  chunk('tRNS', 256, () => { for (let i = 0; i < 256; i++) out[at++] = i; });
  chunk('IDAT', idat, () => {
    out[at++] = 0x78; out[at++] = 0x01;
    let a = 1, b = 0, left = raw, row = 0, col = -1;
    while (left > 0) {
      const count = Math.min(left, 65535);
      left -= count;
      out[at++] = left ? 0 : 1;
      out[at++] = count & 255; out[at++] = count >>> 8; out[at++] = ~count & 255; out[at++] = (~count >>> 8) & 255;
      for (let i = 0; i < count; i++) {
        const value = col < 0 ? 0 : alpha[row * px + col]!;
        if (++col === px) { col = -1; row++; }
        out[at++] = value;
        a = (a + value) % 65521; b = (b + a) % 65521;
      }
    }
    u32(((b << 16) | a) >>> 0);
  });
  chunk('IEND', 0, () => {});
  const parts: string[] = [];
  for (let i = 0; i < size; i += 3) {
    const a = out[i]!, b = out[i + 1] ?? 0, c = out[i + 2] ?? 0;
    parts.push(BASE64.charAt(a >> 2) + BASE64.charAt(((a & 3) << 4) | (b >> 4)) + (i + 1 < size ? BASE64.charAt(((b & 15) << 2) | (c >> 6)) : '=') + (i + 2 < size ? BASE64.charAt(c & 63) : '='));
  }
  return `data:image/png;base64,${parts.join('')}`;
}
