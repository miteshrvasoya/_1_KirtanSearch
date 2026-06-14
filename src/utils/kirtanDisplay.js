export const splitKirtanLines = (text) =>
  text ? text.split('\n').filter((line) => line.trim() !== '') : [];

/**
 * Resolve which script to show for a kirtan.
 * Gujarati (unicode/sulekh) is preferred when present; Hindi is used only
 * when there is no Gujarati original content.
 */
export const getKirtanDisplayData = (kirtan) => {
  const hindiLines = splitKirtanLines(kirtan.hindiContent);
  const unicodeLines = splitKirtanLines(kirtan.unicodeContent);
  const sulekhLines = splitKirtanLines(kirtan.sulekhContent);

  const hasGujaratiContent = unicodeLines.length > 0 || sulekhLines.length > 0;
  const isHindiKirtan = !hasGujaratiContent && hindiLines.length > 0;

  const displayLines = isHindiKirtan
    ? hindiLines
    : (unicodeLines.length > 0 ? unicodeLines : sulekhLines);

  const outputLines = isHindiKirtan
    ? hindiLines
    : (sulekhLines.length > 0 ? sulekhLines : unicodeLines);

  const title = isHindiKirtan
    ? (kirtan.hindiTitle || kirtan.unicodeTitle || kirtan.sulekhTitle || kirtan.englishTitle || 'Untitled')
    : (kirtan.unicodeTitle || kirtan.sulekhTitle || kirtan.hindiTitle || kirtan.englishTitle || 'Untitled');

  const originalInputText = isHindiKirtan
    ? (kirtan.hindiContent || '')
    : (kirtan.unicodeContent || kirtan.sulekhContent || '');

  return {
    isHindiKirtan,
    hindiLines,
    unicodeLines,
    sulekhLines,
    displayLines,
    outputLines,
    title,
    originalInputText
  };
};

export const getKirtanTitle = (kirtan) => getKirtanDisplayData(kirtan).title;

export const buildInitialSelectedLines = (displayLines, outputLines, hindiLines) =>
  displayLines.slice(0, 2).map((displayLine, idx) => ({
    unicode: displayLine,
    sulekh: outputLines[idx] || displayLine,
    hindi: hindiLines[idx] || ''
  }));
