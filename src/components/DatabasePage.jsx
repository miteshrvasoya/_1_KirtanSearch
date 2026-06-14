import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import kirtanDB from '../utils/database';
import { updateKirtan, searchKirtans } from '../utils/kirtanApi';
import { getKirtanTitle } from '../utils/kirtanDisplay';
import '../styles/DatabaseManager.css';
import KirtanEntryEnhanced from './KirtanEntryEnhanced';

const DatabasePage = ({ onEditKirtan }) => {
  const navigate = useNavigate();
  const [kirtans, setKirtans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Filter state
  const [filterBook, setFilterBook] = useState('');
  const [filterCreator, setFilterCreator] = useState('');
  const [filterTaal, setFilterTaal] = useState('');
  const [filterDhal, setFilterDhal] = useState('');

  // Edit State
  const [editingKirtan, setEditingKirtan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // API search results (when search term is set)
  const [apiResults, setApiResults] = useState(null);
  const [isApiSearching, setIsApiSearching] = useState(false);

  // Load on mount
  useEffect(() => {
    loadKirtans();
  }, []);

  // API search effect with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setApiResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsApiSearching(true);
      try {
        const result = await searchKirtans(searchTerm);
        const combined = [
          ...(result.titleMatches || []),
          ...(result.contentMatches || [])
        ];
        // Deduplicate by id
        const seen = new Set();
        const deduped = combined.filter(k => {
          if (seen.has(k.id)) return false;
          seen.add(k.id);
          return true;
        });
        setApiResults(deduped);
      } catch (err) {
        // Fallback: local search
        try {
          const localResults = await kirtanDB.searchKirtans(searchTerm);
          setApiResults(localResults);
        } catch {
          setApiResults([]);
        }
      } finally {
        setIsApiSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadKirtans = async () => {
    setLoading(true);
    try {
      const allKirtans = await kirtanDB.getAllKirtans();
      setKirtans(allKirtans);
    } catch (error) {
      setMessage('Failed to load kirtans: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Build unique filter options from all kirtans
  const filterOptions = useMemo(() => {
    const books = new Set();
    const creators = new Set();
    const taals = new Set();
    const dhals = new Set();

    kirtans.forEach(k => {
      if (k.bookName) books.add(k.bookName);
      if (k.englishBookName) books.add(k.englishBookName);
      if (k.creator) creators.add(k.creator);
      if (k.taalPrakar) taals.add(k.taalPrakar);
      if (k.dhal) dhals.add(k.dhal);
    });

    return {
      books: [...books].filter(Boolean).sort(),
      creators: [...creators].filter(Boolean).sort(),
      taals: [...taals].filter(Boolean).sort(),
      dhals: [...dhals].filter(Boolean).sort(),
    };
  }, [kirtans]);

  // Source list: API results if searching, otherwise local
  const sourceList = searchTerm.trim() && apiResults !== null ? apiResults : kirtans;

  // Apply filters on top of source list
  const filteredKirtans = useMemo(() => {
    let list = [...sourceList];

    if (filterBook) {
      list = list.filter(k =>
        (k.bookName && k.bookName === filterBook) ||
        (k.englishBookName && k.englishBookName === filterBook)
      );
    }
    if (filterCreator) {
      list = list.filter(k => k.creator === filterCreator);
    }
    if (filterTaal) {
      list = list.filter(k => k.taalPrakar === filterTaal);
    }
    if (filterDhal) {
      list = list.filter(k => k.dhal === filterDhal);
    }

    // Apply sort
    if (sortConfig.key) {
      list.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'id') {
          aVal = parseInt(aVal) || 0;
          bVal = parseInt(bVal) || 0;
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [sourceList, filterBook, filterCreator, filterTaal, filterDhal, sortConfig]);

  const hasActiveFilters = filterBook || filterCreator || filterTaal || filterDhal;

  const clearAllFilters = () => {
    setFilterBook('');
    setFilterCreator('');
    setFilterTaal('');
    setFilterDhal('');
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const handleAddNew = () => { setEditingKirtan(null); setIsEditModalOpen(true); };
  const handleEdit = (kirtan) => { setEditingKirtan(kirtan); setIsEditModalOpen(true); };

  const handleSaveKirtan = async (savedKirtan) => {
    try {
      if (savedKirtan.id) {
        setMessage('Updating via Supabase API...');
        setMessageType('info');
        await updateKirtan(savedKirtan.id, savedKirtan, 'adminSecret');
        setMessage('Updated successfully via Supabase!');
        setMessageType('success');
      } else {
        const newId = await kirtanDB.addKirtan(savedKirtan);
        savedKirtan.id = newId;
        try {
          await updateKirtan(newId, savedKirtan, 'adminSecret');
          setMessage('Added and Synced to Supabase!');
        } catch {
          setMessage('Added locally. Sync failed.');
        }
        setMessageType('success');
      }
    } catch (err) {
      setMessage(`Save failed: ${err.message}`);
      setMessageType('error');
    }
    setIsEditModalOpen(false);
    setEditingKirtan(null);
  };

  const handleDeleteKirtan = async (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      try {
        await kirtanDB.deleteKirtan(id);
        setMessage(`Deleted "${title}" successfully.`);
        setMessageType('success');
        loadKirtans();
      } catch (error) {
        setMessage('Failed to delete: ' + error.message);
        setMessageType('error');
      }
    }
  };

  return (
    <div className="database-screen">
      {/* Header */}
      <div className="database-manager-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="back-btn" onClick={() => navigate('/')} title="Back to App">
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <h2 style={{ margin: 0 }}>
            <i className="fas fa-database" style={{ marginRight: '10px' }}></i>
            Kirtan Database
          </h2>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-light" onClick={() => navigate('/search')}>
            <i className="fas fa-search"></i> Search
          </button>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <i className="fas fa-plus"></i> Add New
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="db-filter-bar">
        {/* Search */}
        <div className="db-search-wrapper">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by title, ID, or content..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button className="db-clear-input" onClick={() => setSearchTerm('')} title="Clear search">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="db-filters">
          <FilterSelect
            label="Book"
            icon="fas fa-book"
            value={filterBook}
            options={filterOptions.books}
            onChange={setFilterBook}
          />
          <FilterSelect
            label="Creator"
            icon="fas fa-user"
            value={filterCreator}
            options={filterOptions.creators}
            onChange={setFilterCreator}
          />
          <FilterSelect
            label="Taal"
            icon="fas fa-music"
            value={filterTaal}
            options={filterOptions.taals}
            onChange={setFilterTaal}
          />
          <FilterSelect
            label="Dhal"
            icon="fas fa-drum"
            value={filterDhal}
            options={filterOptions.dhals}
            onChange={setFilterDhal}
          />

          {hasActiveFilters && (
            <button className="db-clear-filters-btn" onClick={clearAllFilters} title="Clear all filters">
              <i className="fas fa-filter-slash"></i> Clear Filters
            </button>
          )}
        </div>

        {/* Stats */}
        <span className="db-result-stats">
          {isApiSearching
            ? <span style={{ color: '#888', fontSize: '13px' }}><i className="fas fa-spinner fa-spin"></i> Searching...</span>
            : <><strong>{filteredKirtans.length}</strong> of {kirtans.length} kirtans</>
          }
        </span>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`message ${messageType}`} style={{ margin: '0 20px 0 20px' }}>
          {message}
          <span className="close-message" onClick={() => setMessage('')}>×</span>
        </div>
      )}

      {/* Table */}
      <div className="database-manager-body" style={{ paddingTop: '10px' }}>
        <div className="kirtan-table-container">
          <table className="kirtan-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('unicodeTitle')} className="sortable">
                  Title{sortIndicator('unicodeTitle')}
                </th>
                <th onClick={() => handleSort('englishTitle')} className="sortable">
                  English{sortIndicator('englishTitle')}
                </th>
                <th onClick={() => handleSort('creator')} className="sortable">
                  Creator{sortIndicator('creator')}
                </th>
                <th onClick={() => handleSort('bookName')} className="sortable">
                  Book{sortIndicator('bookName')}
                </th>
                <th onClick={() => handleSort('taalPrakar')} className="sortable">
                  Taal{sortIndicator('taalPrakar')}
                </th>
                <th onClick={() => handleSort('dhal')} className="sortable">
                  Dhal{sortIndicator('dhal')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="loading-cell">Loading...</td></tr>
              ) : filteredKirtans.length === 0 ? (
                <tr><td colSpan="7" className="empty-cell">
                  {searchTerm || hasActiveFilters ? 'No kirtans match your search / filters.' : 'No kirtans in database.'}
                </td></tr>
              ) : (
                filteredKirtans.map(k => (
                  <tr key={k.id}>
                    <td className="gujarati-text">{getKirtanTitle(k)}</td>
                    <td>{k.englishTitle}</td>
                    <td>{k.creator}</td>
                    <td>{k.bookName || k.englishBookName}</td>
                    <td>{k.taalPrakar}</td>
                    <td>{k.dhal}</td>
                    <td className="actions-cell">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(k)} title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDeleteKirtan(k.id, k.unicodeTitle || k.englishTitle)} title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <KirtanEntryEnhanced
        isOpen={isEditModalOpen}
        onClose={(saved) => {
          if (saved) loadKirtans();
          setIsEditModalOpen(false);
        }}
        editKirtan={editingKirtan}
        onSave={async (data) => { await handleSaveKirtan(data); return true; }}
      />
    </div>
  );
};

// Reusable filter select component
const FilterSelect = ({ label, icon, value, options, onChange }) => {
  const isEmpty = options.length === 0;
  return (
    <div className="db-filter-select-wrapper" style={{ opacity: isEmpty ? 0.5 : 1 }}>
      <i className={icon}></i>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`db-filter-select ${value ? 'active' : ''}`}
        title={isEmpty ? `No ${label} data in current records` : `Filter by ${label}`}
        disabled={isEmpty}
      >
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {value && (
        <button className="db-filter-clear-btn" onClick={() => onChange('')} title={`Clear ${label} filter`}>
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default DatabasePage;
