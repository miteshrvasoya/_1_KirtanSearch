import React, { useState, useEffect, useCallback } from 'react';
import kirtanDB from '../utils/database';
import searchIndex from '../utils/SearchIndex';
import { searchKirtans } from '../utils/kirtanApi';
import SUPABASE_CONFIG from '../config/supabase';
import '../styles/KirtanSearch.css';

const KirtanSearch = ({ isOpen, onClose, onSelectKirtan, onEditKirtan }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allKirtans, setAllKirtans] = useState([]);
  const [titleMatches, setTitleMatches] = useState([]);
  const [contentMatches, setContentMatches] = useState([]);
  const [selectedKirtan, setSelectedKirtan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [visibleTitleCount, setVisibleTitleCount] = useState(30);
  const [visibleContentCount, setVisibleContentCount] = useState(30);
  const ITEMS_PER_PAGE = 30;

  // Load all kirtans on mount
  useEffect(() => {
    if (isOpen) {
      loadKirtans();
    } else {
      // Reset search and selection when closed
      setSearchQuery('');
      setSelectedKirtan(null);
    }
  }, [isOpen]);

  const loadKirtans = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      console.log("Fetching from Supabase : ", searchQuery);
      // const kirtans = await fetchKirtansFromSupabase(searchQuery || '');
      let kirtans = [];
      setAllKirtans(kirtans);
      setTitleMatches(kirtans);
      // Re-initialize search index with fetched data
      if (kirtans.length > 0) {
        searchIndex.init(kirtans);
      }
    } catch (error) {
      console.error('Failed to load kirtans from Supabase:', error);
      // Fallback to local database
      try {
        const localKirtans = await kirtanDB.getAllKirtans();
        setAllKirtans(localKirtans);
        setTitleMatches(localKirtans);
      } catch (localError) {
        console.error('Failed to load kirtans from local DB:', localError);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Supabase Edge Function integration
  const fetchKirtansFromSupabase = async (query) => {
    // Uses the central API utility
    return await searchKirtans(query);
  };

  // Helper to get snippet from text based on a match in that text OR a mapped word index
  const getSnippet = (text, query, knownWordIndex = -1) => {
    if (!text) return '';

    const words = text.split(/\s+/);
    let matchWordIndex = knownWordIndex;

    // If word index not provided, find it using query
    if (matchWordIndex === -1 && query) {
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const queryWords = query.split(/\s+/);

      for (let i = 0; i < words.length; i++) {
        const slice = words.slice(i, i + queryWords.length).join(' ');
        if (slice.toLowerCase().includes(lowerQuery)) {
          matchWordIndex = i;
          break;
        }
      }

      // Fallback for partial matches if word boundary check fails
      if (matchWordIndex === -1) {
        const index = lowerText.indexOf(lowerQuery);
        if (index !== -1) {
          // Estimate word index based on character position
          const preMatch = text.substring(0, index);
          matchWordIndex = preMatch.split(/\s+/).length - 1;
        }
      }
    }

    if (matchWordIndex === -1) return text.substring(0, 50) + '...'; // Fallback

    const start = Math.max(0, matchWordIndex - 3);
    const end = Math.min(words.length, matchWordIndex + (query ? query.split(/\s+/).length : 1) + 3);

    const snippet = words.slice(start, end).join(' ');
    return (start > 0 ? '...' : '') + snippet + (end < words.length ? '...' : '');
  };

  const isGujarati = (text) => {
    const gujaratiRange = /[\u0A80-\u0AFF]/;
    return gujaratiRange.test(text);
  };

  const isHindi = (text) => {
    const devanagariRange = /[\u0900-\u097F]/;
    return devanagariRange.test(text);
  };

  // Filter kirtans and find matching lines
  useEffect(() => {
    const performSearch = async () => {
      // Reset pagination when search changes
      setVisibleTitleCount(ITEMS_PER_PAGE);
      setVisibleContentCount(ITEMS_PER_PAGE);

      if (!searchQuery.trim()) {
        await loadKirtans(); // Load all kirtans if search query is empty
        setContentMatches([]); // Clear content matches when no query
        return;
      }

      setLoading(true);
      try {
        // Use the existing Supabase fetch function to get relevant kirtans
        const fetchedKirtans = await fetchKirtansFromSupabase(searchQuery);

        // Re-initialize search index with the fetched (potentially pre-filtered) data
        searchIndex.init(fetchedKirtans);

        const query = searchQuery.toLowerCase();
        const isGuj = isGujarati(query);
        const isHin = isHindi(query);

        // Define fields based on language for client-side search refinement
        let titleFields = ['sulekhTitle', 'englishTitle'];
        let contentFields = ['sulekhContent', 'englishContent'];

        if (isGuj) {
          titleFields = ['unicodeTitle'];
          contentFields = ['unicodeContent'];
        } else if (isHin) {
          titleFields = ['hindiTitle'];
          contentFields = ['hindiContent'];
        }

        // 1. Title Matches (Left Panel) - Refine using client-side search index
        const tMatches = searchIndex.search(query, { fields: titleFields });
        setTitleMatches(tMatches);

        // 2. Content Matches (Right Panel) - Refine using client-side search index
        const cResults = searchIndex.search(query, { fields: contentFields });

        const cMatches = [];
        cResults.forEach(kirtan => {
          const displayContent = isHin ? kirtan.hindiContent : kirtan.unicodeContent;
          const displayTitle = isHin ? kirtan.hindiTitle : (kirtan.unicodeTitle || kirtan.sulekhTitle);

          const displayLines = displayContent ? displayContent.split('\n') : [];

          const processContent = (content, type) => {
            if (!content) return;
            const contentLines = content.split('\n');
            contentLines.forEach((line, index) => {
              if (line.toLowerCase().includes(query)) {
                const displayLine = displayLines[index] || line;

                const words = line.split(/\s+/);
                const queryWords = query.split(/\s+/);
                let matchWordIndex = -1;
                for (let i = 0; i < words.length; i++) {
                  const slice = words.slice(i, i + queryWords.length).join(' ');
                  if (slice.toLowerCase().includes(query)) {
                    matchWordIndex = i;
                    break;
                  }
                }

                const snippet = getSnippet(displayLine, null, matchWordIndex);

                cMatches.push({
                  kirtanId: kirtan.id,
                  kirtanTitle: displayTitle,
                  snippet: snippet,
                  fullLine: displayLine,
                  lineNumber: index + 1,
                  type: isHin ? 'hindi' : 'unicode',
                  originalKirtan: kirtan,
                  isDirectMatch: (isHin && type === 'hindi') || (isGuj && type === 'unicode')
                });
              }
            });
          };

          if (isGuj) {
            processContent(kirtan.unicodeContent, 'unicode');
          } else if (isHin) {
            processContent(kirtan.hindiContent, 'hindi');
          } else {
            processContent(kirtan.sulekhContent, 'sulekh');
            processContent(kirtan.englishContent, 'english');
          }
        });

        setContentMatches(cMatches);
      } catch (error) {
        console.error('Error during search:', error);
        // Fallback to client-side search on previously loaded allKirtans if Supabase fails
        // Or handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    const debounceSearch = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search to prevent excessive API calls

    return () => clearTimeout(debounceSearch);

  }, [searchQuery]); // searchQuery is the only dependency needed

  const handleScroll = (e, setVisibleCount, currentCount, totalCount) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (currentCount < totalCount) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    }
  };

  const handleKirtanClick = (kirtan) => {
    setSelectedKirtan(kirtan);
  };

  const handleKirtanDoubleClick = (kirtan) => {
    onEditKirtan(kirtan);
  };

  const handleOpenKirtan = (kirtan) => {
    onSelectKirtan(kirtan);
    onClose();
  };

  const handleMatchClick = (match) => {
    setSelectedKirtan(match.originalKirtan);
  };

  const getFontFamily = (type) => {
    if (type === 'sulekh') {
      return "'Guj_Regular_Bold_Sulekh', sans-serif";
    }
    // Use standard font for Hindi/Unicode
    return "'Noto Sans Gujarati', 'Shruti', 'Arial', sans-serif";
  };

  const highlightMatch = (text, query, shouldHighlight) => {
    if (!text || !query || !shouldHighlight) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ?
        <mark key={index}>{part}</mark> : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="kirtan-search-modal" onClick={onClose}>
      <div className="kirtan-search-container" onClick={(e) => e.stopPropagation()}>
        <div className="kirtan-search-header">
          <h2>Kirtan Database</h2>
          <div className="search-controls">
            <input
              type="text"
              className="kirtan-search-input"
              placeholder="Search kirtans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className="close-search-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="kirtan-search-body">
          {/* Left Panel - Title Matches */}
          <div className="kirtan-list-panel">
            <div className="panel-header">
              <h3>Title Matches ({titleMatches.length})</h3>
            </div>
            <div
              className="kirtan-list"
              onScroll={(e) => handleScroll(e, setVisibleTitleCount, visibleTitleCount, titleMatches.length)}
            >
              {loading ? (
                <div className="loading">Loading...</div>
              ) : titleMatches.length === 0 ? (
                <div className="no-results">No title matches</div>
              ) : (
                <>
                  {titleMatches.slice(0, visibleTitleCount).map(kirtan => (
                    <div
                      key={kirtan.id}
                      className={`kirtan-item ${selectedKirtan?.id === kirtan.id ? 'selected' : ''}`}
                      onClick={(e) => {
                            e.stopPropagation();
                            handleOpenKirtan(kirtan);
                          }}
                      onDoubleClick={() => handleKirtanDoubleClick(kirtan)}
                    >
                      <div className="kirtan-title" style={{ fontFamily: getFontFamily('unicode') }}>
                        {/* Display Hindi title if searching in Hindi, otherwise Gujarati Unicode */}
                        {isHindi(searchQuery) ?
                          highlightMatch(kirtan.hindiTitle, searchQuery, true) :
                          highlightMatch(kirtan.unicodeTitle, searchQuery, isGujarati(searchQuery))
                        }
                      </div>
                      {/* <div className="kirtan-actions">
                        <button
                          className="open-kirtan-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenKirtan(kirtan);
                          }}
                        >
                          Open
                        </button>
                      </div> */}
                    </div>
                  ))}
                  {visibleTitleCount < titleMatches.length && (
                    <div className="loading-more">Loading more...</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Content Matches */}
          <div className="matching-lines-panel">
            <div className="panel-header">
              <h3>Content Matches ({contentMatches.length})</h3>
            </div>
            <div
              className="matching-lines-list"
              onScroll={(e) => handleScroll(e, setVisibleContentCount, visibleContentCount, contentMatches.length)}
            >
              {contentMatches.length === 0 ? (
                <div className="no-results">
                  {searchQuery ? 'No content matches found' : 'Enter search to find in content'}
                </div>
              ) : (
                <>
                  {contentMatches.slice(0, visibleContentCount).map((match, index) => (
                    <div
                      key={`${match.kirtanId}-${index}`}
                      className={`matching-line-item ${selectedKirtan?.id === match.kirtanId ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenKirtan(match.originalKirtan);
                      }}
                      onDoubleClick={() => handleKirtanDoubleClick(match.originalKirtan)}
                    >
                      <div className="matching-line-content-wrapper">
                        <div className="line-kirtan-title" style={{ fontFamily: getFontFamily('unicode') }}>
                          {match.kirtanTitle}
                        </div>
                        <div
                          className="line-content"
                          style={{ fontFamily: getFontFamily('unicode') }}
                        >
                          {highlightMatch(match.snippet, searchQuery, match.isDirectMatch)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {visibleContentCount < contentMatches.length && (
                    <div className="loading-more">Loading more...</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selected Kirtan Preview (Bottom Panel) */}
        {selectedKirtan && (
          <div className="kirtan-preview">
            <div className="preview-header">
              <h4>{selectedKirtan.unicodeTitle || selectedKirtan.sulekhTitle || 'Untitled'}</h4>
              <div className="preview-actions">
                <button onClick={() => handleKirtanDoubleClick(selectedKirtan)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button onClick={() => handleOpenKirtan(selectedKirtan)}>
                  <i className="fas fa-external-link-alt"></i> Open
                </button>
                <button
                  onClick={() => setSelectedKirtan(null)}
                  style={{ backgroundColor: '#6c757d', marginLeft: '10px' }}
                >
                  <i className="fas fa-times"></i> Close
                </button>
              </div>
            </div>
            <div className="preview-content" style={{ fontFamily: getFontFamily('sulekh') }}>
              {selectedKirtan.sulekhContent || 'No content'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KirtanSearch;