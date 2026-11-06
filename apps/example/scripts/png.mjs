// Just enough PNG to compare screenshots with no dependency: 8-bit RGB or RGBA, no interlacing.
import zlib from 'node:zlib';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function decode(file) {
  if (!file.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG');
  let width = 0, height = 0, channels = 0;
  const data = [];
  for (let at = 8; at < file.length;) {
    const size = file.readUInt32BE(at);
    const type = file.toString('latin1', at + 4, at + 8);
    const body = file.subarray(at + 8, at + 8 + size);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const [depth, color, , , interlace] = body.subarray(8);
      channels = { 2: 3, 6: 4 }[color];
      if (depth !== 8 || !channels || interlace) throw new Error(`unsupported PNG: depth ${depth}, color ${color}, interlace ${interlace}`);
    } else if (type === 'IDAT') data.push(body);
    at += 12 + size;
  }
  const raw = zlib.inflateSync(Buffer.concat(data));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 3);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    const line = Buffer.from(raw.subarray(start + 1, start + 1 + stride));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[x] = (line[x] + add) & 255;
    }
    for (let x = 0; x < width; x++) line.copy(out, (y * width + x) * 3, x * channels, x * channels + 3);
    prev = line;
  }
  return { width, height, data: out };
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, body) => {
  const size = Buffer.alloc(4);
  size.writeUInt32BE(body.length);
  const named = Buffer.concat([Buffer.from(type, 'latin1'), body]);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc(named));
  return Buffer.concat([size, named, sum]);
};

export function encode({ width, height, data }) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const at = y * (stride + 1);
    raw[at] = 1; // Sub filter: flat UI compresses far better than unfiltered.
    for (let x = 0; x < stride; x++) raw[at + 1 + x] = (data[y * stride + x] - (x >= 3 ? data[y * stride + x - 3] : 0)) & 255;
  }
  return Buffer.concat([SIGNATURE, chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/** Box-averages down by a whole factor, so the width ends at or under `maxWidth`. */
export function shrink(image, maxWidth) {
  const factor = Math.max(1, Math.ceil(image.width / maxWidth));
  if (factor === 1) return image;
  const width = Math.floor(image.width / factor), height = Math.floor(image.height / factor);
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) for (let c = 0; c < 3; c++) {
    let sum = 0;
    for (let dy = 0; dy < factor; dy++) for (let dx = 0; dx < factor; dx++) sum += image.data[((y * factor + dy) * image.width + x * factor + dx) * 3 + c];
    data[(y * width + x) * 3 + c] = Math.round(sum / (factor * factor));
  }
  return { width, height, data };
}

/**
 * Share of pixels that differ by more than `tolerance` on any channel, skipping the top `ignoreTop` share of
 * the image, where the status bar's clock and battery live. Returns a picture of what changed, in red.
 */
export function compare(a, b, { tolerance = 24, ignoreTop = 0 } = {}) {
  if (a.width !== b.width || a.height !== b.height) return { ratio: 1, sizeChanged: true, diff: null };
  const first = Math.floor(a.height * ignoreTop);
  const diff = Buffer.from(a.data);
  let changed = 0;
  for (let y = first; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const at = (y * a.width + x) * 3;
    if (Math.max(Math.abs(a.data[at] - b.data[at]), Math.abs(a.data[at + 1] - b.data[at + 1]), Math.abs(a.data[at + 2] - b.data[at + 2])) > tolerance) {
      changed++;
      diff[at] = 255; diff[at + 1] = 0; diff[at + 2] = 0;
    }
  }
  return { ratio: changed / (a.width * (a.height - first)), sizeChanged: false, diff: { width: a.width, height: a.height, data: diff } };
}

/** True for a screen with nothing between the status bar and the home indicator, such as a cold start. */
export function isBlank({ width, height, data }, minShare = 0.003) {
  const [top, bottom] = [Math.floor(height * 0.15), Math.floor(height * 0.95)];
  const base = top * width * 3;
  let inked = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < width; x++) {
      const at = (y * width + x) * 3;
      if (Math.abs(data[at] - data[base]) + Math.abs(data[at + 1] - data[base + 1]) + Math.abs(data[at + 2] - data[base + 2]) > 48) inked++;
    }
  }
  return inked < (bottom - top) * width * minShare;
}
