import React, { useState, useEffect } from 'react';
import '../styles/InputModal.css';
import { 
  convertUnicodeToSulekh, 
  convertSulekhToUnicode, 
  isUnicodeGujarati,
  isSulekhText 
} from '../utils/fontConverter';

const InputModal = ({ 
  isOpen, 
  onClose, 
  onProcessText,
  currentText
}) => {
  const [inputText, setInputText] = useState('');
  const [detectedFormat, setDetectedFormat] = useState('unknown');
  const [output1Text, setOutput1Text] = useState('');
  const [output2Text, setOutput2Text] = useState('');
  const [output1Format, setOutput1Format] = useState('unicode');
  const [output2Format, setOutput2Format] = useState('sulekh');
  const [selectedFormat, setSelectedFormat] = useState('input'); // 'input', 'output1', 'output2'

  useEffect(() => {
    if (isOpen && currentText) {
      setInputText(currentText);
      detectAndConvert(currentText);
    }
  }, [isOpen, currentText]);

  const detectAndConvert = (text) => {
    if (!text || !text.trim()) {
      setDetectedFormat('unknown');
      setOutput1Text('');
      setOutput2Text('');
      return;
    }

    let format = 'unknown';
    if (isUnicodeGujarati(text)) {
      format = 'unicode';
    } else if (isSulekhText(text)) {
      format = 'sulekh';
    } else {
      format = /[a-zA-Z]/.test(text) ? 'gujlish' : 'unknown';
    }

    setDetectedFormat(format);

    if (format === 'unicode') {
      setOutput1Format('sulekh');
      setOutput2Format('gujlish');
      setOutput1Text(convertUnicodeToSulekh(text));
      setOutput2Text('');
    } else if (format === 'sulekh') {
      setOutput1Format('unicode');
      setOutput2Format('gujlish');
      setOutput1Text(convertSulekhToUnicode(text));
      setOutput2Text('');
    } else if (format === 'gujlish') {
      setOutput1Format('unicode');
      setOutput2Format('sulekh');
      setOutput1Text('');
      setOutput2Text('');
    } else {
      setOutput1Format('unicode');
      setOutput2Format('sulekh');
      setOutput1Text('');
      setOutput2Text('');
    }
  };

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);
    detectAndConvert(newText);
  };

  const handleProcess = () => {
    if (!inputText.trim()) return;
    
    let textToProcess = inputText;
    
    // Use selected format
    if (selectedFormat === 'output1' && output1Text) {
      textToProcess = output1Text;
    } else if (selectedFormat === 'output2' && output2Text) {
      textToProcess = output2Text;
    }
    
    // Always convert to Sulekh for processing
    if (detectedFormat === 'unicode' || (selectedFormat === 'output1' && output1Format === 'unicode')) {
      textToProcess = convertUnicodeToSulekh(textToProcess);
    }
    
    onProcessText(textToProcess);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const getFormatLabel = (format) => {
    const labels = {
      'unicode': 'Unicode Gujarati',
      'sulekh': 'Sulekh Font',
      'gujlish': 'Gujlish',
      'unknown': 'Unknown'
    };
    return labels[format] || 'Unknown';
  };

  const getFontFamily = (format) => {
    const fonts = {
      'unicode': "'Noto Sans Gujarati', 'Shruti', sans-serif",
      'sulekh': "'Guj_Regular_Bold_Sulekh', sans-serif",
      'gujlish': "'Arial', sans-serif"
    };
    return fonts[format] || "'Arial', sans-serif";
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '1400px', width: '98%', maxHeight: '98vh', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#111827' }}>📝 Text Input & Converter</h2>
          <button 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              lineHeight: '1'
            }}
          >×</button>
        </div>
        
        {/* 3-Column Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px',
          height: 'calc(98vh - 180px)',
          minHeight: '600px'
        }}>
          
          {/* Input Box */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '3px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              background: 'white',
              borderRadius: '10px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '12px 15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>INPUT</div>
                  <div style={{ fontSize: '15px', color: 'white', fontWeight: '700', marginTop: '2px' }}>
                    {getFormatLabel(detectedFormat)}
                  </div>
                </div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  <input 
                    type="radio" 
                    name="format" 
                    checked={selectedFormat === 'input'}
                    onChange={() => setSelectedFormat('input')}
                    style={{ margin: 0 }}
                  />
                  Use This
                </label>
              </div>
              
              {/* Textarea */}
              <textarea
                value={inputText}
                onChange={handleInputChange}
                placeholder="📋 Paste or type your text here...&#10;&#10;✨ Format will be auto-detected!"
                style={{ 
                  fontFamily: getFontFamily(detectedFormat),
                  fontSize: '17px',
                  padding: '15px',
                  border: 'none',
                  flex: 1,
                  resize: 'none',
                  outline: 'none',
                  backgroundColor: '#fafafa',
                  color: '#111827',
                  lineHeight: '1.6'
                }}
              />
              
              {/* Footer Stats */}
              <div style={{
                padding: '8px 15px',
                background: '#f3f4f6',
                borderTop: '1px solid #e5e7eb',
                fontSize: '11px',
                color: '#6b7280',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{inputText.length} characters</span>
                <span>{inputText.split('\n').length} lines</span>
              </div>
            </div>
          </div>

          {/* Output 1 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            padding: '3px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              background: 'white',
              borderRadius: '10px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '12px 15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>OUTPUT 1</div>
                  <div style={{ fontSize: '15px', color: 'white', fontWeight: '700', marginTop: '2px' }}>
                    {getFormatLabel(output1Format)}
                  </div>
                </div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: output1Text ? 'pointer' : 'not-allowed',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'white',
                  fontWeight: '600',
                  opacity: output1Text ? 1 : 0.5
                }}>
                  <input 
                    type="radio" 
                    name="format" 
                    checked={selectedFormat === 'output1'}
                    onChange={() => output1Text && setSelectedFormat('output1')}
                    disabled={!output1Text}
                    style={{ margin: 0 }}
                  />
                  Use This
                </label>
              </div>
              
              {/* Textarea */}
              <textarea
                readOnly
                value={output1Text}
                placeholder={`✨ ${getFormatLabel(output1Format)} conversion will appear here...`}
                style={{ 
                  fontFamily: getFontFamily(output1Format),
                  fontSize: '17px',
                  padding: '15px',
                  border: 'none',
                  flex: 1,
                  resize: 'none',
                  outline: 'none',
                  backgroundColor: '#fafafa',
                  color: '#111827',
                  cursor: 'default',
                  lineHeight: '1.6'
                }}
              />
              
              {/* Footer Stats */}
              <div style={{
                padding: '8px 15px',
                background: '#f3f4f6',
                borderTop: '1px solid #e5e7eb',
                fontSize: '11px',
                color: '#6b7280',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{output1Text.length} characters</span>
                <span>✅ Auto-converted</span>
              </div>
            </div>
          </div>

          {/* Output 2 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            background: output2Format === 'gujlish' 
              ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' 
              : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            borderRadius: '12px',
            padding: '3px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            opacity: output2Format === 'gujlish' ? 0.7 : 1
          }}>
            <div style={{ 
              background: 'white',
              borderRadius: '10px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: output2Format === 'gujlish' 
                  ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' 
                  : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                padding: '12px 15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', fontWeight: '500' }}>
                    OUTPUT 2 {output2Format === 'gujlish' && '🚧'}
                  </div>
                  <div style={{ fontSize: '15px', color: '#111827', fontWeight: '700', marginTop: '2px' }}>
                    {getFormatLabel(output2Format)}
                  </div>
                </div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: output2Text ? 'pointer' : 'not-allowed',
                  background: 'rgba(0,0,0,0.1)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#111827',
                  fontWeight: '600',
                  opacity: output2Text ? 1 : 0.5
                }}>
                  <input 
                    type="radio" 
                    name="format" 
                    checked={selectedFormat === 'output2'}
                    onChange={() => output2Text && setSelectedFormat('output2')}
                    disabled={!output2Text}
                    style={{ margin: 0 }}
                  />
                  Use This
                </label>
              </div>
              
              {/* Textarea */}
              <textarea
                readOnly
                value={output2Text}
                placeholder={output2Format === 'gujlish' 
                  ? '🚧 Gujlish conversion coming soon...' 
                  : `✨ ${getFormatLabel(output2Format)} conversion will appear here...`}
                style={{ 
                  fontFamily: getFontFamily(output2Format),
                  fontSize: '17px',
                  padding: '15px',
                  border: 'none',
                  flex: 1,
                  resize: 'none',
                  outline: 'none',
                  backgroundColor: output2Format === 'gujlish' ? '#fafafa' : '#fafafa',
                  color: output2Format === 'gujlish' ? '#9ca3af' : '#111827',
                  fontStyle: output2Format === 'gujlish' ? 'italic' : 'normal',
                  cursor: 'default',
                  lineHeight: '1.6'
                }}
              />
              
              {/* Footer Stats */}
              <div style={{
                padding: '8px 15px',
                background: '#f3f4f6',
                borderTop: '1px solid #e5e7eb',
                fontSize: '11px',
                color: '#6b7280',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{output2Text.length} characters</span>
                <span>{output2Format === 'gujlish' ? '⏳ Coming Soon' : '✅ Auto-converted'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Bar */}
        <div style={{
          marginTop: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px'
        }}>
          {/* Info */}
          {detectedFormat !== 'unknown' && (
            <div style={{
              flex: 1,
              padding: '10px 15px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#1e40af',
              fontWeight: '500'
            }}>
              ✨ <strong>Detected:</strong> {getFormatLabel(detectedFormat)} | 
              <strong> Selected:</strong> {selectedFormat === 'input' ? getFormatLabel(detectedFormat) : selectedFormat === 'output1' ? getFormatLabel(output1Format) : getFormatLabel(output2Format)}
            </div>
          )}
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleClose}
              style={{ minWidth: '100px' }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleProcess}
              disabled={!inputText.trim()}
              style={{ minWidth: '150px' }}
            >
              Process Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputModal;