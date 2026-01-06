/**
 * Comprehensive Gujarati Text Converter
 * Supports conversion between:
 * - Unicode Gujarati (standard)
 * - Sulekh Gujarati (legacy font)
 * - Gujlish (Roman transliteration) - Coming soon
 */

// ============================================================================
// UNICODE TO SULEKH CONVERSION
// ============================================================================

/**
 * Convert Unicode Gujarati text to Sulekh font format
 * @param {string} text - Unicode Gujarati text
 * @returns {string} Sulekh formatted text
 */
export const unicodeToSulekh = (text) => {
  if (!text) return text;
  
  let modifiedText = text;
  
  // Pre-processing: Handle special combinations
  modifiedText = modifiedText.replace(/;/g, "ñ");
  modifiedText = modifiedText.replace(/ત્ર્/g, "X");
  modifiedText = modifiedText.replace(/ક્ષ્/g, "x");
  modifiedText = modifiedText.replace(/શ્ર્ન/g, "—");
  modifiedText = modifiedText.replace(/શ્ર્/g, "W");
  modifiedText = modifiedText.replace(/ર્/g, "ô");
  modifiedText = modifiedText.replace(/X/g, "ત્ર્");
  modifiedText = modifiedText.replace(/x/g, "ક્ષ્");
  
  // Adjust position of i maatraas
  modifiedText = modifiedText.replace(/િં/g, "i");
  modifiedText = modifiedText.replace(/િ/g, "ã");
  
  // Reph positioning
  modifiedText = modifiedText.replace(/ô([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])/g, "$1$2ô");
  modifiedText = modifiedText.replace(/ô([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])/g, "$1$2ô");
  modifiedText = modifiedText.replace(/ô([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([ાીુૂૃેૈોૌંઁૅૉ઼]*)/g, "$1$2ô");
  
  modifiedText = modifiedText.replace(/ીô/g, "þ");
  modifiedText = modifiedText.replace(/ંô/g, "õ");
  modifiedText = modifiedText.replace(/ôã/g, "ãô");
  modifiedText = modifiedText.replace(/ôi/g, "ãõ");
  
  // Adjust i maatraa position
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([iã])/g, "$2$1");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])(્)([*iã])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])(્)([iã])/g, "$3$1$2");
  
  // Halanta handling
  modifiedText = modifiedText.replace(/[્]([ \,\;\.\।\n\-\:])/g, "z$1");
  
  // Main conversion mapping
  const conversionMap = [
    ["ૐ", "A"],
    ["ઈં", "š"], ["ઇં", "™"], ["ઉં", "ø"], ["ઊં", "ù"],
    ["અ", "á"], ["આ", "áâ"], ["ઇ", "å"], ["ઈ", "æ"],
    ["ઉ", "é"], ["ઊ", "ê"], ["ઋ", "°"],
    ["એ", "áë"], ["ઐ", "áì"], ["ઓ", "áí"], ["ઔ", "áî"],
    ["ઍ", "á&"], ["ઑ", "áâ&"],
    ["ક", "»"], ["ખ", "¼"], ["ગ", "½"], ["ઘ", "¾"], ["ઙ", "a"],
    ["ચ", "¿"], ["છ", "À"], ["જ", "Á"], ["ઝ", "Â"], ["ઞ", ":â"],
    ["ટ", "Ã"], ["ઠ", "Ä"], ["ડ", "Å"], ["ઢ", "Æ"], ["ણ", "Ç"],
    ["ત", "È"], ["થ", "É"], ["દ", "Ê"], ["ધ", "Ë"], ["ન", "Ì"],
    ["પ", "Í"], ["ફ", "Î"], ["બ", "Ï"], ["ભ", "Ð"], ["મ", "Ñ"],
    ["ય", "Ò"], ["ર", "Ó"], ["લ", "Ô"], ["વ", "Õ"],
    ["શ", "×"], ["ષ", "Ø"], ["સ", "Ö"], ["હ", "Ú"], ["ળ", "Û"],
    ["ક્ષ", "Ü"], ["જ્ઞ", "Þ"],
    ["ા", "â"], ["િ", "ã"], ["ી", "ä"], ["ુ", "ç"], ["ૂ", "è"],
    ["ૃ", "ö"], ["ે", "ë"], ["ૈ", "ì"], ["ો", "í"], ["ૌ", "î"],
    ["ં", "ï"], ["ઃ", "ð"], ["્", "z"], ["।", "ó"],
    ["૦", "0"], ["૧", "1"], ["૨", "2"], ["૩", "3"], ["૪", "4"],
    ["૫", "5"], ["૬", "6"], ["૭", "7"], ["૮", "8"], ["૯", "9"]
  ];
  
  // Apply conversion mapping
  for (const [unicode, sulekh] of conversionMap) {
    modifiedText = modifiedText.split(unicode).join(sulekh);
  }
  
  return modifiedText;
};

// ============================================================================
// SULEKH TO UNICODE CONVERSION
// ============================================================================

/**
 * Convert Sulekh font format to Unicode Gujarati
 * @param {string} text - Sulekh formatted text
 * @returns {string} Unicode Gujarati text
 */
export const sulekhToUnicode = (text) => {
  if (!text) return text;
  
  let modifiedText = text;
  
  // Pre-processing: Handle corrupted combinations
  modifiedText = modifiedText.replace(/ã×/g, "શિ");
  modifiedText = modifiedText.replace(/×/g, "શ");
  modifiedText = modifiedText.replace(/Ø/g, "ષ્ટ");
  modifiedText = modifiedText.replace(/z:/g, "્ઞ");
  
  // Direct character replacements for common characters
  const directReplacements = [
    ["Ð", "ભ"], ["½", "ગ"], ["Õ", "વ"], ["È", "ત"], ["Ì", "ન"],
    ["Ç", "ણ"], ["Ñ", "મ"], ["Ó", "ર"], ["Ú", "હ"], ["Á", "જ"],
    ["É", "થ"], ["Ë", "ધ"], ["Í", "પ"], ["Ò", "ય"], ["Ô", "લ"],
    ["Ö", "સ"], ["×", "શ"], ["Ã", "ટ"], ["Ä", "ઠ"], ["Å", "ડ"],
    ["Æ", "ઢ"], ["Ê", "દ"], ["Î", "ફ"], ["Ï", "બ"], ["¿", "ચ"],
    ["À", "છ"], ["»", "ક"], ["¼", "ખ"], ["¾", "ઘ"]
  ];
  
  for (const [sulekh, unicode] of directReplacements) {
    modifiedText = modifiedText.split(sulekh).join(unicode);
  }
  
  // Conversion mapping for remaining characters
  const conversionMap = [
    ["A", "ૐ"],
    ["áí", "ઓ"], ["áî", "ઔ"], ["áë", "એ"], ["á&", "ઍ"],
    ["áì", "ઐ"], ["áâ&", "ઑ"], ["áâ", "આ"], ["á", "અ"],
    ["å", "ઇ"], ["æ", "ઈ"], ["é", "ઉ"], ["ê", "ઊ"], ["°", "ઋ"],
    ["š", "ઈં"], ["™", "ઇં"], ["ø", "ઉં"], ["ù", "ઊં"],
    ["Ü", "ક્ષ"], ["Ý", "ત્ર"], ["Þ", "જ્ઞ"], ["Q", "ઠ્ઠ"],
    ["»", "ક"], ["¼", "ખ"], ["½", "ગ"], ["¾", "ઘ"], ["a", "ઙ"],
    ["¿", "ચ"], ["À", "છ"], ["Á", "જ"], ["Â", "ઝ"],
    ["Ã", "ટ"], ["Ä", "ઠ"], ["Å", "ડ"], ["Æ", "ઢ"], ["Ç", "ણ"],
    ["È", "ત"], ["É", "થ"], ["Ê", "દ"], ["Ë", "ધ"], ["Ì", "ન"],
    ["Í", "પ"], ["Î", "ફ"], ["Ï", "બ"], ["Ð", "ભ"], ["Ñ", "મ"],
    ["Ò", "ય"], ["Ó", "ર"], ["Ô", "લ"], ["Õ", "વ"],
    ["×", "શ"], ["Ø", "ષ"], ["Ö", "સ"], ["Ú", "હ"], ["Û", "ળ"],
    ["â", "ા"], ["ä", "ી"], ["ç", "ુ"], ["è", "ૂ"], ["ö", "ૃ"],
    ["ë", "ે"], ["ì", "ૈ"], ["í", "ો"], ["î", "ૌ"],
    ["ï", "ં"], ["ð", "ઃ"], ["z", "્"], ["ó", "।"],
    ["0", "૦"], ["1", "૧"], ["2", "૨"], ["3", "૩"], ["4", "૪"],
    ["5", "૫"], ["6", "૬"], ["7", "૭"], ["8", "૮"], ["9", "૯"]
  ];
  
  // Apply conversion mapping
  for (const [sulekh, unicode] of conversionMap) {
    modifiedText = modifiedText.split(sulekh).join(unicode);
  }
  
  // Post-processing for proper positioning
  modifiedText = modifiedText.replace(/ý/g, "્ર");
  modifiedText = modifiedText.replace(/([ãi*])([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$1");
  modifiedText = modifiedText.replace(/([ãi*])(્)([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$3$1");
  modifiedText = modifiedText.replace(/([ãi*])(્)([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$3$1");
  modifiedText = modifiedText.replace(/ã/g, "િ");
  modifiedText = modifiedText.replace(/i/g, "િં");
  
  // Reph positioning
  modifiedText = modifiedText.replace(/þ/g, "ôી");
  modifiedText = modifiedText.replace(/õ/g, "ંô");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([ાિીુૂૃેૈોૌંઁૅૉ઼]*)([ô])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])([ô])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])([ô])/g, "$3$1$2");
  modifiedText = modifiedText.replace(/ô/g, "ર્");
  
  // Clean up maatras
  modifiedText = modifiedText.replace(/([ંઁ॰])([ાિીુૂૃેૈોૌૅૉ])/g, "$2$1");
  modifiedText = modifiedText.replace(/([ાિીુૂૃેૈોૌૅૉઁ])([ાિીુૂૃેૈોૌૅૉ])/g, "$1");
  
  return modifiedText;
};

// ============================================================================
// GUJLISH (TRANSLITERATION) CONVERSION - COMING SOON
// ============================================================================

/**
 * Convert Unicode Gujarati to Gujlish (Roman transliteration)
 * @param {string} text - Unicode Gujarati text
 * @returns {string} Gujlish transliteration
 * @todo Implement full transliteration logic
 */
export const unicodeToGujlish = (text) => {
  if (!text) return text;
  
  // TODO: Implement Unicode to Gujlish conversion
  // This will map Gujarati characters to their Roman equivalents
  // Example: ક -> ka, ખ -> kha, etc.
  
  console.warn('unicodeToGujlish: Not yet implemented');
  return text;
};

/**
 * Convert Gujlish (Roman transliteration) to Unicode Gujarati
 * @param {string} text - Gujlish transliteration
 * @returns {string} Unicode Gujarati text
 * @todo Implement full transliteration logic
 */
export const gujlishToUnicode = (text) => {
  if (!text) return text;
  
  // TODO: Implement Gujlish to Unicode conversion
  // This will map Roman characters to their Gujarati equivalents
  // Example: ka -> ક, kha -> ખ, etc.
  
  console.warn('gujlishToUnicode: Not yet implemented');
  return text;
};

/**
 * Convert Sulekh to Gujlish via Unicode intermediate
 * @param {string} text - Sulekh formatted text
 * @returns {string} Gujlish transliteration
 */
export const sulekhToGujlish = (text) => {
  const unicode = sulekhToUnicode(text);
  return unicodeToGujlish(unicode);
};

/**
 * Convert Gujlish to Sulekh via Unicode intermediate
 * @param {string} text - Gujlish transliteration
 * @returns {string} Sulekh formatted text
 */
export const gujlishToSulekh = (text) => {
  const unicode = gujlishToUnicode(text);
  return unicodeToSulekh(unicode);
};

// ============================================================================
// TEXT DETECTION UTILITIES
// ============================================================================

/**
 * Detect if text is Unicode Gujarati
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains Unicode Gujarati characters
 */
export const isUnicodeGujarati = (text) => {
  if (!text) return false;
  const gujaratiPattern = /[અ-ઔક-હા-ૅે-ૌં-ઃ્]/;
  return gujaratiPattern.test(text);
};

/**
 * Detect if text is Sulekh format
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains Sulekh characters
 */
export const isSulekhText = (text) => {
  if (!text) return false;
  const sulekhPattern = /[áâåæéêÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕ×ØÖÚÛäçèöëìíîïðz]/;
  return sulekhPattern.test(text);
};

/**
 * Detect if text is Gujlish (Roman transliteration)
 * @param {string} text - Text to check
 * @returns {boolean} True if text appears to be Gujlish
 * @todo Implement proper Gujlish detection
 */
export const isGujlishText = (text) => {
  if (!text) return false;
  
  // TODO: Implement proper Gujlish detection
  // For now, check if it's NOT Unicode or Sulekh and contains Latin characters
  if (isUnicodeGujarati(text) || isSulekhText(text)) {
    return false;
  }
  
  // Basic check for Latin characters
  const latinPattern = /[a-zA-Z]/;
  return latinPattern.test(text);
};

/**
 * Auto-detect text format and return format type
 * @param {string} text - Text to analyze
 * @returns {'unicode'|'sulekh'|'gujlish'|'unknown'} Detected format
 */
export const detectTextFormat = (text) => {
  if (!text) return 'unknown';
  
  if (isUnicodeGujarati(text)) return 'unicode';
  if (isSulekhText(text)) return 'sulekh';
  if (isGujlishText(text)) return 'gujlish';
  
  return 'unknown';
};

// ============================================================================
// SMART CONVERSION (AUTO-DETECT SOURCE FORMAT)
// ============================================================================

/**
 * Smart convert to target format (auto-detects source)
 * @param {string} text - Input text
 * @param {'unicode'|'sulekh'|'gujlish'} targetFormat - Desired output format
 * @returns {string} Converted text
 */
export const convertTo = (text, targetFormat) => {
  if (!text) return text;
  
  const sourceFormat = detectTextFormat(text);
  
  // If already in target format, return as-is
  if (sourceFormat === targetFormat) return text;
  
  // Conversion matrix
  const conversions = {
    'unicode-sulekh': unicodeToSulekh,
    'unicode-gujlish': unicodeToGujlish,
    'sulekh-unicode': sulekhToUnicode,
    'sulekh-gujlish': sulekhToGujlish,
    'gujlish-unicode': gujlishToUnicode,
    'gujlish-sulekh': gujlishToSulekh
  };
  
  const conversionKey = `${sourceFormat}-${targetFormat}`;
  const converter = conversions[conversionKey];
  
  if (converter) {
    return converter(text);
  }
  
  console.warn(`No conversion path from ${sourceFormat} to ${targetFormat}`);
  return text;
};

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

// Export with original names for backward compatibility
export const convertUnicodeToSulekh = unicodeToSulekh;
export const convertSulekhToUnicode = sulekhToUnicode;

// Default export with all functions
export default {
  // Main conversions
  unicodeToSulekh,
  sulekhToUnicode,
  unicodeToGujlish,
  gujlishToUnicode,
  sulekhToGujlish,
  gujlishToSulekh,
  
  // Detection utilities
  isUnicodeGujarati,
  isSulekhText,
  isGujlishText,
  detectTextFormat,
  
  // Smart conversion
  convertTo,
  
  // Backward compatibility
  convertUnicodeToSulekh,
  convertSulekhToUnicode
};
