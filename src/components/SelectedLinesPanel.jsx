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
        Selection & Related
      </div>

      {/* Scrollable Content */}
      {/* Scrollable Content Container */}
      <div className="selected-lines-container">

        {/* Top Section: Shortcut Kadis (Grid) */}
        <div className="shortcuts-section">
          <h4 className="section-title">Shortcut Kadis</h4>
          <div className={`shortcuts-grid ${selectedLines.length > 6 ? 'scrollable' : ''}`}>
            {selectedLines.length === 0 ? (
              <p className="panel-placeholder">Select lines to add shortcuts</p>
            ) : (
              selectedLines.map((line, index) => {
                const isObject = typeof line !== 'string';
                const displayText = isObject ? (line.unicode || '') : line;
                const outputText = isObject ? (line.sulekh || line.unicode) : line;
                const hindiText = isObject ? (line.hindi || '') : '';

                // Determine if this card is the one currently shown in the Output Area
                const isCurrentOutput = outputText === currentDisplayedText ||
                  (hindiText && hindiText === currentDisplayedText);

                return (
                  <div
                    key={index}
                    data-index={index}
                    className={`selected-line-card ${isCurrentOutput ? 'output-active' : ''
                      }`}
                    onClick={() => {
                      onDisplayLine(outputText);
                    }}
                  >
                    <div className="line-number-badge">{index + 1}</div>
                    <div className="line-text-compact" title={displayText.trim()}>{displayText.trim()}</div>
                    <div
                      className="remove-btn-compact"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLine(index);
                      }}
                    >
                      ×
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Section: Related Pads (List) */}
        <div className="siblings-section">
          <div className="siblings-header">
            <h4 className="section-title">Sibling Kirtans / Pads</h4>
            {currentKirtan && (
              <span className="current-pad-badge">Current: Pad {currentKirtan.pad || 'N/A'}</span>
            )}
          </div>

          <div className="siblings-list">
            {relatedPads.length === 0 ? (
              <div className="empty-siblings">No sibling kirtans found</div>
            ) : (
              relatedPads.map((pad, index) => (
                <div
                  key={pad.id}
                  className={`related-pad-item-compact ${currentKirtan && pad.id === currentKirtan.id ? 'active-sibling' : ''}`}
                  onClick={() => onSelectRelatedPad && onSelectRelatedPad(pad)}
                >
                  <div className="pad-number-compact">
                    {pad.pad || index + 1}
                  </div>
                  <div className="pad-info">
                    <div className="pad-title-compact">
                      {pad.unicodeTitle || pad.sulekhTitle || 'Untitled'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SelectedLinesPanel;