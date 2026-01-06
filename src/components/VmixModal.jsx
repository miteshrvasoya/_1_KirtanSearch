import React, { useState } from 'react';
import '../styles/VmixModal.css';

const VmixModal = ({ isOpen, onClose, onSave, settings }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [testResult, setTestResult] = useState('');

    const handleSave = () => {
        onSave({
            inputNumber: parseInt(localSettings.inputNumber) || 1,
            inputName: localSettings.inputName || '',
            inputOverlay: Math.min(4, Math.max(1, parseInt(localSettings.inputOverlay || localSettings.overlayNumber) || 1)),
            sourceNumber: parseInt(localSettings.sourceNumber) || '',
            sourceTitle: localSettings.sourceTitle || '',
            sourceOverlay: Math.min(4, Math.max(1, parseInt(localSettings.sourceOverlay) || 1)),
            overlayNumber: Math.min(4, Math.max(1, parseInt(localSettings.overlayNumber) || 1)),
            ipAddress: localSettings.ipAddress || '127.0.0.1',
            port: parseInt(localSettings.port) || 8088
        });
    };

    const testOverlay = async () => {
        try {
          const { ipAddress, port, inputNumber, overlayNumber } = localSettings;
          
          // Trigger overlay ON
          const onResponse = await fetch(
            `http://${ipAddress}:${port}/api/?Function=OverlayInput${overlayNumber}In&Input=${inputNumber}`
          );
          if (!onResponse.ok) throw new Error('Failed to activate overlay');
          setTestResult("Overlay ON - check vMix");
      
          // Trigger overlay OFF after 3 seconds
          setTimeout(async () => {
            const offResponse = await fetch(
              `http://${ipAddress}:${port}/api/?Function=OverlayInput${overlayNumber}Out&Input=${inputNumber}`
            );
            if (!offResponse.ok) throw new Error('Failed to deactivate overlay');
            setTestResult("Overlay OFF - test complete");
          }, 3000);
      
        } catch (error) {
          setTestResult(`Overlay test failed: ${error.message}`);
        }
      };

    const testConnection = async () => {
        setTestResult("Testing connection...");

        try {
            const ipAddress = localSettings.ipAddress || '127.0.0.1';
            const port = localSettings.port || 8088;

            if (!ipAddress.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                throw new Error("Invalid IP address format");
            }

            const response = await fetch(`http://${ipAddress}:${port}/api`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const text = await response.text();
            if (text.includes('<vmix>')) {
                const version = text.match(/<version>(.*?)<\/version>/)?.[1] || 'unknown';
                setTestResult(`Connected to vMix ${version}`);
            } else {
                throw new Error("Invalid vMix response");
            }
        } catch (error) {
            setTestResult(`Connection failed: ${error.message}`);
            console.error("Connection error:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="vmix-modal">
            <div className="vmix-content">
                <h2>VMix Integration Settings</h2>

                <div className="vmix-controls">
                    {/* Input Section */}
                    <div className="vmix-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Input Settings</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="vmixInputNumber" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Number</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        type="number"
                                        id="vmixInputNumber"
                                        min="1"
                                        max="100"
                                        value={localSettings.inputNumber}
                                        onChange={(e) => setLocalSettings({ ...localSettings, inputNumber: e.target.value })}
                                        placeholder="#"
                                        style={{ flex: 1 }}
                                    />
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                        onClick={async () => {
                                            try {
                                                const { ipAddress, port, inputNumber } = localSettings;
                                                const response = await fetch(`http://${ipAddress}:${port}/api`);
                                                const text = await response.text();
                                                const parser = new DOMParser();
                                                const xmlDoc = parser.parseFromString(text, "text/xml");
                                                const input = xmlDoc.querySelector(`input[number="${inputNumber}"]`);
                                                if (input) {
                                                    setLocalSettings({ ...localSettings, inputName: input.textContent });
                                                    setTestResult(`Found: ${input.textContent}`);
                                                } else {
                                                    setTestResult(`Input ${inputNumber} not found`);
                                                }
                                            } catch (e) {
                                                setTestResult(`Error: ${e.message}`);
                                            }
                                        }}
                                    >
                                        ✓
                                    </button>
                                </div>
                            </div>
                            <div style={{ flex: 2 }}>
                                <label htmlFor="vmixInputName" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Name</label>
                                <input
                                    type="text"
                                    id="vmixInputName"
                                    value={localSettings.inputName || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, inputName: e.target.value })}
                                    placeholder="Input Name"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="vmixInputOverlay" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Overlay</label>
                                <input
                                    type="number"
                                    id="vmixInputOverlay"
                                    min="1"
                                    max="4"
                                    value={localSettings.inputOverlay || localSettings.overlayNumber || 1}
                                    onChange={(e) => setLocalSettings({ ...localSettings, inputOverlay: e.target.value })}
                                    placeholder="1-4"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Source Section */}
                    <div className="vmix-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Source Settings</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="vmixSourceNumber" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Number</label>
                                <input
                                    type="number"
                                    id="vmixSourceNumber"
                                    min="1"
                                    max="100"
                                    value={localSettings.sourceNumber || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, sourceNumber: e.target.value })}
                                    placeholder="#"
                                />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label htmlFor="vmixSourceTitle" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Title</label>
                                <input
                                    type="text"
                                    id="vmixSourceTitle"
                                    value={localSettings.sourceTitle || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, sourceTitle: e.target.value })}
                                    placeholder="Source Title"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="vmixSourceOverlay" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Overlay</label>
                                <input
                                    type="number"
                                    id="vmixSourceOverlay"
                                    min="1"
                                    max="4"
                                    value={localSettings.sourceOverlay || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, sourceOverlay: e.target.value })}
                                    placeholder="1-4"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="vmix-group">
                        <label htmlFor="vmixIpAddress">VMix IP Address</label>
                        <input
                            type="text"
                            id="vmixIpAddress"
                            value={localSettings.ipAddress}
                            onChange={(e) => setLocalSettings({ ...localSettings, ipAddress: e.target.value })}
                            placeholder="e.g., 192.168.1.100"
                        />
                    </div>

                    <div className="vmix-group">
                        <label htmlFor="vmixPort">Port (default: 8088)</label>
                        <input
                            type="number"
                            id="vmixPort"
                            value={localSettings.port}
                            onChange={(e) => setLocalSettings({ ...localSettings, port: e.target.value })}
                            placeholder="8088"
                        />
                    </div>
                </div>

                <div className="vmix-test">
                    <button className="btn btn-secondary" onClick={testConnection}>Test Connection</button>
                    <span className={testResult.includes('Connected') ? 'success' : 'error'}>{testResult}</span>
                </div>

                <div className="vmix-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
                    <button
                        className="btn btn-secondary"
                        onClick={async () => {
                            await testConnection();
                            await testOverlay();
                        }}
                        style={{ marginLeft: 'auto' }}
                    >
                        Test Overlay
                    </button>
                </div>
            </div>
        </div>

    );
};

export default VmixModal;