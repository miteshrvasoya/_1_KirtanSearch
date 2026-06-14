import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/HeaderClean';
import TabBar from './components/TabBar';
import LinesPanel from './components/LinesPanel';
import SelectedLinesPanel from './components/SelectedLinesPanel';
import OutputArea from './components/OutputArea';
import InputModal from './components/InputModal';
import Login from './components/Login';
import SettingsModal from './components/SettingModal';
import VmixModal from './components/VmixModal';
import KirtanEntryEnhanced from './components/KirtanEntryEnhanced';
import DatabasePage from './components/DatabasePage';
import KirtanSearch from './components/KirtanSearch';
import PDFImport from './components/PDFImport';
import PinModal from './components/PinModal';
import kirtanDB from './utils/database';
import searchIndex from './utils/SearchIndex';
import { loadSampleData } from './utils/sampleData';
import { fetchKirtanDetails } from './utils/kirtanApi';
import './styles/App.css';
import {
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

function MainApp({ onLogout, pendingKirtanSelection, onKirtanSelectionHandled, pendingKirtanEdit, onKirtanEditHandled }) {
  // Tab management state
  const [tabs, setTabs] = useState([
    {
      id: 1, name: 'Tab 1', active: true, data: {
        allLines: [],
        sulekhLines: [], // Sulekh version for output
        selectedLines: [],
        currentDisplayedText: 'ÁÒ Ùä sÕâãÑÌâÓâÒÇ',
        selectedLineIndex: -1,
        originalInputText: '',
        currentKirtan: null,
        relatedPads: []
      }
    }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextTabId, setNextTabId] = useState(2);

  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [vmixModalOpen, setVmixModalOpen] = useState(false);
  const [kirtanEntryOpen, setKirtanEntryOpen] = useState(false);
  const [editingKirtan, setEditingKirtan] = useState(null);
  const [pdfImportOpen, setPdfImportOpen] = useState(false);
  const [isInputPanelFocused, setIsInputPanelFocused] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [linesToDelete, setLinesToDelete] = useState([]);
  const [overlayActive, setOverlayActive] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const navigate = useNavigate();

  // Get current tab data
  const currentTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  const { allLines, selectedLines, currentDisplayedText, selectedLineIndex, originalInputText } = currentTab.data;

  // Load saved settings on initial mount
  const [vmixSettings, setVmixSettings] = useState(() => {
    const savedSettings = localStorage.getItem('vmixSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      inputNumber: 1,
      overlayNumber: 1,
      ipAddress: '192.168.1.3',
      port: 8088
    };
  });

  const [editorSettings, setEditorSettings] = useState(() => {
    const savedSettings = localStorage.getItem('editorSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      fontSize: '60px',
      textColor: '#8B0000', // Deep Red
      bgColor: '#f2cfa6',   // Beige
      fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center'
    };
  });

  // Define updateCurrentTab before it's used
  const updateCurrentTab = useCallback((updates) => {
    setTabs(prevTabs => prevTabs.map(tab =>
      tab.id === activeTabId
        ? { ...tab, data: { ...tab.data, ...updates } }
        : tab
    ));
  }, [activeTabId]);

  const triggerVmixOverlay = useCallback(async () => {
    if (!vmixSettings.ipAddress || vmixSettings.ipAddress === '127.0.0.1') {
      console.error('vMix IP not configured');
      return;
    }

    try {
      const { ipAddress, port, inputNumber, overlayNumber } = vmixSettings;
      const functionName = overlayActive ? 'Out' : 'In';

      const response = await fetch(
        `http://${ipAddress}:${port}/api/?Function=OverlayInput${overlayNumber}${functionName}&Input=${inputNumber}`
      );

      if (!response.ok) throw new Error(`Failed to toggle overlay ${functionName}`);

      setOverlayActive(!overlayActive);
    } catch (error) {
      console.error('Overlay error:', error);
      setOverlayActive(false);
    }
  }, [vmixSettings, overlayActive]);

  const selectLine = useCallback((index) => {
    // Use sulekh for output if available, otherwise fallback to unicode
    const sulekhLines = currentTab.data.sulekhLines || allLines;
    updateCurrentTab({
      selectedLineIndex: index,
      currentDisplayedText: sulekhLines[index] || allLines[index]
    });
    scrollToLine(index);
  }, [allLines, currentTab.data.sulekhLines, updateCurrentTab]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
          e.preventDefault();
          e.stopPropagation();
          triggerVmixOverlay();
        }
        return;
      }

      // Open Kirtan Search on Tilde (~) or Backtick (`)
      if (e.key === '~' || e.key === '`') {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
          e.preventDefault();
          navigate('/search');
        }
        return;
      }

      if (allLines.length > 0 && isInputPanelFocused) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (selectedLineIndex > 0) {
            selectLine(selectedLineIndex - 1);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const newIndex = selectedLineIndex >= allLines.length - 1 ? 0 : selectedLineIndex + 1;
          selectLine(newIndex);
        }
      }

      // Fix numeric key shortcuts for selected lines (Shortcut Kadi)
      if (e.key >= '1' && e.key <= '9' && selectedLines.length > 0) {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
          e.preventDefault();
          const num = parseInt(e.key);
          if (num <= selectedLines.length) {
            const line = selectedLines[num - 1];
            const textToDisplay = typeof line === 'string' ? line : (line.sulekh || line.unicode);
            updateCurrentTab({ currentDisplayedText: textToDisplay });
            scrollToLine(num - 1, true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allLines, selectedLines, selectedLineIndex, isInputPanelFocused, updateCurrentTab, selectLine, triggerVmixOverlay, navigate]);

  // Tab management functions
  const addNewTab = () => {
    const newTab = {
      id: nextTabId,
      name: `Tab ${nextTabId}`,
      active: false,
      data: {
        allLines: [],
        sulekhLines: [],
        selectedLines: [],
        currentDisplayedText: 'ÁÒ Ùä sÕâãÑÌâÓâÒÇ',
        selectedLineIndex: -1,
        originalInputText: '',
        currentKirtan: null,
        relatedPads: []
      }
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  const switchTab = (tabId) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setLinesToDelete([]);
      setIsDeleteMode(false);
    }
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const processText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let tabName = 'Empty Tab';
    if (lines.length > 0) {
      const firstLine = lines[0];
      tabName = firstLine.length > 25 ? firstLine.substring(0, 25) + '...' : firstLine;
    }

    setTabs(tabs.map(tab =>
      tab.id === activeTabId
        ? {
          ...tab,
          name: tabName,
          data: {
            ...tab.data,
            allLines: lines,
            sulekhLines: lines,
            selectedLines: [],
            selectedLineIndex: lines.length > 0 ? 0 : -1,
            currentDisplayedText: lines.length > 0 ? lines[0] : '',
            originalInputText: text
          }
        }
        : tab
    ));

    setLinesToDelete([]);
    setIsDeleteMode(false);
  };

  const renameTab = (tabId, newName) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId ? { ...tab, name: newName } : tab
    ));
  };

  const setCurrentDisplayedText = (text) => updateCurrentTab({ currentDisplayedText: text });
  const setAllLines = (lines) => updateCurrentTab({ allLines: lines });
  const setSelectedLineIndex = (index) => updateCurrentTab({ selectedLineIndex: index });

  const addToSelectedLines = (index) => {
    const unicodeLine = allLines[index];
    const sulekhLines = currentTab.data.sulekhLines || [];
    const sulekhLine = sulekhLines[index] || unicodeLine;
    const exists = selectedLines.some(line =>
      (typeof line === 'string' ? line : line.unicode) === unicodeLine
    );
    if (!exists) {
      const lineObj = { unicode: unicodeLine, sulekh: sulekhLine };
      updateCurrentTab({ selectedLines: [...selectedLines, lineObj] });
    }
    setIsInputPanelFocused(false);
  };

  const removeSelectedLine = (index) => {
    const newSelectedLines = [...selectedLines];
    newSelectedLines.splice(index, 1);
    updateCurrentTab({ selectedLines: newSelectedLines });
    if (newSelectedLines.length === 0 && allLines.length > 0) {
      setIsInputPanelFocused(true);
    }
  };

  const updateEditorSettings = (newSettings) => {
    const updatedSettings = { ...editorSettings, ...newSettings };
    setEditorSettings(updatedSettings);
    localStorage.setItem('editorSettings', JSON.stringify(updatedSettings));
  };

  const saveVmixSettings = (settings) => {
    const validatedSettings = {
      ...settings,
      inputNumber: parseInt(settings.inputNumber) || 1,
      overlayNumber: Math.min(4, Math.max(1, parseInt(settings.overlayNumber) || 1)),
      port: parseInt(settings.port) || 8088
    };
    setVmixSettings(validatedSettings);
    localStorage.setItem('vmixSettings', JSON.stringify(validatedSettings));
    setVmixModalOpen(false);
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    if (!isDeleteMode) setLinesToDelete([]);
  };

  const toggleLineForDeletion = (index) => {
    if (linesToDelete.includes(index)) {
      setLinesToDelete(linesToDelete.filter(i => i !== index));
    } else {
      setLinesToDelete([...linesToDelete, index]);
    }
  };

  const deleteSelectedLines = () => {
    const newAllLines = allLines.filter((_, index) => !linesToDelete.includes(index));
    setAllLines(newAllLines);
    setIsDeleteMode(false);
    setLinesToDelete([]);
    if (newAllLines.length > 0) {
      setSelectedLineIndex(0);
      setCurrentDisplayedText(newAllLines[0]);
    } else {
      setSelectedLineIndex(-1);
      setCurrentDisplayedText('');
    }
  };

  // Handle kirtan selection from search screen
  const handleSelectKirtan = useCallback(async (kirtan) => {
    try {
      const existingTab = tabs.find(tab =>
        tab.data.currentKirtan && tab.data.currentKirtan.id === kirtan.id
      );
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      const { kirtan: fullKirtan, siblingKirtans } = await fetchKirtanDetails(kirtan.id);

      const hindiLines = fullKirtan.hindiContent
        ? fullKirtan.hindiContent.split('\n').filter(line => line.trim() !== '')
        : [];
      const unicodeLines = fullKirtan.unicodeContent
        ? fullKirtan.unicodeContent.split('\n').filter(line => line.trim() !== '')
        : [];
      const sulekhLines = fullKirtan.sulekhContent
        ? fullKirtan.sulekhContent.split('\n').filter(line => line.trim() !== '')
        : [];

      // Hindi kirtan: has both hindiTitle AND hindiContent (even if gujarati/sulekh also present)
      const isHindiKirtan = !!(fullKirtan.hindiTitle && hindiLines.length > 0);

      // allLines = original script lines for the Lines Panel display
      const displayLines = isHindiKirtan ? hindiLines : (unicodeLines.length > 0 ? unicodeLines : hindiLines);

      // outputLines = what goes into the Output Area
      const outputLines = isHindiKirtan
        ? hindiLines
        : (sulekhLines.length > 0 ? sulekhLines : unicodeLines);

      const newTabData = {
        name: fullKirtan.unicodeTitle || fullKirtan.hindiTitle || fullKirtan.sulekhTitle || fullKirtan.englishTitle || `Kirtan ${nextTabId}`,
        data: {
          allLines: displayLines,
          sulekhLines: outputLines,
          selectedLines: displayLines.slice(0, 2).map((dLine, idx) => ({
            unicode: dLine,
            sulekh: outputLines[idx] || dLine,
            hindi: hindiLines[idx] || ''
          })),
          currentDisplayedText: outputLines[0] || '',
          selectedLineIndex: 0,
          originalInputText: isHindiKirtan
            ? (fullKirtan.hindiContent || '')
            : (fullKirtan.unicodeContent || ''),
          currentKirtan: fullKirtan,
          relatedPads: siblingKirtans
        }
      };

      if (tabs.length === 1 && tabs[0].data.allLines.length === 0 && !tabs[0].data.currentKirtan) {
        setTabs([{ ...tabs[0], ...newTabData, active: true }]);
        setActiveTabId(tabs[0].id);
      } else {
        setTabs([...tabs, { id: nextTabId, active: false, ...newTabData }]);
        setActiveTabId(nextTabId);
        setNextTabId(nextTabId + 1);
      }
    } catch (error) {
      console.error('Error loading kirtan from API:', error);
      try {
        const relatedPads = await kirtanDB.getRelatedPads(kirtan.id);

        const hindiLines = kirtan.hindiContent ? kirtan.hindiContent.split('\n').filter(l => l.trim()) : [];
        const unicodeLines = kirtan.unicodeContent ? kirtan.unicodeContent.split('\n').filter(l => l.trim()) : [];
        const sulekhLines = kirtan.sulekhContent ? kirtan.sulekhContent.split('\n').filter(l => l.trim()) : [];

        const isHindiKirtan = !!(kirtan.hindiTitle && hindiLines.length > 0);
        const displayLines = isHindiKirtan ? hindiLines : (unicodeLines.length > 0 ? unicodeLines : hindiLines);
        const outputLines = isHindiKirtan
          ? hindiLines
          : (sulekhLines.length > 0 ? sulekhLines : unicodeLines);

        const newTabData = {
          name: kirtan.unicodeTitle || kirtan.hindiTitle || kirtan.sulekhTitle || kirtan.englishTitle || `Kirtan ${nextTabId}`,
          data: {
            allLines: displayLines,
            sulekhLines: outputLines,
            selectedLines: displayLines.slice(0, 2).map((dLine, idx) => ({
              unicode: dLine,
              sulekh: outputLines[idx] || dLine,
              hindi: hindiLines[idx] || ''
            })),
            currentDisplayedText: outputLines[0] || '',
            selectedLineIndex: 0,
            originalInputText: isHindiKirtan ? (kirtan.hindiContent || '') : (kirtan.unicodeContent || ''),
            currentKirtan: kirtan,
            relatedPads
          }
        };

        if (tabs.length === 1 && tabs[0].data.allLines.length === 0 && !tabs[0].data.currentKirtan) {
          setTabs([{ ...tabs[0], ...newTabData, active: true }]);
          setActiveTabId(tabs[0].id);
        } else {
          setTabs([...tabs, { id: nextTabId, active: false, ...newTabData }]);
          setActiveTabId(nextTabId);
          setNextTabId(nextTabId + 1);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Failed to load kirtan details. Please try again.');
      }
    }
  }, [tabs, nextTabId]);

  // Handle adding new kirtan
  const handleAddNewKirtan = () => {
    setPendingAction('addKirtan');
    setPinModalOpen(true);
  };

  // Handle PIN success
  const handlePinSuccess = () => {
    setPinModalOpen(false);

    if (pendingAction === 'addKirtan') {
      setEditingKirtan(null);
      setKirtanEntryOpen(true);
    } else if (pendingAction === 'database') {
      navigate('/database');
    } else if (pendingAction === 'import') {
      setPdfImportOpen(true);
    }

    setPendingAction(null);
  };

  // Handle protected actions
  const handleOpenDatabase = () => {
    setPendingAction('database');
    setPinModalOpen(true);
  };

  const handleOpenKirtanSearch = () => {
    navigate('/search');
  };

  const handleOpenPDFImport = () => {
    setPendingAction('import');
    setPinModalOpen(true);
  };

  // Handle pending kirtan selection from /search screen
  useEffect(() => {
    if (pendingKirtanSelection) {
      handleSelectKirtan(pendingKirtanSelection);
      if (onKirtanSelectionHandled) onKirtanSelectionHandled();
    }
  }, [pendingKirtanSelection, handleSelectKirtan, onKirtanSelectionHandled]);

  // Handle pending kirtan edit from /database or /search screen
  useEffect(() => {
    if (pendingKirtanEdit) {
      setEditingKirtan(pendingKirtanEdit);
      setKirtanEntryOpen(true);
      if (onKirtanEditHandled) onKirtanEditHandled();
    }
  }, [pendingKirtanEdit, onKirtanEditHandled]);

  // Initialize database on component mount
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await kirtanDB.init();
        const count = await loadSampleData(kirtanDB);
        if (count > 0) console.log(`Loaded ${count} sample kirtans`);
        const allKirtans = await kirtanDB.getAllKirtans();
        searchIndex.init(allKirtans);
        console.log('Search index initialized');
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };
    initDatabase();
  }, []);

  return (
    <div className="app">
      <Header
        onOpenInputModal={() => setInputModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
        onOpenVmixModal={() => setVmixModalOpen(true)}
        onOpenDatabase={handleOpenDatabase}
        onOpenKirtanSearch={handleOpenKirtanSearch}
        onAddNewKirtan={handleAddNewKirtan}
        onOpenPDFImport={handleOpenPDFImport}
        onLogout={onLogout}
      />

      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={switchTab}
        onCloseTab={closeTab}
        onAddTab={addNewTab}
        onRenameTab={renameTab}
      />

      <div className="main-container">
        <LinesPanel
          allLines={allLines}
          sulekhLines={currentTab.data.sulekhLines}
          currentDisplayedText={currentDisplayedText}
          selectedLineIndex={selectedLineIndex}
          isDeleteMode={isDeleteMode}
          linesToDelete={linesToDelete}
          onSelectLine={selectLine}
          onAddToSelectedLines={addToSelectedLines}
          onToggleDeleteMode={toggleDeleteMode}
          onToggleLineForDeletion={toggleLineForDeletion}
          onDeleteSelectedLines={deleteSelectedLines}
          setIsInputPanelFocused={setIsInputPanelFocused}
        />

        <SelectedLinesPanel
          selectedLines={selectedLines}
          onRemoveLine={removeSelectedLine}
          onDisplayLine={setCurrentDisplayedText}
          currentDisplayedText={currentDisplayedText}
          currentKirtan={currentTab.data.currentKirtan}
          relatedPads={currentTab.data.relatedPads}
          onSelectRelatedPad={handleSelectKirtan}
        />
      </div>

      <OutputArea
        content={currentDisplayedText}
        onContentChange={setCurrentDisplayedText}
        editorSettings={editorSettings}
        overlayActive={overlayActive}
      />

      <InputModal
        isOpen={inputModalOpen}
        onClose={() => setInputModalOpen(false)}
        onProcessText={processText}
        currentText={originalInputText}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        editorSettings={editorSettings}
        onUpdateEditorSettings={updateEditorSettings}
      />

      <VmixModal
        isOpen={vmixModalOpen}
        onClose={() => setVmixModalOpen(false)}
        onSave={saveVmixSettings}
        settings={vmixSettings}
      />

      <KirtanEntryEnhanced
        isOpen={kirtanEntryOpen}
        editKirtan={editingKirtan}
        onClose={(saved) => {
          setKirtanEntryOpen(false);
          setEditingKirtan(null);
        }}
      />

      <PDFImport
        isOpen={pdfImportOpen}
        onClose={(saved) => {
          setPdfImportOpen(false);
        }}
      />

      <PinModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handlePinSuccess}
        title={
          pendingAction === 'addKirtan' ? 'Enter PIN to Add Kirtan' :
            pendingAction === 'database' ? 'Enter PIN to Access Database' :
              pendingAction === 'import' ? 'Enter PIN to Import' :
                'Enter PIN'
        }
      />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const navigate = useNavigate();

  // Shared kirtan state for cross-page communication
  const [pendingKirtanSelection, setPendingKirtanSelection] = useState(null);
  const [pendingKirtanEdit, setPendingKirtanEdit] = useState(null);

  const handleKirtanSelectionHandled = useCallback(() => setPendingKirtanSelection(null), []);
  const handleKirtanEditHandled = useCallback(() => setPendingKirtanEdit(null), []);

  useEffect(() => {
    if (isAuthenticated) {
      // Don't force navigate — let the user stay on their current route
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login onLogin={(status) => {
            setIsAuthenticated(status);
            localStorage.setItem('isAuthenticated', status);
          }} />
        }
      />
      <Route
        path="/database"
        element={
          isAuthenticated
            ? <DatabasePage onEditKirtan={(kirtan) => {
              setPendingKirtanEdit(kirtan);
              navigate('/');
            }} />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/search"
        element={
          isAuthenticated
            ? <KirtanSearch
              onSelectKirtan={(kirtan) => {
                setPendingKirtanSelection(kirtan);
              }}
              onEditKirtan={(kirtan) => {
                setPendingKirtanEdit(kirtan);
              }}
            />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated
            ? <MainApp
              onLogout={handleLogout}
              pendingKirtanSelection={pendingKirtanSelection}
              onKirtanSelectionHandled={handleKirtanSelectionHandled}
              pendingKirtanEdit={pendingKirtanEdit}
              onKirtanEditHandled={handleKirtanEditHandled}
            />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

const scrollToLine = (index, isShortcutKadi = false) => {
  setTimeout(() => {
    const selector = isShortcutKadi
      ? `.selected-line:nth-child(${index + 1})`
      : `.line-item:nth-child(${index + 2})`;
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 50);
};

export default App;