// IndexedDB utility for Kirtan database
import { enhancedSulekhToUnicode, enhancedSulekhToGujlish, gujUnicodeToHindi } from './enhancedConverter';
const DB_NAME = 'KirtanDatabase';
const DB_VERSION = 2;
const STORE_NAME = 'kirtans';
const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined';
const htmlDecoder = canUseDOM ? document.createElement('div') : null;

const cleanMultilineText = (text = '') => {
  return text
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
};

const htmlToPlainText = (html) => {
  if (!html || typeof html !== 'string') return '';
  const normalizedHtml = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n');

  if (htmlDecoder) {
    htmlDecoder.innerHTML = normalizedHtml;
    const text = (htmlDecoder.textContent || '').replace(/\u00a0/g, ' ');
    htmlDecoder.innerHTML = '';
    return cleanMultilineText(text);
  }

  return cleanMultilineText(
    normalizedHtml
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
  );
};

const getFirstLine = (text = '') => {
  return text
    .split('\n')
    .map(line => line.trim())
    .find(line => line.length > 0) || '';
};

const isExternalKirtanFormat = (entry) => {
  return Boolean(
    entry &&
    typeof entry === 'object' &&
    (
      'english_title' in entry ||
      'unicode_kirtan_text' in entry ||
      'sulekh_kirtan_text' in entry
    )
  );
};

const looksLikeAppKirtan = (entry) => {
  return Boolean(
    entry &&
    typeof entry === 'object' &&
    (
      'sulekhContent' in entry ||
      'unicodeContent' in entry ||
      'sulekhTitle' in entry ||
      'unicodeTitle' in entry
    )
  );
};

const normalizeExternalKirtan = (entry) => {
  if (!entry || typeof entry !== 'object') return null;

  const unicodeContent = htmlToPlainText(entry.unicode_kirtan_text);
  const englishContent = htmlToPlainText(entry.english_kirtan_text);
  const sulekhContent = htmlToPlainText(entry.sulekh_kirtan_text) || unicodeContent;
  const gujaratiUnicodeContent = htmlToPlainText(entry.gujarati_unicode_kirtan_text);
  const hindiUnicodeContent = htmlToPlainText(entry.hindi_unicode_kirtan_text);

  const unicodeTitle =
    (entry.unicode_title || entry.gujarati_unicode_title || getFirstLine(unicodeContent) || '').trim();
  const englishTitle =
    (entry.english_title || getFirstLine(englishContent) || '').trim();
  const sulekhTitle =
    (getFirstLine(sulekhContent) || unicodeTitle || englishTitle).trim();

  const categories = Array.isArray(entry.category_array) ? entry.category_array : [];

  return {
    sulekhTitle,
    unicodeTitle,
    englishTitle,
    gujaratiTitle: (entry.gujarati_unicode_title || '').trim(),
    hindiTitle: (entry.hindi_unicode_title || '').trim(),
    gujaratiUnicodeChar: entry.gujarati_unicode_char || '',
    bookName: (entry.book_name || '').trim(),
    englishBookName: (entry.english_book_name || '').trim(),
    padId: entry.pad_id ?? '',
    pad: entry.pad ?? '',
    parentPadId: entry.parent_pad_id ?? '',
    taalPrakar: entry.taal_prakar ?? '',
    creator: entry.creator || '',
    totalPad: entry.total_pad ?? '',
    categories,
    categoryNames: categories.map(cat => cat?.name).filter(Boolean),
    source: 'external-json',
    sulekhContent,
    unicodeContent,
    englishContent,
    gujaratiUnicodeContent,
    hindiUnicodeContent
  };
};

const normalizeImportPayload = (payload) => {
  if (!payload) return [];

  const dataArray = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.kirtans)
      ? payload.kirtans
      : Array.isArray(payload.data)
        ? payload.data
        : [];

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    if (isExternalKirtanFormat(payload)) {
      const normalized = normalizeExternalKirtan(payload);
      return normalized ? [normalized] : [];
    }
    if (looksLikeAppKirtan(payload)) {
      return [payload];
    }
    return [];
  }

  return dataArray
    .map(item => {
      if (isExternalKirtanFormat(item)) {
        return normalizeExternalKirtan(item);
      }
      if (looksLikeAppKirtan(item)) {
        return item;
      }
      return null;
    })
    .filter(Boolean);
};

class KirtanDatabase {
  constructor() {
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      // Ensure we are in a browser environment with IndexedDB support
      if (!canUseDOM || typeof indexedDB === 'undefined') {
        console.error('IndexedDB is not supported in this environment');
        reject(new Error('IndexedDB not supported'));
        return;
      }

      let request;
      try {
        request = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (err) {
        console.error('Error while opening IndexedDB:', err);
        reject(new Error('Failed to open database'));
        return;
      }

      request.onerror = (event) => {
        const error = event && event.target && event.target.error;
        console.error('IndexedDB open error:', error);
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Create indexes for searching
          objectStore.createIndex('sulekhTitle', 'sulekhTitle', { unique: false });
          objectStore.createIndex('unicodeTitle', 'unicodeTitle', { unique: false });
          objectStore.createIndex('englishTitle', 'englishTitle', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  // Add a new kirtan
  async addKirtan(kirtan) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const baseSulekhContent = kirtan.sulekhContent || '';
      const unicodeContent = kirtan.unicodeContent || enhancedSulekhToUnicode(baseSulekhContent);
      const englishContent = kirtan.englishContent || enhancedSulekhToGujlish(baseSulekhContent);
      const hindiContent = kirtan.hindiContent || gujUnicodeToHindi(unicodeContent);

      const kirtanData = {
        ...kirtan,
        unicodeContent,
        englishContent,
        hindiContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = store.add(kirtanData);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to add kirtan'));
      };
    });
  }

  // Update an existing kirtan
  async updateKirtan(id, kirtan) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const baseSulekhContent = kirtan.sulekhContent || '';
      const unicodeContent = kirtan.unicodeContent || enhancedSulekhToUnicode(baseSulekhContent);
      const englishContent = kirtan.englishContent || enhancedSulekhToGujlish(baseSulekhContent);
      const hindiContent = kirtan.hindiContent || gujUnicodeToHindi(unicodeContent);

      const kirtanData = {
        ...kirtan,
        unicodeContent,
        englishContent,
        hindiContent,
        id,
        updatedAt: new Date().toISOString()
      };

      const request = store.put(kirtanData);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to update kirtan'));
      };
    });
  }

  // Delete a kirtan
  async deleteKirtan(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete kirtan'));
      };
    });
  }

  // Get a single kirtan by ID
  async getKirtan(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get kirtan'));
      };
    });
  }

  // Get all kirtans
  async getAllKirtans() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get kirtans'));
      };
    });
  }

  // Search kirtans
  async searchKirtans(query) {
    if (!query || query.trim() === '') {
      return this.getAllKirtans();
    }

    const allKirtans = await this.getAllKirtans();
    const searchTerm = query.toLowerCase();

    // Search in all fields
    return allKirtans.filter(kirtan => {
      return (
        (kirtan.sulekhTitle && kirtan.sulekhTitle.toLowerCase().includes(searchTerm)) ||
        (kirtan.unicodeTitle && kirtan.unicodeTitle.toLowerCase().includes(searchTerm)) ||
        (kirtan.englishTitle && kirtan.englishTitle.toLowerCase().includes(searchTerm)) ||
        (kirtan.sulekhContent && kirtan.sulekhContent.toLowerCase().includes(searchTerm)) ||
        (kirtan.unicodeContent && kirtan.unicodeContent.toLowerCase().includes(searchTerm)) ||
        (kirtan.englishContent && kirtan.englishContent.toLowerCase().includes(searchTerm))
      );
    });
  }

  // Get related pads (parent and siblings, or children)
  async getRelatedPads(kirtanId) {
    if (!this.db) await this.init();

    try {
      const currentKirtan = await this.getKirtan(kirtanId);
      if (!currentKirtan) return [];

      const allKirtans = await this.getAllKirtans();
      const relatedPads = [];

      // If current kirtan has a parent (it's a child pad)
      if (currentKirtan.parentPadId) {
        // Find parent
        const parent = allKirtans.find(k => k.id === currentKirtan.parentPadId);
        if (parent) {
          relatedPads.push(parent);
        }

        // Find all siblings (other children of the same parent)
        const siblings = allKirtans.filter(k =>
          k.parentPadId === currentKirtan.parentPadId && k.id !== kirtanId
        );
        relatedPads.push(...siblings);
      } else {
        // Current kirtan is a parent, find all children
        const children = allKirtans.filter(k => k.parentPadId === kirtanId);
        relatedPads.push(...children);
      }

      // Sort by pad number if available
      return relatedPads.sort((a, b) => {
        const padA = parseInt(a.pad) || 0;
        const padB = parseInt(b.pad) || 0;
        return padA - padB;
      });
    } catch (error) {
      console.error('Error fetching related pads:', error);
      return [];
    }
  }


  // Export database to JSON
  async exportToJSON() {
    const kirtans = await this.getAllKirtans();
    return JSON.stringify(kirtans, null, 2);
  }

  // Import database from JSON
  async importFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const kirtans = normalizeImportPayload(parsed);

      if (!Array.isArray(kirtans) || kirtans.length === 0) {
        throw new Error('No kirtans found in JSON');
      }

      // Clear existing data
      await this.clearDatabase();

      // Add all kirtans
      for (const kirtan of kirtans) {
        const { id, ...kirtanData } = kirtan;
        await this.addKirtan(kirtanData);
      }

      return kirtans.length;
    } catch (error) {
      throw new Error('Failed to import JSON: ' + error.message);
    }
  }

  // Clear all data
  async clearDatabase() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear database'));
      };
    });
  }
}

// Create singleton instance
const kirtanDB = new KirtanDatabase();

export default kirtanDB;