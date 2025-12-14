import React, { useState, useEffect } from 'react';
import kirtanDB from '../utils/database';
import { updateKirtan, searchKirtans } from '../utils/kirtanApi';
import '../styles/DatabaseManager.css';
import KirtanEntryEnhanced from './KirtanEntryEnhanced';

const DatabasePage = ({ isOpen, onClose, onEditKirtan }) => {
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

  useEffect(() => {
    if (isOpen) {
      loadKirtans();
    }
  }, [isOpen]);

  useEffect(() => {
    // Debounce search to prevent rapid DB queries
    const timeoutId = setTimeout(() => {
        performSearch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, kirtans]); // Re-run when search term or kirtan list changes

  useEffect(() => {
      // Apply sort whenever filtered list or sort config changes
      applySort();
  }, [sortConfig]); // Only re-sort when config changes, performSearch handles the data update

  const loadKirtans = async () => {
    setLoading(true);
    try {
      const allKirtans = await kirtanDB.getAllKirtans();
      setKirtans(allKirtans);
      // filteredKirtans will be updated by the searchTerm effect
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
        setFilteredKirtans([]); // Show empty list if no search
        return;
    }

    // 1. Search Supabase API (Cloud)
    try {
        // We set loading true here if we want to show a spinner during search
        // setLoading(true); // Optional: might cause flicker if typing fast
        
        const apiResults = await searchKirtans(searchTerm);
        
        // 2. Search Local DB
        // We can choose to merge results or just show API results. 
        // User requested "Fix Kirtan search... Search API is not being called".
        // Let's prioritize API results but maybe merge if we want robust UX.
        // For simplicity and to satisfy the request, let's show API results if available.
        // However, we should also probably search local DB because the user might have offline edits.
        
        const localResults = await kirtanDB.searchKirtans(searchTerm);
        
        // Merge strategy: Create a map by ID
        // Note: API returns different ID structure potentially? 
        // kirtanDB has auto-increment ID. API has original ID. 
        // Currently mapSingleKirtan in API utils maps `id` to `item.id || item.pad_id`.
        
        const combined = [...apiResults];
        
        // Add unique local results
        localResults.forEach(localK => {
            if (!combined.find(apiK => apiK.id === localK.id)) {
                combined.push(localK);
            }
        });
        
        setFilteredKirtans(combined);
        
    } catch (error) {
        console.error("API Search failed, falling back to local", error);
        
        // Fallback: Local DB Search
        try {
            const localResults = await kirtanDB.searchKirtans(searchTerm);
            setFilteredKirtans(localResults);
        } catch (localErr) {
             // Fallback to in-memory filter if absolutely everything else fails
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
    // finally { setLoading(false); }
  };

  const applySort = () => {
    // Sort logic acting on filteredKirtans
    // We need to create a new array to trigger re-render
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
          const adminSecret = localStorage.getItem('adminSecret');
          
          if (savedKirtan.id) {
              // UPDATE: Use API directly if secret exists (or throw/handle offline)
              let adminSecret = "adminSecret";
              if (adminSecret) {
                  setMessage('Updating via Supabase API...');
                  setMessageType('info');
                  await updateKirtan(savedKirtan.id, savedKirtan, adminSecret);
                  setMessage('Updated successfully via Supabase!');
                  setMessageType('success');
              } else {
                  // Fallback to local if no secret (or user preference?)
                  // User "Instead of Storing changes locally" implies API priority.
                  // But if no secret, we must fail or warn?
                  // Let's assume Admin Secret is known or we fallback to local + warning.
                  await kirtanDB.updateKirtan(savedKirtan.id, savedKirtan);
                  setMessage('Updated locally (No Admin Secret for Cloud Sync).');
                  setMessageType('warning');
              }
          } else {
              // ADD: No API for Add yet, use Local + Sync attempt
              // Or treating updateKirtan as upsert if backend supports it?
              // Assuming Local First for Add is safer for now.
              const newId = await kirtanDB.addKirtan(savedKirtan);
              savedKirtan.id = newId; // Assign new ID

              let adminSecret = "adminSecret";
              
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
          console.error("Save Failed", err);
          setMessage(`Save failed: ${err.message}`);
          setMessageType('error');
          // If API failed for update, maybe fallback to local?
          // For now, let's respect the error.
      }

      setIsEditModalOpen(false);
      setEditingKirtan(null);
      // loadKirtans(); // Local reload - might not reflect API update if API doesn't write to local
      // But performSearch() in onClose will handle the view refresh.
  };

  const handleDeleteKirtan = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await kirtanDB.deleteKirtan(id);
        setMessage(`Deleted "${title}" successfully from local DB.`);
        setMessageType('success');
        loadKirtans();
      } catch (error) {
        setMessage('Failed to delete: ' + error.message);
        setMessageType('error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="database-manager-modal">
      <div className="database-manager-content" style={{ maxWidth: '95%', height: '95vh' }}> 
        <div className="database-manager-header">
          <h2>Kirtan Database</h2>
          <div className="header-actions" style={{display:'flex', gap:'10px'}}>
             <button className="btn btn-primary" onClick={handleAddNew}>
                 <i className="fas fa-plus"></i> Add New
             </button>
             <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Tools Tabs removed as requested */}

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
                  <span className="list-stats">{filteredKirtans.length} Kirtans</span>
              </div>

              <div className="kirtan-table-container">
                  <table className="kirtan-table">
                      <thead>
                          <tr>
                              <th onClick={() => handleSort('unicodeTitle')} className="sortable">Title</th>
                              <th onClick={() => handleSort('englishTitle')} className="sortable">English</th>
                              <th onClick={() => handleSort('creator')} className="sortable">Creator</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                         {loading ? <tr><td colSpan="4" className="loading">Loading...</td></tr> : 
                          filteredKirtans.map(k => (
                              <tr key={k.id}>
                                  <td className="gujarati-text">{k.unicodeTitle || k.sulekhTitle}</td>
                                  <td>{k.englishTitle}</td>
                                  <td>{k.creator}</td>
                                  <td className="actions-cell">
                                      <button className="icon-btn edit-btn" onClick={() => handleEdit(k)} title="Edit"><i className="fas fa-edit"></i></button>
                                      <button className="icon-btn delete-btn" onClick={() => handleDeleteKirtan(k.id, k.unicodeTitle)} title="Delete"><i className="fas fa-trash"></i></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
        </div>
      </div>

      <KirtanEntryEnhanced 
         isOpen={isEditModalOpen}
         onClose={(saved) => {
             if (saved) {
                 loadKirtans();
                 performSearch(); // Explicitly re-run search/API fetch
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
