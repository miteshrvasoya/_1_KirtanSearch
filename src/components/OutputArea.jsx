import React, { useEffect, useRef } from 'react';
import '../styles/OutputArea.css';

const OutputArea = ({ content, onContentChange, editorSettings, overlayActive }) => {
  const outputRef = useRef(null);

  // Auto-resize text to fit container (Single Line Logic)
  useEffect(() => {
    const resizeText = () => {
      if (!outputRef.current) return;
      
      const element = outputRef.current;
      // Start with the configured font size
      let fontSize = parseInt(editorSettings.fontSize || 60);
      element.style.fontSize = `${fontSize}px`;
      element.style.whiteSpace = 'nowrap'; // Force single line initially
      
      // Reduce font size until content fits both width and height
      // We check scrollWidth > clientWidth for horizontal overflow
      // We check scrollHeight > clientHeight for vertical overflow (though less likely with single line)
      while (
        (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) && 
        fontSize > 10 // Minimum legible font size
      ) {
        fontSize -= 1;
        element.style.fontSize = `${fontSize}px`;
      }
    };

    resizeText();
    window.addEventListener('resize', resizeText);
    return () => window.removeEventListener('resize', resizeText);
  }, [content, editorSettings.fontSize, editorSettings.fontFamily, editorSettings.isBold]);

  const outputStyle = {
    color: editorSettings.textColor || '#000000',
    backgroundColor: editorSettings.bgColor || '#f2cfa6',
    fontFamily: editorSettings.fontFamily,
    fontWeight: editorSettings.isBold ? 'bold' : 'normal',
    fontStyle: editorSettings.isItalic ? 'italic' : 'normal',
    textDecoration: editorSettings.isUnderline ? 'underline' : 'none',
    textAlign: editorSettings.textAlign,
    lineHeight: '1.2'
  };

  return (
    <div className={`output-container ${overlayActive ? 'overlay-active' : ''}`}>
      <div
        ref={outputRef}
        className="output-content"
        style={outputStyle}
        // data-placeholder="ÁÒ Ùä sÕâãÑÌâÓâÒÇ"
        // dangerouslySetInnerHTML={{ __html: content || 'ÁÒ Ùä sÕâãÑÌâÓâÒÇ' }}
        onInput={(e) => onContentChange(e.target.innerHTML)}
      >
        <div className="output-content-div">
          {content || 'ÁÒ Ùä sÕâãÑÌâÓâÒÇ'}
        </div>
      </div>
    </div>
  );
};

export default OutputArea;