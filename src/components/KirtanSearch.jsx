import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import kirtanDB from '../utils/database';
import searchIndex from '../utils/SearchIndex';
import { searchKirtans } from '../utils/kirtanApi';
import '../styles/KirtanSearch.css';

const KirtanSearch = ({ onSelectKirtan, onEditKirtan }) => {
  const navigate = useNavigate();
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

  const loadKirtans = useCallback(async () => {
    setLoading(true);
    try {
      // Try fetching from Supabase
      const result = await searchKirtans('');
      const kirtans = result.titleMatches || [];
      setAllKirtans(kirtans);
      setTitleMatches(kirtans);
      if (kirtans.length > 0) {
        searchIndex.init(kirtans);
      }
    } catch (error) {
      console.error('Failed to load from Supabase, falling back to local DB:', error);
      try {
        const localKirtans = await kirtanDB.getAllKirtans();
        setAllKirtans(localKirtans);
        setTitleMatches(localKirtans);
        if (localKirtans.length > 0) {
          searchIndex.init(localKirtans);
        }
      } catch (localError) {
        console.error('Failed to load kirtans from local DB:', localError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all kirtans on mount
  useEffect(() => {
    loadKirtans();
  }, [loadKirtans]);

  // Close search screen on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const isGujarati = (text) => {
    const gujaratiRange = /[\u0A80-\u0AFF]/;
    return gujaratiRange.test(text);
  };

  const isHindi = (text) => {
    const devanagariRange = /[\u0900-\u097F]/;
    return devanagariRange.test(text);
  };

  // Search effect with debounce
  useEffect(() => {
    const performSearch = async () => {
      setVisibleTitleCount(ITEMS_PER_PAGE);
      setVisibleContentCount(ITEMS_PER_PAGE);

      if (!searchQuery.trim()) {
        // Show all kirtans in title panel when no query
        setTitleMatches(allKirtans);
        setContentMatches([]);
        return;
      }

      setLoading(true);
      try {
        const searchResult = await searchKirtans(searchQuery);
        setTitleMatches(searchResult.titleMatches || []);
        setContentMatches(searchResult.contentMatches || []);

        console.log('Search results:', {
          titleCount: searchResult.titleMatches?.length || 0,
          contentCount: searchResult.contentMatches?.length || 0,
          meta: searchResult.meta
        });
      } catch (error) {
        console.error('API search failed, falling back to local:', error);
        // Fallback: local in-memory filter
        const lowerQ = searchQuery.toLowerCase();
        const local = allKirtans.filter(k =>
          (k.unicodeTitle && k.unicodeTitle.toLowerCase().includes(lowerQ)) ||
          (k.englishTitle && k.englishTitle.toLowerCase().includes(lowerQ)) ||
          (k.hindiTitle && k.hindiTitle.toLowerCase().includes(lowerQ))
        );
        setTitleMatches(local);
        setContentMatches([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, allKirtans]);

  const handleScroll = (e, setVisibleCount, currentCount, totalCount) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (currentCount < totalCount) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    }
  };

  const handleOpenKirtan = (kirtan) => {
    if (onSelectKirtan) onSelectKirtan(kirtan);
    navigate('/');
  };

  const handleEditKirtan = (kirtan) => {
    if (onEditKirtan) onEditKirtan(kirtan);
    navigate('/');
  };

  const getFontFamily = (type) => {
    if (type === 'sulekh') return "'Guj_Regular_Bold_Sulekh', sans-serif";
    return "'Noto Sans Gujarati', 'Shruti', 'Arial', sans-serif";
  };

  const highlightMatch = (text, query, shouldHighlight) => {
    if (!text || !query || !shouldHighlight) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={index}>{part}</mark>
        : part
    );
  };

  return (
    <div className="kirtan-search-screen">
      {/* Header */}
      <div className="kirtan-search-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className="back-btn"
            onClick={() => navigate('/')}
            title="Back to App"
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <h2>Kirtan Search</h2>
        </div>
        <div className="search-controls">
          <input
            type="text"
            className="kirtan-search-input"
            placeholder="Search kirtans by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button
            className="db-nav-btn"
            onClick={() => navigate('/database')}
            title="Open Database"
          >
            <i className="fas fa-database"></i> Database
          </button>
        </div>
      </div>

      {/* Body - Two-panel layout */}
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
              <div className="loading">Searching...</div>
            ) : titleMatches.length === 0 ? (
              <div className="no-results">
                {searchQuery ? 'No title matches found' : 'No kirtans loaded'}
              </div>
            ) : (
              <>
                {titleMatches.slice(0, visibleTitleCount).map(kirtan => (
                  <div
                    key={kirtan.id}
                    className={`kirtan-item ${selectedKirtan?.id === kirtan.id ? 'selected' : ''}`}
                    onClick={() => setSelectedKirtan(kirtan)}
                    onDoubleClick={() => handleOpenKirtan(kirtan)}
                  >
                    <div className="kirtan-title" style={{ fontFamily: getFontFamily('unicode') }}>
                      {isHindi(searchQuery)
                        ? highlightMatch(kirtan.hindiTitle, searchQuery, true)
                        : highlightMatch(kirtan.unicodeTitle || kirtan.englishTitle, searchQuery, isGujarati(searchQuery))
                      }
                    </div>
                    {kirtan.englishTitle && (
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                        {kirtan.englishTitle}
                      </div>
                    )}
                  </div>
                ))}
                {visibleTitleCount < titleMatches.length && (
                  <div className="loading-more">Scroll for more...</div>
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
                {searchQuery ? 'No content matches found' : 'Enter a search query to find in content'}
              </div>
            ) : (
              <>
                {contentMatches.slice(0, visibleContentCount).map((kirtan, index) => (
                  <div
                    key={`${kirtan.id}-${index}`}
                    className={`matching-line-item ${selectedKirtan?.id === kirtan.id ? 'selected' : ''}`}
                    onClick={() => setSelectedKirtan(kirtan)}
                    onDoubleClick={() => handleOpenKirtan(kirtan)}
                  >
                    <div className="matching-line-content-wrapper">
                      <div className="line-kirtan-title" style={{ fontFamily: getFontFamily('unicode') }}>
                        {isHindi(searchQuery)
                          ? highlightMatch(kirtan.hindiTitle, searchQuery, true)
                          : highlightMatch(kirtan.unicodeTitle || kirtan.englishTitle, searchQuery, isGujarati(searchQuery))
                        }
                      </div>
                      <div className="line-content">
                        {kirtan.creator && <span>{kirtan.creator}</span>}
                        {kirtan.creator && kirtan.bookName && <span> • </span>}
                        {kirtan.bookName && <span>{kirtan.bookName}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {visibleContentCount < contentMatches.length && (
                  <div className="loading-more">Scroll for more...</div>
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
            <h4>{selectedKirtan.unicodeTitle || selectedKirtan.sulekhTitle || selectedKirtan.englishTitle || 'Untitled'}</h4>
            <div className="preview-actions">
              <button onClick={() => handleEditKirtan(selectedKirtan)}>
                <i className="fas fa-edit"></i> Edit
              </button>
              <button onClick={() => handleOpenKirtan(selectedKirtan)}>
                <i className="fas fa-external-link-alt"></i> Open in App
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
            {selectedKirtan.sulekhContent || selectedKirtan.unicodeContent || 'No content available'}
          </div>
        </div>
      )}
    </div>
  );
};

export default KirtanSearch;