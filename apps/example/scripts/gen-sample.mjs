// Generates assets/sample.png, so the harness ships no third-party image.
import fs from 'node:fs';
import zlib from 'node:zlib';

const W = 640, H = 400;
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0, o = 0; y < H; y++) {
  raw[o++] = 0;
  for (let x = 0; x < W; x++) {
    const horizon = 250 + 30 * Math.sin(x / 70) + 12 * Math.sin(x / 19);
    const sky = y < horizon;
    const t = y / H;
    raw[o++] = sky ? 40 + 180 * t : 24 + 26 * Math.sin(y / 9);
    raw[o++] = sky ? 70 + 110 * t : 40 + 20 * t;
    raw[o++] = sky ? 140 + 60 * t : 56;
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc(body));
  return Buffer.concat([head, body, tail]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;
fs.writeFileSync(new URL('../assets/sample.png', import.meta.url), Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]));
