import FlexSearch from 'flexsearch';

class SearchIndex {
    constructor() {
        this.index = null;
        this.isInitialized = false;
    }

    init(kirtans) {
        // Create a document index
        // We use 'document' to store and search multiple fields
        this.index = new FlexSearch.Document({
            document: {
                id: 'id',
                index: [
                    'sulekhTitle',
                    'unicodeTitle',
                    'englishTitle',
                    'hindiTitle',
                    'sulekhContent',
                    'unicodeContent',
                    'englishContent',
                    'hindiContent'
                ],
                store: true // Store the document so we can retrieve it
            },
            tokenize: 'forward', // Good for partial matches
            charset: 'latin:advanced', // Supports advanced latin charset
            cache: true
        });

        // Add all kirtans to the index
        kirtans.forEach(kirtan => {
            this.index.add({
                id: kirtan.id,
                sulekhTitle: kirtan.sulekhTitle,
                unicodeTitle: kirtan.unicodeTitle,
                englishTitle: kirtan.englishTitle,
                hindiTitle: kirtan.hindiTitle,
                sulekhContent: kirtan.sulekhContent,
                unicodeContent: kirtan.unicodeContent,
                englishContent: kirtan.englishContent,
                hindiContent: kirtan.hindiContent,
                original: kirtan // Store the full object for easy retrieval
            });
        });

        this.isInitialized = true;
    }

    search(query, options = {}) {
        if (!this.isInitialized || !this.index) return [];

        const { fields, limit = 100 } = options;

        // Perform the search
        // FlexSearch returns results grouped by field
        const results = this.index.search(query, {
            limit,
            index: fields, // Search only in specified fields
            enrich: true   // Return the stored document
        });

        // Flatten and deduplicate results
        // Results structure: [{ field: 'title', result: [{ id: 1, doc: {...} }] }, ...]
        const uniqueKirtans = new Map();

        results.forEach(fieldResult => {
            fieldResult.result.forEach(item => {
                if (!uniqueKirtans.has(item.id)) {
                    uniqueKirtans.set(item.id, item.doc.original);
                }
            });
        });

        return Array.from(uniqueKirtans.values());
    }
}

const searchIndex = new SearchIndex();
export default searchIndex;
