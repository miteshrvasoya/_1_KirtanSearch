-- Create the kirtans table with ALL original JSON keys + Master Data Enriched Columns
CREATE TABLE IF NOT EXISTS kirtans (
    id SERIAL PRIMARY KEY,
    
    -- Original JSON Keys (Preserved as is)
    pad_id INTEGER UNIQUE NOT NULL,
    pad INTEGER,
    parent_pad_id INTEGER,
    total_pad INTEGER,
    
    english_title TEXT,
    unicode_title TEXT,
    gujarati_unicode_title TEXT,
    hindi_unicode_title TEXT,
    
    english_kirtan_text TEXT,
    unicode_kirtan_text TEXT,
    gujarati_unicode_kirtan_text TEXT,
    hindi_unicode_kirtan_text TEXT,
    sulekh_kirtan_text TEXT,
    
    gujarati_unicode_char TEXT,
    
    -- Original JSON Metadata (Strings/IDs)
    creator_original TEXT, -- 'creator' in JSON
    book_name_original TEXT, -- 'book_name' in JSON
    english_book_name TEXT,
    gujarati_book_name TEXT,
    hindi_book_name TEXT,
    taal_prakar_id INTEGER, -- 'taal_prakar' in JSON (ID)
    
    category_array JSONB, -- Store full category array object
    category_ids INTEGER[], -- Extracted IDs
    
    -- Master Data Enriched Columns (Names)
    creator TEXT,
    event TEXT,
    place TEXT,
    kirtan_type TEXT,
    adjective TEXT,
    name TEXT,
    prakashan TEXT,
    taste TEXT,
    prabhatia_for_haresh_dan TEXT,
    origin TEXT,
    book TEXT,
    bhav TEXT,
    singer TEXT,
    raag TEXT,
    publisher TEXT,
    vocalization TEXT,
    singer_mood TEXT,
    singer_details TEXT,
    dhal TEXT,        -- Gaan Type
    taal_prakar TEXT, -- Taal Type (Mapped from Category Array)
    taal_from_id TEXT, -- Taal Name looked up from taal_prakar_id
    recording_quality TEXT,
    album TEXT,
    vadha TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kirtans_english_title ON kirtans(english_title);
CREATE INDEX IF NOT EXISTS idx_kirtans_unicode_title ON kirtans(unicode_title);
CREATE INDEX IF NOT EXISTS idx_kirtans_creator ON kirtans(creator);
CREATE INDEX IF NOT EXISTS idx_kirtans_book ON kirtans(book);
CREATE INDEX IF NOT EXISTS idx_kirtans_taal_prakar ON kirtans(taal_prakar);
CREATE INDEX IF NOT EXISTS idx_kirtans_dhal ON kirtans(dhal);
