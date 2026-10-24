/** Keeps complete groups on one line, reserving the More button when needed. */
export const getVisibleToolbarGroupCount = (
  widths: number[],
  availableWidth: number,
  gap: number,
  moreWidth: number
): number => {
  const total =
    widths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, widths.length - 1) * gap;
  if (total <= availableWidth) return widths.length;

  let used = 0;
  let count = 0;
  for (const width of widths) {
    const next = used + width + (count > 0 ? gap : 0);
    if (next + gap + moreWidth > availableWidth) break;
    used = next;
    count++;
  }
  return count;
};
