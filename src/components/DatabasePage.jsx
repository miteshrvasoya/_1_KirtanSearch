import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import kirtanDB from '../utils/database';
import { updateKirtan, searchKirtans } from '../utils/kirtanApi';
import '../styles/DatabaseManager.css';
import KirtanEntryEnhanced from './KirtanEntryEnhanced';

const DatabasePage = ({ onEditKirtan }) => {
  const navigate = useNavigate();
  const [kirtans, setKirtans] = useState([]);
  const [filteredKirtans, setFilteredKirtans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Edit State
  const [editingKirtan, setEditingKirtan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load on mount
  useEffect(() => {
    loadKirtans();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, kirtans]);

  useEffect(() => {
    applySort();
  }, [sortConfig]);

  const loadKirtans = async () => {
    setLoading(true);
    try {
      const allKirtans = await kirtanDB.getAllKirtans();
      setKirtans(allKirtans);
    } catch (error) {
      console.error('Failed to load kirtans:', error);
      setMessage('Failed to load kirtans: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredKirtans(kirtans);
      return;
    }

    try {
      const apiResults = await searchKirtans(searchTerm);
      const localResults = await kirtanDB.searchKirtans(searchTerm);

      const titleMatches = apiResults.titleMatches || [];
      const contentMatches = apiResults.contentMatches || [];
      const combined = [...titleMatches, ...contentMatches];

      localResults.forEach(localK => {
        if (!combined.find(k => k.id === localK.id)) {
          combined.push(localK);
        }
      });

      setFilteredKirtans(combined);
    } catch (error) {
      console.error('API Search failed, falling back to local', error);
      try {
        const localResults = await kirtanDB.searchKirtans(searchTerm);
        setFilteredKirtans(localResults);
      } catch (localErr) {
        const lowerSearch = searchTerm.toLowerCase();
        const results = kirtans.filter(k =>
          (k.unicodeTitle && k.unicodeTitle.toLowerCase().includes(lowerSearch)) ||
          (k.englishTitle && k.englishTitle.toLowerCase().includes(lowerSearch)) ||
          (k.sulekhTitle && k.sulekhTitle.toLowerCase().includes(lowerSearch)) ||
          (k.id && k.id.toString().includes(lowerSearch))
        );
        setFilteredKirtans(results);
      }
    }
  };

  const applySort = () => {
    setFilteredKirtans(prevKirtans => {
      const result = [...prevKirtans];
      if (sortConfig.key) {
        result.sort((a, b) => {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];
          if (sortConfig.key === 'id') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
          } else {
            aValue = (aValue || '').toString().toLowerCase();
            bValue = (bValue || '').toString().toLowerCase();
          }
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return result;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddNew = () => {
    setEditingKirtan(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (kirtan) => {
    setEditingKirtan(kirtan);
    setIsEditModalOpen(true);
  };

  const handleSaveKirtan = async (savedKirtan) => {
    try {
      if (savedKirtan.id) {
        let adminSecret = 'adminSecret';
        if (adminSecret) {
          setMessage('Updating via Supabase API...');
          setMessageType('info');
          await updateKirtan(savedKirtan.id, savedKirtan, adminSecret);
          setMessage('Updated successfully via Supabase!');
          setMessageType('success');
        } else {
          await kirtanDB.updateKirtan(savedKirtan.id, savedKirtan);
          setMessage('Updated locally (No Admin Secret for Cloud Sync).');
          setMessageType('warning');
        }
      } else {
        const newId = await kirtanDB.addKirtan(savedKirtan);
        savedKirtan.id = newId;
        let adminSecret = 'adminSecret';
        if (adminSecret) {
          try {
            await updateKirtan(newId, savedKirtan, adminSecret);
            setMessage('Added locally and Synced to Supabase!');
          } catch (syncErr) {
            setMessage('Added locally. Sync failed: ' + syncErr.message);
          }
        } else {
          setMessage('Added locally.');
        }
        setMessageType('success');
      }
    } catch (err) {
      console.error('Save Failed', err);
      setMessage(`Save failed: ${err.message}`);
      setMessageType('error');
    }
    setIsEditModalOpen(false);
    setEditingKirtan(null);
  };

  const handleDeleteKirtan = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
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

  const displayList = searchTerm.trim() ? filteredKirtans : kirtans;

  return (
    <div className="database-screen">
      {/* Header */}
      <div className="database-manager-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className="back-btn"
            onClick={() => navigate('/')}
            title="Back to App"
          >
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

      {/* Body */}
      <div className="database-manager-body">
        {message && (
          <div className={`message ${messageType}`}>
            {message}
            <span className="close-message" onClick={() => setMessage('')}>×</span>
          </div>
        )}

        <div className="tab-content list-view">
          <div className="list-controls">
            <div className="search-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by Title, ID, or Content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <span className="list-stats">{displayList.length} Kirtans</span>
          </div>

          <div className="kirtan-table-container">
            <table className="kirtan-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('unicodeTitle')} className="sortable">
                    Title {sortConfig.key === 'unicodeTitle' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('englishTitle')} className="sortable">
                    English {sortConfig.key === 'englishTitle' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('creator')} className="sortable">
                    Creator {sortConfig.key === 'creator' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="loading-cell">Loading...</td></tr>
                ) : displayList.length === 0 ? (
                  <tr><td colSpan="4" className="empty-cell">
                    {searchTerm ? 'No kirtans match your search.' : 'No kirtans in database.'}
                  </td></tr>
                ) : (
                  displayList.map(k => (
                    <tr key={k.id}>
                      <td className="gujarati-text">{k.unicodeTitle || k.sulekhTitle}</td>
                      <td>{k.englishTitle}</td>
                      <td>{k.creator}</td>
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
      </div>

      <KirtanEntryEnhanced
        isOpen={isEditModalOpen}
        onClose={(saved) => {
          if (saved) {
            loadKirtans();
            performSearch();
          }
          setIsEditModalOpen(false);
        }}
        editKirtan={editingKirtan}
        onSave={async (data) => {
          await handleSaveKirtan(data);
          return true;
        }}
      />
    </div>
  );
};

export default DatabasePage;
