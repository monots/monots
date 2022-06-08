/**
 * Determine what entries should be displayed on the screen, based on the
 * currently selected index and the maximum visible. Used in list-based
 * prompts like `select` and `multiselect`.
 *
 * @param cursor the currently selected entry
 * @param total the total entries available to display
 * @param [maxVisible] the number of entries that can be displayed
 */
export function entriesToDisplay(cursor: number, total: number, maxVisible?: number) {
  maxVisible = maxVisible || total;

  let startIndex = Math.min(total - maxVisible, cursor - Math.floor(maxVisible / 2));

  if (startIndex < 0) {
    startIndex = 0;
  }

  const endIndex = Math.min(startIndex + maxVisible, total);

  return { startIndex, endIndex };
}
