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
 * Update kirtan details in Supabase
 * @param {number} id - Kirtan ID
 * @param {Object} data - Data to update
 * @param {string} adminSecret - Admin secret for authorization
 * @returns {Promise<Object>} Updated kirtan data
 */
export const updateKirtan = async (id, data, adminSecret = "") => {
    try {
        const response = await fetch(SUPABASE_CONFIG.updateFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                'apikey': SUPABASE_CONFIG.anonKey,
                // 'x-admin-secret': adminSecret
            },
            body: JSON.stringify({ 
                id: id,
                data: apiMapFromApp(data) 
            })
        });

        console.log("Updating the Kirtan");

        const text = await response.text();
        console.log("Raw Update Response:", text);

        let result = {};
        try {
            result = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn("Could not parse response as JSON:", e);
        }

        if (!response.ok) {
            throw new Error(result.error || `Update failed: ${response.status} ${response.statusText} - ${text}`);
        }

        return result;
    } catch (error) {
        console.error('Error updating kirtan:', error);
        throw error;
    }
};

/**
 * Search kirtans via Supabase Edge Function
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of matching kirtans
 */
export const searchKirtans = async (query) => {
    try {
        const response = await fetch(SUPABASE_CONFIG.searchFunctionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // specific headers for the edge function if needed, usually just Content-Type is enough unless CORS issues arise locally
                 "Access-Control-Allow-Origin": "*",
                 "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            },
            body: JSON.stringify({ english_title: query }),
        });

        if (!response.ok) {
            throw new Error(`Supabase API error: ${response.statusText}`);
        }

        const data = await response.json();
        const results = Array.isArray(data) ? data : data.kirtans || [];
        
        return results.map(mapSingleKirtan);
    } catch (error) {
        console.error('Error searching kirtans:', error);
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
 * Map App format to API format for updates
 */
const apiMapFromApp = (appData) => {
    // Determine title to skip auto-generation if needed, but update function typically expects explicit fields
    return {
        english_title: appData.englishTitle,
        unicode_title: appData.unicodeTitle,
        gujarati_unicode_title: appData.unicodeTitle, // Sync both for safety
        hindi_unicode_title: appData.hindiTitle,
        
        english_kirtan_text: appData.englishContent,
        unicode_kirtan_text: appData.unicodeContent,
        gujarati_unicode_kirtan_text: appData.unicodeContent,
        hindi_unicode_kirtan_text: appData.hindiContent,
        sulekh_kirtan_text: appData.sulekhContent,

        creator: appData.creator,
        book_name_original: appData.bookName,
        taal_prakar_id: appData.taalPrakarId,
        pad: appData.pad,
        
        event: appData.event,
        place: appData.place,
        kirtan_type: appData.kirtanType,
        adjective: appData.adjective,
        name: appData.name,
        prakashan: appData.prakashan,
        taste: appData.taste,
        origin: appData.origin,
        bhav: appData.bhav,
        singer: appData.singer,
        raag: appData.raagName || appData.raag,
        publisher: appData.publisher,
        vocalization: appData.vocalization,
        singer_mood: appData.singerMood,
        singer_details: appData.singerDetails,
        dhal: appData.dhal,
        taal_prakar: appData.taalPrakar,
        taal_from_id: appData.taalFromId,
        recording_quality: appData.recordingQuality,
        album: appData.album,
        vadha: appData.vadha,
        
        // Add other mapped fields as necessary based on schema
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
        creator: item.creator || item.creator_original,
        bookName: item.book_name_original,
        englishBookName: item.english_book_name,
        gujaratiBookName: item.gujarati_book_name,
        hindiBookName: item.hindi_book_name,
        taalPrakarId: item.taal_prakar_id,
        categoryArray: item.category_array,
        categoryIds: item.category_ids,

        // Extended Metadata (synced with KirtanSearch needs)
        event: item.event,
        place: item.place,
        kirtanType: item.kirtan_type,
        adjective: item.adjective,
        name: item.name,
        prakashan: item.prakashan,
        taste: item.taste,
        origin: item.origin,
        bhav: item.bhav,
        singer: item.singer,
        raag: item.raag,
        publisher: item.publisher,
        vocalization: item.vocalization,
        singerMood: item.singer_mood,
        singerDetails: item.singer_details,
        dhal: item.dhal,
        taalPrakar: item.taal_prakar,
        taalFromId: item.taal_from_id,
        recordingQuality: item.recording_quality,
        album: item.album,
        vadha: item.vadha,

        createdAt: item.created_at
    };
};
