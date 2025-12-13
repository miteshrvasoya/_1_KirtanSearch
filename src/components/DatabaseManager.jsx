import React, { useState, useEffect } from 'react';
import kirtanDB from '../utils/database';
import '../styles/DatabaseManager.css';

const DatabaseManager = ({ isOpen, onClose, onEditKirtan }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'tools'
  
  // List View State
  const [kirtans, setKirtans] = useState([]);
  const [filteredKirtans, setFilteredKirtans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // Tools State
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Load kirtans when modal opens or tab switches to list
  useEffect(() => {
    if (isOpen && activeTab === 'list') {
      loadKirtans();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (kirtans.length > 0) {
      filterAndSortKirtans();
    }
  }, [searchTerm, kirtans, sortConfig]);

  const loadKirtans = async () => {
    setLoading(true);
    try {
      const allKirtans = await kirtanDB.getAllKirtans();
      setKirtans(allKirtans);
      setFilteredKirtans(allKirtans);
    } catch (error) {
      console.error('Failed to load kirtans:', error);
      setMessage('Failed to load kirtans: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortKirtans = () => {
    let result = [...kirtans];

    // Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(k => 
        (k.unicodeTitle && k.unicodeTitle.toLowerCase().includes(lowerSearch)) ||
        (k.englishTitle && k.englishTitle.toLowerCase().includes(lowerSearch)) ||
        (k.sulekhTitle && k.sulekhTitle.toLowerCase().includes(lowerSearch)) ||
        (k.id && k.id.toString().includes(lowerSearch))
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric sorting for IDs
        if (sortConfig.key === 'id') {
           aValue = parseInt(aValue) || 0;
           bValue = parseInt(bValue) || 0;
        } else {
           aValue = (aValue || '').toString().toLowerCase();
           bValue = (bValue || '').toString().toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredKirtans(result);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteKirtan = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await kirtanDB.deleteKirtan(id);
        setMessage(`Deleted "${title}" successfully.`);
        setMessageType('success');
        // Refresh list
        loadKirtans();
      } catch (error) {
        setMessage('Failed to delete: ' + error.message);
        setMessageType('error');
      }
    }
  };

  const handleEdit = (kirtan) => {
    onEditKirtan(kirtan);
    onClose(); // Close DB Manager to show Edit Modal
  };

  // --- Tool Actions ---

  const handleExport = async () => {
    setExporting(true);
    setMessage('');
    
    try {
      const jsonData = await kirtanDB.exportToJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kirtan-database-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('Database exported successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to export database: ' + error.message);
      setMessageType('error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setMessage('');

    try {
      const text = await file.text();
      const count = await kirtanDB.importFromJSON(text);
      setMessage(`Successfully imported ${count} kirtans!`);
      setMessageType('success');
      
      // Clear the file input
      event.target.value = '';
      
      // Refresh list if on list tab
      loadKirtans();
    } catch (error) {
      setMessage('Failed to import database: ' + error.message);
      setMessageType('error');
    } finally {
      setImporting(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all kirtans? This action cannot be undone!')) {
      return;
    }

    try {
      await kirtanDB.clearDatabase();
      setMessage('Database cleared successfully!');
      setMessageType('success');
      loadKirtans();
    } catch (error) {
      setMessage('Failed to clear database: ' + error.message);
      setMessageType('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="database-manager-modal">
      <div className="database-manager-content">
        <div className="database-manager-header">
          <h2>Database Management</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="database-tabs">
            <button 
                className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => setActiveTab('list')}
            >
                <i className="fas fa-list"></i> Kirtan List
            </button>
            <button 
                className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
            >
                <i className="fas fa-tools"></i> Tools
            </button>
        </div>

        <div className="database-manager-body">
          {message && (
            <div className={`message ${messageType}`}>
              {message}
              <span className="close-message" onClick={() => setMessage('')}>×</span>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="tab-content list-view">
               <div className="list-controls">
                   <div className="search-wrapper">
                       <i className="fas fa-search"></i>
                       <input 
                          type="text" 
                          placeholder="Search by Title or ID..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                       />
                   </div>
                   <div className="list-stats">
                       Showing {filteredKirtans.length} of {kirtans.length} kirtans
                   </div>
               </div>

               <div className="kirtan-table-container">
                   <table className="kirtan-table">
                       <thead>
                           <tr>
                               <th onClick={() => handleSort('id')} className="sortable">
                                   ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                               </th>
                               <th onClick={() => handleSort('unicodeTitle')} className="sortable">
                                   Unicode Title {sortConfig.key === 'unicodeTitle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                               </th>
                               <th onClick={() => handleSort('englishTitle')} className="sortable">
                                   English Title {sortConfig.key === 'englishTitle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                               </th>
                               <th onClick={() => handleSort('creator')} className="sortable">
                                   Creator {sortConfig.key === 'creator' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                               </th>
                               <th>Actions</th>
                           </tr>
                       </thead>
                       <tbody>
                           {loading ? (
                               <tr><td colSpan="5" className="loading-cell">Loading...</td></tr>
                           ) : filteredKirtans.length === 0 ? (
                               <tr><td colSpan="5" className="empty-cell">No kirtans found.</td></tr>
                           ) : (
                               filteredKirtans.map(kirtan => (
                                   <tr key={kirtan.id}>
                                       <td>{kirtan.id}</td>
                                       <td className="gujarati-text">{kirtan.unicodeTitle || kirtan.sulekhTitle}</td>
                                       <td>{kirtan.englishTitle}</td>
                                       <td>{kirtan.creator}</td>
                                       <td className="actions-cell">
                                           <button 
                                                className="icon-btn edit-btn" 
                                                onClick={() => handleEdit(kirtan)}
                                                title="Edit"
                                            >
                                               <i className="fas fa-edit"></i>
                                           </button>
                                           <button 
                                                className="icon-btn delete-btn" 
                                                onClick={() => handleDeleteKirtan(kirtan.id, kirtan.unicodeTitle || kirtan.englishTitle)}
                                                title="Delete"
                                            >
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
          )}

          {activeTab === 'tools' && (
            <div className="tab-content tools-view">
              <div className="database-actions">
                <div className="action-card">
                  <i className="fas fa-download"></i>
                  <h3>Export Database</h3>
                  <p>Download all kirtans as a JSON file for backup or sharing.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    {exporting ? 'Exporting...' : 'Export to JSON'}
                  </button>
                </div>

                <div className="action-card">
                  <i className="fas fa-upload"></i>
                  <h3>Import Database</h3>
                  <p>Load kirtans from a previously exported JSON file.</p>
                  <p className="helper-text">
                    Supports both app exports and the new final_output JSON.
                  </p>
                  <label className="btn btn-primary file-input-label">
                    {importing ? 'Importing...' : 'Import from JSON'}
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      disabled={importing}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className="action-card danger">
                  <i className="fas fa-trash-alt"></i>
                  <h3>Clear Database</h3>
                  <p>Remove all kirtans from the database. This action cannot be undone!</p>
                  <button 
                    className="btn btn-danger"
                    onClick={handleClearDatabase}
                  >
                    Clear All Data
                  </button>
                </div>
              </div>

              <div className="database-info">
                <h4>About Database Storage</h4>
                <p>
                  Your kirtans are stored locally in your browser using IndexedDB. 
                  This means your data is private and stays on your device. 
                  Regular exports are recommended for backup purposes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;