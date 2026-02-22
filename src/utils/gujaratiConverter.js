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
  
  // ============ PRE-PROCESSING: Handle special conjuncts BEFORE main conversion ============
  
  // Special conjunct replacements (order matters - longer patterns first!)
  
  // Ligatures for R-conjuncts (Consonant + ્ + ર)
  modifiedText = modifiedText.replace(/ટ્ર/g, "Ã÷");      // ટ્ર -> Ã÷
  modifiedText = modifiedText.replace(/ડ્ર/g, "Å÷");      // ડ્ર -> Å÷
  modifiedText = modifiedText.replace(/જ્ર/g, "`");       // જ્ર -> `
  modifiedText = modifiedText.replace(/સ્ર/g, "Öý");      // સ્ર -> Öý
  modifiedText = modifiedText.replace(/દ્રુ/g, "d");      // દ્રુ -> d
  modifiedText = modifiedText.replace(/દ્ર/g, "¨");       // દ્ર -> ¨ (Ligature)
  modifiedText = modifiedText.replace(/ક્ર/g, "®");       // ક્ર -> ® (Ligature)
  modifiedText = modifiedText.replace(/ફ્ર/g, "<");       // ફ્ર -> < (Ligature)
  modifiedText = modifiedText.replace(/હ્ર/g, "¡");       // હ્ર -> ¡ (Ligature)
  modifiedText = modifiedText.replace(/પ્ર/g, "Íý");      // પ્ર -> Íý
  modifiedText = modifiedText.replace(/ગ્ર/g, "½ý");      // ગ્ર -> ½ý
  modifiedText = modifiedText.replace(/ત્ર/g, "Ý");       // ત્ર -> Ý
  
  // Special combinations from reference
  modifiedText = modifiedText.replace(/સ્ત્ર/g, "sÝ");    // સ્ત્ર -> sÝ
  modifiedText = modifiedText.replace(/હ્લ/g, "¤");       // હ્લ -> ¤
  modifiedText = modifiedText.replace(/શ્ર્વ/g, "œ");     // શ્ર્વ -> œ
  modifiedText = modifiedText.replace(/જ્જ/g, "~");       // જ્જ -> ~
  modifiedText = modifiedText.replace(/ક્ન/g, "kÌ");      // ક્ન -> kÌ
  modifiedText = modifiedText.replace(/ટ્ટ/g, "q");       // ટ્ટ -> q
  modifiedText = modifiedText.replace(/ટ્ઠ/g, "V");       // ટ્ઠ -> V
  modifiedText = modifiedText.replace(/ડ્ડ/g, "f");       // ડ્ડ -> f
  modifiedText = modifiedText.replace(/ત્ન/g, "tÌ");      // ત્ન -> tÌ
  modifiedText = modifiedText.replace(/ઢ્ઢ/g, "F");       // ઢ્ઢ -> F
  modifiedText = modifiedText.replace(/ડ્ઢ/g, "²");       // ડ્ઢ -> ²
  modifiedText = modifiedText.replace(/હ્ય/g, "[");       // હ્ય -> [
  modifiedText = modifiedText.replace(/શ્ન/g, "SÌ");      // શ્ન -> SÌ
  modifiedText = modifiedText.replace(/હ્ણ/g, "ÚzÇ");     // હ્ણ -> ÚzÇ
  modifiedText = modifiedText.replace(/હ્મ/g, "¢");       // હ્મ -> ¢
  modifiedText = modifiedText.replace(/હ્ન/g, "{");       // હ્ન -> {
  modifiedText = modifiedText.replace(/હ્વ/g, "H");       // હ્વ -> H
  modifiedText = modifiedText.replace(/દ્ઘ/g, "Êz¾");     // દ્ઘ -> Êz¾
  modifiedText = modifiedText.replace(/દ્બ/g, "©");       // દ્બ -> ©
  modifiedText = modifiedText.replace(/દ્ભ/g, "ÊzÐ");     // દ્ભ -> ÊzÐ
  modifiedText = modifiedText.replace(/દ્મ/g, "M");       // દ્મ -> M
  modifiedText = modifiedText.replace(/દ્વ/g, "]");       // દ્વ -> ]
  modifiedText = modifiedText.replace(/દ્ગ/g, "Êz½");     // દ્ગ -> Êz½
  modifiedText = modifiedText.replace(/દ્ધ/g, "}");       // દ્ધ -> }
  modifiedText = modifiedText.replace(/ન્ન/g, "ƒ");       // ન્ન -> ƒ
  modifiedText = modifiedText.replace(/પ્ત/g, "pÈ");      // પ્ત -> pÈ
  modifiedText = modifiedText.replace(/પ્ન/g, "Í‚");      // પ્ન -> Í‚
  modifiedText = modifiedText.replace(/ત્ત્/g, "^");      // ત્ત્ -> ^
  modifiedText = modifiedText.replace(/ત્ત/g, "^â");      // ત્ત -> ^â
  modifiedText = modifiedText.replace(/ષ્ટ/g, "wÃ");      // ષ્ટ -> wÃ
  modifiedText = modifiedText.replace(/ષ્ઠ/g, "wÄ");      // ષ્ઠ -> wÄ
  modifiedText = modifiedText.replace(/શ્ચ/g, "@");       // શ્ચ -> @
  modifiedText = modifiedText.replace(/દ્દ/g, "§");       // દ્દ -> §
  modifiedText = modifiedText.replace(/હૃ/g, "_");        // હૃ -> _
  modifiedText = modifiedText.replace(/ક્ક/g, ">");       // ક્ક -> >
  
  // Consonant + ્ + ય combinations (half-letter + ya)
  modifiedText = modifiedText.replace(/વ્ય/g, "vÒ");      // વ્ય -> vÒ
  modifiedText = modifiedText.replace(/પ્ય/g, "pÒ");      // પ્ય -> pÒ
  modifiedText = modifiedText.replace(/દ્ય/g, "Y");       // દ્ય -> Y
  modifiedText = modifiedText.replace(/સ્ન/g, "sÌ");      // સ્ન -> sÌ
  modifiedText = modifiedText.replace(/ળ્ય/g, "LÒ");      // ળ્ય -> LÒ
  modifiedText = modifiedText.replace(/શ્ર/g, "Ù");       // શ્ર -> Ù
  
  // Handle જ્ઞ before જ (important - longer pattern first!)
  modifiedText = modifiedText.replace(/જ્ઞ/g, "Þ");       // જ્ઞ -> Þ
  
  // Special standalone characters
  modifiedText = modifiedText.replace(/રૂ/g, "#");        // રૂ -> #
  modifiedText = modifiedText.replace(/રું/g, "rï");      // રું -> rï
  modifiedText = modifiedText.replace(/રુ/g, "r");        // રુ -> r
  modifiedText = modifiedText.replace(/જા/g, "'");        // જા -> ' (the ા will be converted later)
  modifiedText = modifiedText.replace(/જી/g, "'");        // જી -> ' (for patterns like શ્રીજી)
  
  // Semicolon replacement
  modifiedText = modifiedText.replace(/;/g, "ñ");
  
  // Handle conjuncts with ક્ષ and ત્ર
  modifiedText = modifiedText.replace(/ત્ર્/g, "X");
  modifiedText = modifiedText.replace(/ક્ષ્/g, "x");
  modifiedText = modifiedText.replace(/શ્ર્ન/g, "—");
  modifiedText = modifiedText.replace(/શ્ર્/g, "W");
  
  // Reph (ર્) handling - mark for later positioning
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
    // Half-Consonants (Must come before full consonants)
    ["ક્", "k"], ["ખ્", "K"], ["ગ્", "g"], ["ઘ્", "G"], ["ચ્", "c"],
    ["જ્", "j"], ["ણ્", "N"], ["ત્", "t"], ["થ્", "T"], ["ધ્", "D"],
    ["ન્", "n"], ["પ્", "p"], ["બ્", "b"], ["ભ્", "B"], ["મ્", "m"],
    ["ય્", "y"], ["લ્", "l"], ["વ્", "v"], ["શ્", "S"], ["સ્", "s"],
    ["ષ્", "w"], ["હ્", "h"], ["ળ્", "L"],
    
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
    ["?", "¬"], ["ઁ", "û"],
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
  
  // ============ PRE-PROCESSING: Handle special Sulekh combinations BEFORE main conversion ============
  
  // Handle special multi-character sequences first (order matters!)
  modifiedText = modifiedText.replace(/ñ/g, ";");           // Sulekh semicolon
  modifiedText = modifiedText.replace(/#Íë/g, "રૂપે");      // #પે -> રૂપે  
  modifiedText = modifiedText.replace(/#/g, "રૂ");          // # -> રૂ (standalone)
  modifiedText = modifiedText.replace(/kÒâïÒ/g, "ક્યાંય"); // kયાંય
  modifiedText = modifiedText.replace(/tÒâïÉä/g, "ત્યાંથી"); // tયાંથી
  modifiedText = modifiedText.replace(/ãÌüÕ»âÓ/g, "નિર્વિકાર"); // નિર્વિકાર complete word
  modifiedText = modifiedText.replace(/ü/g, "ર્વ");         // ü -> ર્વ (fallback)
  modifiedText = modifiedText.replace(/Ε/g, "થ");           // Greek Epsilon -> થ
  
  // Reverse ligatures (Sulekh -> Unicode) - Order matters!
  modifiedText = modifiedText.replace(/Ã÷ç/g, "ટ્રુ");
  modifiedText = modifiedText.replace(/Ã÷è/g, "ટ્રૂ");
  modifiedText = modifiedText.replace(/Ã÷/g, "ટ્ર");
  modifiedText = modifiedText.replace(/Å÷ç/g, "ડ્રુ");
  modifiedText = modifiedText.replace(/Å÷è/g, "ડ્રૂ");
  modifiedText = modifiedText.replace(/Å÷/g, "ડ્ર");
  modifiedText = modifiedText.replace(/`ç/g, "જ્રુ");
  modifiedText = modifiedText.replace(/`è/g, "જ્રૂ");
  modifiedText = modifiedText.replace(/`/g, "જ્ર");
  modifiedText = modifiedText.replace(/Öý/g, "સ્ર");
  modifiedText = modifiedText.replace(/d/g, "દ્રુ");
  modifiedText = modifiedText.replace(/¨/g, "દ્ર");
  modifiedText = modifiedText.replace(/®/g, "ક્ર");
  modifiedText = modifiedText.replace(/</g, "ફ્ર");
  modifiedText = modifiedText.replace(/¡/g, "હ્ર");
  modifiedText = modifiedText.replace(/sÝ/g, "સ્ત્ર");
  modifiedText = modifiedText.replace(/¤/g, "હ્લ");
  modifiedText = modifiedText.replace(/œ/g, "શ્ર્વ");
  modifiedText = modifiedText.replace(/~/g, "જ્જ");
  modifiedText = modifiedText.replace(/kÌ/g, "ક્ન");
  modifiedText = modifiedText.replace(/q/g, "ટ્ટ");
  modifiedText = modifiedText.replace(/V/g, "ટ્ઠ");
  modifiedText = modifiedText.replace(/f/g, "ડ્ડ");
  modifiedText = modifiedText.replace(/tÌ/g, "ત્ન");
  modifiedText = modifiedText.replace(/F/g, "ઢ્ઢ");
  modifiedText = modifiedText.replace(/²/g, "ડ્ઢ");
  modifiedText = modifiedText.replace(/\[/g, "હ્ય");
  modifiedText = modifiedText.replace(/SÌ/g, "શ્ન");
  modifiedText = modifiedText.replace(/ÚzÇ/g, "હ્ણ");
  modifiedText = modifiedText.replace(/¢/g, "હ્મ");
  modifiedText = modifiedText.replace(/{/g, "હ્ન");
  modifiedText = modifiedText.replace(/H/g, "હ્વ");
  modifiedText = modifiedText.replace(/Êz¾/g, "દ્ઘ");
  modifiedText = modifiedText.replace(/©/g, "દ્બ");
  modifiedText = modifiedText.replace(/ÊzÐ/g, "દ્ભ");
  modifiedText = modifiedText.replace(/M/g, "દ્મ");
  modifiedText = modifiedText.replace(/]/g, "દ્વ");
  modifiedText = modifiedText.replace(/Êz½/g, "દ્ગ");
  modifiedText = modifiedText.replace(/}/g, "દ્ધ");
  modifiedText = modifiedText.replace(/ƒ/g, "ન્ન");
  modifiedText = modifiedText.replace(/pÈ/g, "પ્ત");
  modifiedText = modifiedText.replace(/Í‚/g, "પ્ન");
  modifiedText = modifiedText.replace(/\^â/g, "ત્ત");
  modifiedText = modifiedText.replace(/\^/g, "ત્ત્");
  modifiedText = modifiedText.replace(/wÃ/g, "ષ્ટ");
  modifiedText = modifiedText.replace(/wÄ/g, "ષ્ઠ");
  modifiedText = modifiedText.replace(/@/g, "શ્ચ");
  modifiedText = modifiedText.replace(/§/g, "દ્દ");
  modifiedText = modifiedText.replace(/_/g, "હૃ");
  modifiedText = modifiedText.replace(/>/g, "ક્ક");
  modifiedText = modifiedText.replace(/¬/g, "?");
  modifiedText = modifiedText.replace(/û/g, "ઁ");
  
  // Reverse half-consonants (Sulekh -> Unicode)
  modifiedText = modifiedText.replace(/k/g, "ક્");
  modifiedText = modifiedText.replace(/K/g, "ખ્");
  modifiedText = modifiedText.replace(/g/g, "ગ્");
  modifiedText = modifiedText.replace(/G/g, "ઘ્");
  modifiedText = modifiedText.replace(/c/g, "ચ્"); 
  modifiedText = modifiedText.replace(/j/g, "જ્");
  modifiedText = modifiedText.replace(/N/g, "ણ્");
  modifiedText = modifiedText.replace(/t/g, "ત્");
  modifiedText = modifiedText.replace(/T/g, "થ્");
  modifiedText = modifiedText.replace(/D/g, "ધ્"); 
  modifiedText = modifiedText.replace(/n/g, "ન્");
  modifiedText = modifiedText.replace(/p/g, "પ્");
  modifiedText = modifiedText.replace(/b/g, "બ્");
  modifiedText = modifiedText.replace(/B/g, "ભ્");
  modifiedText = modifiedText.replace(/m/g, "મ્");
  modifiedText = modifiedText.replace(/y/g, "ય્");
  modifiedText = modifiedText.replace(/l/g, "લ્");
  modifiedText = modifiedText.replace(/v/g, "વ્");
  modifiedText = modifiedText.replace(/S/g, "શ્"); 
  modifiedText = modifiedText.replace(/s/g, "સ્");
  modifiedText = modifiedText.replace(/w/g, "ષ્"); 
  modifiedText = modifiedText.replace(/h/g, "હ્");
  modifiedText = modifiedText.replace(/L/g, "ળ્");
  
  // Handle apostrophe and quote patterns carefully (ORDER MATTERS!)
  // 1. First handle complete multi-char patterns
  modifiedText = modifiedText.replace(/\"ÞâÌ'/g, "'જ્ઞાન'");   // "જ્ઞાન' -> 'જ્ઞાન' (full pattern)
  modifiedText = modifiedText.replace(/ÑÓ'Ñâï/g, "મરજીમાં"); // મર'માં -> મરજીમાં (Sulekh pattern)
  modifiedText = modifiedText.replace(/'Ò Àë/g, "જાય છે");    // 'ય છે -> જાય છે
  modifiedText = modifiedText.replace(/'Ò/g, "જા");           // 'ય -> જા (fallback)
  // 2. Then handle remaining quotes/apostrophes
  modifiedText = modifiedText.replace(/\"/g, "'");            // " -> ' (any remaining opening quotes)
  modifiedText = modifiedText.replace(/'/g, "જી");            // ' -> જી (any remaining apostrophes)
  
  // Handle rï pattern for રું
  modifiedText = modifiedText.replace(/rï/g, "રું");        // rં -> રું (for તારું)
  
  // Handle corrupted combinations
  modifiedText = modifiedText.replace(/ã×/g, "શિ");
  modifiedText = modifiedText.replace(/Ø/g, "ષ");
  modifiedText = modifiedText.replace(/z:/g, "્ઞ");
  
  // ============ MAIN CONVERSION: Character-by-character mapping ============
  
  const conversionMap = [
    // Special conjuncts (must come first)
    ["Ü", "ક્ષ"], ["Ý", "ત્ર"], ["Þ", "જ્ઞ"], ["Q", "ઠ્ઠ"],
    
    // Vowels
    ["A", "ૐ"],
    ["áí", "ઓ"], ["áî", "ઔ"], ["áë", "એ"], ["á&", "ઍ"],
    ["áì", "ઐ"], ["áâ&", "ઑ"], ["áâ", "આ"], ["á", "અ"],
    ["å", "ઇ"], ["æ", "ઈ"], ["é", "ઉ"], ["ê", "ઊ"], ["°", "ઋ"],
    ["š", "ઈં"], ["™", "ઇં"], ["ø", "ઉં"], ["ù", "ઊં"],
    
    // Consonants
    ["»", "ક"], ["¼", "ખ"], ["½", "ગ"], ["¾", "ઘ"], ["a", "ઙ"],
    ["¿", "ચ"], ["À", "છ"], ["Á", "જ"], ["Â", "ઝ"],
    ["Ã", "ટ"], ["Ä", "ઠ"], ["Å", "ડ"], ["Æ", "ઢ"], ["Ç", "ણ"],
    ["È", "ત"], ["É", "થ"], ["Ê", "દ"], ["Ë", "ધ"], ["Ì", "ન"],
    ["Í", "પ"], ["Î", "ફ"], ["Ï", "બ"], ["Ð", "ભ"], ["Ñ", "મ"],
    ["Ò", "ય"], ["Ó", "ર"], ["Ô", "લ"], ["Õ", "વ"],
    ["×", "શ"], ["Ö", "સ"], ["Ú", "હ"], ["Û", "ળ"],
    
    // Matras (vowel signs)
    ["â", "ા"], ["ä", "ી"], ["ç", "ુ"], ["è", "ૂ"], ["ö", "ૃ"],
    ["ë", "ે"], ["ì", "ૈ"], ["í", "ો"], ["î", "ૌ"],
    ["ï", "ં"], ["ð", "ઃ"],
    
    // Halant and punctuation
    ["z", "્"], ["ó", "।"],
    
    // Numbers
    ["0", "૦"], ["1", "૧"], ["2", "૨"], ["3", "૩"], ["4", "૪"],
    ["5", "૫"], ["6", "૬"], ["7", "૭"], ["8", "૮"], ["9", "૯"]
  ];
  
  // Apply conversion mapping
  for (const [sulekh, unicode] of conversionMap) {
    modifiedText = modifiedText.split(sulekh).join(unicode);
  }

  // ============ POST-PROCESSING: Fix positioning and remaining patterns ============
  
  // Fix remaining Latin characters that might appear
  modifiedText = modifiedText.replace(/k/g, "ક્");
  modifiedText = modifiedText.replace(/t/g, "ત્");
  modifiedText = modifiedText.replace(/r/g, "ર");
  
  // Handle ý for ્ર conjunct
  modifiedText = modifiedText.replace(/ý/g, "્ર");
  
  // Fix i-matra positioning (ã and i should come before consonant in display but after in Unicode)
  modifiedText = modifiedText.replace(/([ãi])([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$1");
  modifiedText = modifiedText.replace(/([ãi])(્)([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])/g, "$2$3$1");
  modifiedText = modifiedText.replace(/ã/g, "િ");
  modifiedText = modifiedText.replace(/i/g, "િં");
  
  // Reph (ô) positioning - move before the consonant cluster
  modifiedText = modifiedText.replace(/þ/g, "ર્ી");
  modifiedText = modifiedText.replace(/õ/g, "ર્ં");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([ાિીુૂૃેૈોૌંઁ]*)([ô])/g, "ર્$1$2");
  modifiedText = modifiedText.replace(/([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહળ])([્])([ô])/g, "ર્$1$2");
  modifiedText = modifiedText.replace(/ô/g, "ર્");
  
  // Clean up duplicate matras
  modifiedText = modifiedText.replace(/([ંઁ])([ાિીુૂૃેૈોૌ])/g, "$2$1");
  modifiedText = modifiedText.replace(/([ાિીુૂૃેૈોૌ])([ાિીુૂૃેૈોૌ])/g, "$1");
  
  // Clean up maatras
  modifiedText = modifiedText.replace(/([ંઁ॰])([ાિીુૂૃેૈોૌ])/g, "$2$1");
  modifiedText = modifiedText.replace(/([ાિીુૂૃેૈોૌઁ])([ાિીુૂૃેૈોૌઁ])/g, "$1");
  // ============ FINAL CLEANUP: Fix remaining patterns after conversion ============
  // These patterns are applied on the converted Unicode text
  // Use placeholder for intentional quotes to prevent removal later
  const QUOTE_PLACEHOLDER = '\uFFFE'; // Using a rarely-used Unicode character as placeholder
  modifiedText = modifiedText.replace(/જીજ્ઞાનજી/g, QUOTE_PLACEHOLDER + "જ્ઞાન" + QUOTE_PLACEHOLDER);   // Fix 'જ્ઞાન' pattern with placeholder
  modifiedText = modifiedText.replace(/'ય છે/g, "જાય છે");        // 'ય છે -> જાય છે
  modifiedText = modifiedText.replace(/'ય /g, "જાય ");            // 'ય -> જાય (space after)
  modifiedText = modifiedText.replace(/મર'માં/g, "મરજીમાં");      // મર'માં -> મરજીમાં
  // Handle different quote types
  modifiedText = modifiedText.replace(/(['\u2018\u2019\u0027])ય છે/g, "જાય છે"); // Various quote types
  modifiedText = modifiedText.replace(/(['\u2018\u2019\u0027])ય /g, "જાય ");
  modifiedText = modifiedText.replace(/મર(['\u2018\u2019\u0027])માં/g, "મરજીમાં");
  modifiedText = modifiedText.replace(/[''\u2018\u2019]/g, "");    // Remove any remaining apostrophes/quotes
  
  // Restore placeholder to actual quotes
  modifiedText = modifiedText.split(QUOTE_PLACEHOLDER).join("'");
  
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
