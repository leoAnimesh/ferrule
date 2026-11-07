/**
 * Returns item indexes per column, in reading order. The first row stays in order, then the
 * tallest of the rest goes first into the shortest column, which keeps the column bottoms close.
 */
export function distribute(heights: number[], columns: number): number[][] {
  const placed: number[][] = Array.from({ length: columns }, () => []);
  const used = new Array<number>(columns).fill(0);
  const rest = heights.map((_, index) => index).slice(columns).sort((a, b) => heights[b]! - heights[a]! || a - b);
  for (const index of [...heights.keys()].slice(0, columns).concat(rest)) {
    const shortest = used.indexOf(Math.min(...used));
    placed[shortest]!.push(index);
    used[shortest]! += heights[index]!;
  }
  // Close what's left: move an item between two columns, or swap a pair, for as long as that evens them out.
  const movable = (column: number) => placed[column]!.filter((index) => index >= columns);
  for (;;) {
    let best: { tall: number; short: number; from: number; to: number | null; shift: number; gain: number } | null = null;
    for (let tall = 0; tall < columns; tall++) {
      for (let short = 0; short < columns; short++) {
        const gap = used[tall]! - used[short]!;
        for (const from of movable(tall)) {
          for (const to of [null, ...movable(short)]) {
            const shift = heights[from]! - (to === null ? 0 : heights[to]!);
            const gain = shift * (gap - shift); // Half the fall in the sum of squares, so the loop always ends.
            if (shift > 0 && shift < gap && (!best || gain > best.gain)) best = { tall, short, from, to, shift, gain };
          }
        }
      }
    }
    if (!best) break;
    const { tall, short, from, to, shift } = best;
    placed[tall] = placed[tall]!.filter((index) => index !== from).concat(to === null ? [] : [to]);
    placed[short] = placed[short]!.filter((index) => index !== to).concat(from);
    used[tall]! -= shift;
    used[short]! += shift;
  }
  return placed.map((column) => column.sort((a, b) => a - b));
}

export const columnCount = (width: number) => (width >= 1640 ? 5 : width >= 1120 ? 4 : width >= 800 ? 3 : width >= 640 ? 2 : 1);
