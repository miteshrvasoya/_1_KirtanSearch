/**
 * USAGE EXAMPLES FOR GUJARATI CONVERTER
 * 
 * This file demonstrates how to use the gujaratiConverter.js module
 * for converting between Unicode, Sulekh, and (future) Gujlish formats.
 */

import {
  unicodeToSulekh,
  sulekhToUnicode,
  isUnicodeGujarati,
  isSulekhText,
  detectTextFormat,
  convertTo
} from './gujaratiConverter.js';

// ============================================================================
// EXAMPLE 1: Basic Unicode to Sulekh Conversion
// ============================================================================

const unicodeText = "જય શ્રી સ્વામિનારાયણ";
const sulekhText = unicodeToSulekh(unicodeText);
console.log('Unicode:', unicodeText);
console.log('Sulekh:', sulekhText);

// ============================================================================
// EXAMPLE 2: Basic Sulekh to Unicode Conversion
// ============================================================================

const sulekhInput = "ÁÒ Ùä sÕâãÑÌâÓâÒÇ";
const unicodeOutput = sulekhToUnicode(sulekhInput);
console.log('Sulekh:', sulekhInput);
console.log('Unicode:', unicodeOutput);

// ============================================================================
// EXAMPLE 3: Auto-Detect Text Format
// ============================================================================

const text1 = "જય શ્રી સ્વામિનારાયણ";
const text2 = "ÁÒ Ùä sÕâãÑÌâÓâÒÇ";

console.log('Format of text1:', detectTextFormat(text1)); // 'unicode'
console.log('Format of text2:', detectTextFormat(text2)); // 'sulekh'

// ============================================================================
// EXAMPLE 4: Smart Conversion (Auto-Detect Source)
// ============================================================================

// Automatically detects source format and converts to target
const mixedText = "જય શ્રી સ્વામિનારાયણ";
const convertedToSulekh = convertTo(mixedText, 'sulekh');
console.log('Smart convert to Sulekh:', convertedToSulekh);

// ============================================================================
// EXAMPLE 5: Batch Conversion
// ============================================================================

const kirtanLines = [
  "જય શ્રી સ્વામિનારાયણ",
  "હરિ ૐ તત્સત્",
  "શ્રી સહજાનંદ સ્વામી"
];

const convertedLines = kirtanLines.map(line => unicodeToSulekh(line));
console.log('Converted lines:', convertedLines);

// ============================================================================
// EXAMPLE 6: Validation Before Conversion
// ============================================================================

function safeConvert(text, targetFormat) {
  if (!text) {
    console.warn('Empty text provided');
    return text;
  }
  
  const sourceFormat = detectTextFormat(text);
  
  if (sourceFormat === 'unknown') {
    console.warn('Unknown text format, returning as-is');
    return text;
  }
  
  console.log(`Converting from ${sourceFormat} to ${targetFormat}`);
  return convertTo(text, targetFormat);
}

// Usage
const result = safeConvert("જય શ્રી સ્વામિનારાયણ", 'sulekh');
console.log('Safe convert result:', result);

// ============================================================================
// EXAMPLE 7: Integration with React Component
// ============================================================================

/*
import { useState } from 'react';
import { convertTo, detectTextFormat } from './utils/gujaratiConverter';

function TextConverter() {
  const [inputText, setInputText] = useState('');
  const [outputFormat, setOutputFormat] = useState('unicode');
  
  const handleConvert = () => {
    const converted = convertTo(inputText, outputFormat);
    console.log('Converted:', converted);
  };
  
  const detectedFormat = detectTextFormat(inputText);
  
  return (
    <div>
      <textarea 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text..."
      />
      <p>Detected format: {detectedFormat}</p>
      <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
        <option value="unicode">Unicode</option>
        <option value="sulekh">Sulekh</option>
        <option value="gujlish">Gujlish (Coming Soon)</option>
      </select>
      <button onClick={handleConvert}>Convert</button>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 8: Future Gujlish Support (Placeholder)
// ============================================================================

/*
// When Gujlish support is implemented, usage will be:

import { unicodeToGujlish, gujlishToUnicode } from './gujaratiConverter';

const gujaratiText = "જય શ્રી સ્વામિનારાયણ";
const gujlishText = unicodeToGujlish(gujaratiText);
// Expected: "jay shri swaminarayan"

const backToGujarati = gujlishToUnicode(gujlishText);
// Expected: "જય શ્રી સ્વામિનારાયણ"
*/

export default {
  // Export examples for reference
  examples: {
    unicodeText,
    sulekhText,
    safeConvert
  }
};
