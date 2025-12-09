import SUPABASE_CONFIG from '../config/supabase';

/**
 * Fetch full kirtan details including sibling kirtans
 * @param {number} kirtanId - The ID of the kirtan to fetch
 * @returns {Promise<Object>} Kirtan details with sibling kirtans
 */
export const fetchKirtanDetails = async (kirtanId) => {
    try {
        const response = await fetch(SUPABASE_CONFIG.kirtanViewFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                'apikey': SUPABASE_CONFIG.anonKey
            },
            body: JSON.stringify({ kirtan_id: kirtanId })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return mapKirtanResponse(data);
    } catch (error) {
        console.error('Error fetching kirtan details:', error);
        throw error;
    }
};

/**
 * Map API response to app format
 */
const mapKirtanResponse = (apiData) => {
    const { selected_kirtan, sibling_kirtans } = apiData;

    return {
        kirtan: mapSingleKirtan(selected_kirtan),
        siblingKirtans: (sibling_kirtans || []).map(mapSingleKirtan)
    };
};

/**
 * Map a single kirtan object from API format to app format
 */
const mapSingleKirtan = (item) => {
    if (!item) return null;

    // Helper to extract plain text from HTML
    const htmlToPlainText = (html) => {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n');
        return div.textContent || div.innerText || '';
    };

    return {
        id: item.id || item.pad_id,
        padId: item.pad_id,
        pad: item.pad,
        parentPadId: item.parent_pad_id,
        totalPad: item.total_pad,

        // Titles
        englishTitle: item.english_title,
        unicodeTitle: item.unicode_title || item.gujarati_unicode_title,
        sulekhTitle: htmlToPlainText(item.sulekh_kirtan_text)?.split('\n')[0]?.trim() || '',
        hindiTitle: item.hindi_unicode_title,

        // Content - convert HTML to plain text
        englishContent: htmlToPlainText(item.english_kirtan_text),
        unicodeContent: htmlToPlainText(item.unicode_kirtan_text || item.gujarati_unicode_kirtan_text),
        sulekhContent: htmlToPlainText(item.sulekh_kirtan_text),
        hindiContent: htmlToPlainText(item.hindi_unicode_kirtan_text),

        // Metadata
        creator: item.creator_original || item.creator,
        bookName: item.book_name_original,
        englishBookName: item.english_book_name,
        gujaratiBookName: item.gujarati_book_name,
        hindiBookName: item.hindi_book_name,
        taalPrakarId: item.taal_prakar_id,
        categoryArray: item.category_array,
        categoryIds: item.category_ids,

        createdAt: item.created_at
    };
};
