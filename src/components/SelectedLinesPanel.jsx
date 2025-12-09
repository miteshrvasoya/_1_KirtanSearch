import React, { useEffect } from 'react';
import '../styles/SelectedLinesPanel.css';

const SelectedLinesPanel = ({
  selectedLines,
  onRemoveLine,
  onDisplayLine,
  currentDisplayedText,
  currentKirtan = null,
  relatedPads = [],
  onSelectRelatedPad
}) => {
  // Auto-scroll when selection changes
  useEffect(() => {
    if (selectedLines.length > 0 && currentDisplayedText) {
      const index = selectedLines.findIndex(line => line === currentDisplayedText);
      if (index >= 0) {
        const container = document.querySelector('.selected-lines-content');
        const element = document.querySelector(`.selected-line[data-index="${index}"]`);

        if (element && container) {
          const containerHeight = container.clientHeight;
          const elementTop = element.offsetTop;
          const elementHeight = element.clientHeight;

          const scrollToPosition = elementTop - (containerHeight / 3) + (elementHeight / 2);

          container.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentDisplayedText, selectedLines]);

  // Determine what to show: manual selection or related pads
  const showRelatedPads = currentKirtan && relatedPads.length > 0 && selectedLines.length === 0;

  return (
    <div className="display-panel">
      {/* Fixed Header */}
      <div className="panel-header">
        Shortcut Kadi
      </div>

      {/* Scrollable Content */}
      <div className="selected-lines-content">
        {showRelatedPads ? (
          // Show related pads
          <>
            <div className="related-pads-header">
              <h4>Related Pads</h4>
              <p className="current-pad-info">
                Current: Pad {currentKirtan.pad || 'N/A'}
              </p>
            </div>
            {relatedPads.map((pad, index) => (
              <div
                key={pad.id}
                className="related-pad-item"
                onClick={() => onSelectRelatedPad && onSelectRelatedPad(pad)}
              >
                <div className="pad-number">
                  {pad.pad || index + 1}
                </div>
                <div className="pad-info">
                  <div className="pad-title">
                    {pad.unicodeTitle || pad.sulekhTitle || 'Untitled'}
                  </div>
                </div>
                <div className="pad-arrow">→</div>
              </div>
            ))}
          </>
        ) : selectedLines.length === 0 ? (
          <p className="panel-placeholder">Selected lines will appear here</p>
        ) : (
          // Show manually selected lines
          selectedLines.map((line, index) => (
            <div
              key={index}
              data-index={index}
              className={`selected-line ${currentDisplayedText === line ? 'selected' : ''}`}
              onClick={() => {
                onDisplayLine(line);
                const element = document.querySelector(`.selected-line[data-index="${index}"]`);
                element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }}
            >
              <div className="line-number">{index < 9 ? index + 1 : ''}</div>
              <div className="line-text">{line}</div>
              <div
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLine(index);
                }}
              >
                ×
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SelectedLinesPanel;