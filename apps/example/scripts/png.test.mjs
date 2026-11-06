import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compare, decode, encode, shrink, isBlank } from './png.mjs';

const image = (width, height, fill) => ({ width, height, data: Buffer.alloc(width * height * 3, fill) });

test('encode and decode round-trip', () => {
  const source = image(5, 4, 0);
  for (let i = 0; i < source.data.length; i++) source.data[i] = (i * 37) & 255;
  const back = decode(encode(source));
  assert.equal(back.width, 5);
  assert.equal(back.height, 4);
  assert.ok(back.data.equals(source.data));
});

test('compare passes equal images and tolerates small shifts', () => {
  assert.equal(compare(image(4, 4, 100), image(4, 4, 110)).ratio, 0);
  assert.equal(compare(image(4, 4, 100), image(4, 4, 200)).ratio, 1);
});

test('compare reports the share changed, and skips the status bar', () => {
  const b = image(10, 10, 0);
  b.data.fill(255, 0, 30); // The whole top row.
  assert.equal(compare(image(10, 10, 0), b).ratio, 0.1);
  assert.equal(compare(image(10, 10, 0), b, { ignoreTop: 0.1 }).ratio, 0);
});

test('a size change is a failure, not a crash', () => {
  const result = compare(image(4, 4, 0), image(4, 5, 0));
  assert.equal(result.sizeChanged, true);
  assert.equal(result.ratio, 1);
});

test('shrink averages down to the width limit', () => {
  const big = image(8, 8, 200);
  const small = shrink(big, 4);
  assert.equal(small.width, 4);
  assert.equal(small.data[0], 200);
  assert.equal(shrink(big, 100), big);
});

test('isBlank tells a cold start from a screen with content', () => {
  const image = { width: 100, height: 100, data: Buffer.alloc(100 * 100 * 3, 250) };
  assert.equal(isBlank(image), true);
  // A banner above the checked area, as Metro's download bar, still counts as blank.
  image.data.fill(40, 0, 10 * 100 * 3);
  assert.equal(isBlank(image), true);
  // A control in the middle of the screen does not.
  for (let y = 50; y < 55; y++) image.data.fill(40, (y * 100 + 10) * 3, (y * 100 + 40) * 3);
  assert.equal(isBlank(image), false);
});
