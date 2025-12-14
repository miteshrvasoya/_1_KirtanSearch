import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { master_json_data } from "../src/utils/master_data.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1️⃣ Load JSON
const jsonPath = "/media/mitesh-vasoya/Spiritual/Seva/_Kirtan_Fetcher/kirtan_output_final.json";

// Helper to resolve paths
const possiblePaths = [
    jsonPath,
    path.join(__dirname, "../kirtan_output_final.json"), // website/kirtan_output_final.json
    path.join(__dirname, "../../kirtan_output_final.json"), // root/kirtan_output_final.json
    path.join(__dirname, "kirtan_output_final.json") // backend/kirtan_output_final.json
];

let finalJsonPath = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        finalJsonPath = p;
        break;
    }
}

if (!finalJsonPath) {
    console.error(`\n❌ Error: 'kirtan_output_final.json' not found.`);
    console.error(`Checked locations:`);
    possiblePaths.forEach(p => console.error(` - ${p}`));
    console.error(`\nPlease place the file in the 'website' or project root directory.\n`);
    process.exit(1);
}

console.log(`Loading data from: ${finalJsonPath}`);
const jsonData = JSON.parse(fs.readFileSync(finalJsonPath, "utf8"));

// 2️⃣ Supabase Client
const supabase = createClient(
    "http://127.0.0.1:54321",
    "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
);

// Map English names from master_data to database columns
const categoryMapping = {
    "creator": "creator",
    "event": "event",
    "place": "place",
    "kirtan type": "kirtan_type",
    // "adjective": "adjective",
    "name": "name",
    "prakashan": "prakashan",
    "taste": "taste",
    "prabhatia for haresh dan": "prabhatia_for_haresh_dan",
    "origin": "origin",
    "book": "book",
    "bhav": "bhav",
    "singer": "singer",
    "raag": "raag",
    "publisher": "publisher",
    "vocalization": "vocalization",
    "singer mood": "singer_mood",
    "singer details": "singer_details",
    "gaan type": "dhal",        // Mapped to 'dhal' column
    "taal type": "taal_prakar", // Mapped to 'taal_prakar' column
    "recording quality": "recording_quality",
    "album": "album",
    "vadha": "vadha"
};

// Helper: Find Taal Name by ID from Master Data (Group ID 22)
function getTaalNameById(id) {
    if (!id) return null;
    const taalGroup = master_json_data.find(g => g.id === 22); // Taal Type Group
    if (!taalGroup) return null;
    const taal = taalGroup.value.find(t => t.id === id);
    return taal ? taal.name : null;
}

async function importData() {
    try {
        console.log(`Total records to process: ${jsonData.length}`);

        let chunkSize = 50;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < jsonData.length; i += chunkSize) {
            const chunk = jsonData.slice(i, i + chunkSize);

            const mappedChunk = chunk.map(item => {
                // Extract metadata
                const categoryArray = item.category_array || [];
                const categoryIds = categoryArray.map(c => c.id);

                // Helper to find name from category array based on master data group
                const findNameByGroup = (groupEnName) => {
                    const group = master_json_data.find(g => g.en_name === groupEnName);
                    if (!group) return null;
                    // Find a category in the item's array that exists in this master group's values
                    const match = categoryArray.find(c => group.value.some(v => v.id === c.id));
                    return match ? match.name : null;
                };

                // Build the object with ALL original keys + Enriched Data
                const kirtanData = {
                    // Original Keys
                    pad_id: item.pad_id,
                    pad: item.pad,
                    parent_pad_id: item.parent_pad_id,
                    total_pad: item.total_pad,

                    english_title: item.english_title,
                    unicode_title: item.unicode_title,
                    gujarati_unicode_title: item.gujarati_unicode_title,
                    hindi_unicode_title: item.hindi_unicode_title,

                    english_kirtan_text: item.english_kirtan_text,
                    unicode_kirtan_text: item.unicode_kirtan_text,
                    gujarati_unicode_kirtan_text: item.gujarati_unicode_kirtan_text,
                    hindi_unicode_kirtan_text: item.hindi_unicode_kirtan_text,
                    sulekh_kirtan_text: item.sulekh_kirtan_text,

                    gujarati_unicode_char: item.gujarati_unicode_char,

                    creator_original: item.creator,
                    book_name_original: item.book_name,
                    english_book_name: item.english_book_name,
                    gujarati_book_name: item.gujarati_book_name,
                    hindi_book_name: item.hindi_book_name,
                    taal_prakar_id: item.taal_prakar,

                    category_array: item.category_array,
                    category_ids: categoryIds,

                    // Enriched Data (Lookups)
                    taal_from_id: getTaalNameById(item.taal_prakar)
                };

                // Populate category columns from Master Data
                for (const [enName, dbColumn] of Object.entries(categoryMapping)) {
                    const value = findNameByGroup(enName);
                    if (value) {
                        kirtanData[dbColumn] = value;
                    }
                }

                // Fallbacks
                if (!kirtanData.creator && item.creator) kirtanData.creator = item.creator;
                if (!kirtanData.book && item.book_name) kirtanData.book = item.book_name;

                return kirtanData;
            });

            console.log(`Inserting chunk ${i / chunkSize + 1} (${mappedChunk.length} items)...`);

            const { data, error } = await supabase
                .from("kirtans")
                .upsert(mappedChunk, { onConflict: 'pad_id', ignoreDuplicates: false })
                .select('id');

            if (error) {
                console.error("❌ Error inserting chunk:", error);
                errorCount += mappedChunk.length;
            } else {
                console.log(`✔ Inserted/Updated ${data.length} records`);
                successCount += data.length;
            }

            // Avoid rate limit issues
            await new Promise((r) => setTimeout(r, 200));
        }

        console.log("🎉 Import completed.");
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

importData();
