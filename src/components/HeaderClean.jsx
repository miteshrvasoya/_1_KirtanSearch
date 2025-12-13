import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderClean = ({ 
  onOpenInputModal, 
  onOpenSettingsModal, 
  onOpenVmixModal, 
  onOpenDatabase, 
  onOpenKirtanSearch,
  onAddNewKirtan,
  onOpenPDFImport,
  onLogout 
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setTimeout(() => {
      navigate('/login');
    }, 100);
  };

  const handleSearchClick = () => {
    if (onOpenKirtanSearch) {
      onOpenKirtanSearch();
    }
    setSearchQuery('');
  };

  // All styles inline to avoid CSS conflicts
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    background: 'linear-gradient(90deg, #1CB5E0 0%, #000851 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    zIndex: 9999,
    minHeight: '70px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const leftStyle = {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto'
  };

  const h1Style = {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap'
  };

  const centerStyle = {
    display: 'flex',
    flex: '1',
    justifyContent: 'center',
    margin: '0 40px'
  };

  const searchBarStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 1)',
    borderRadius: '50px',
    padding: '10px 25px',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '500px',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease'
  };

  const searchIconStyle = {
    marginRight: '12px',
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: '1.1rem'
  };

  const searchInputStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    outline: 'none',
    width: '100%',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 500
  };

  const rightStyle = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    flex: '0 0 auto',
    alignItems: 'center'
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    transition: 'all 0.3s',
    backdropFilter: 'blur(5px)'
  };

  const logoutButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 50, 50, 0.2)',
    borderColor: 'rgba(255, 50, 50, 0.3)'
  };

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <h1 style={h1Style}>Kirtan Kadi App</h1>
      </div>
      
      <div style={centerStyle}>
        <div 
          style={searchBarStyle} 
          onClick={handleSearchClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.1)';
          }}
        >
          <i className="fas fa-search" style={searchIconStyle}></i>
          <input
            type="text"
            placeholder="Search kirtans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchClick}
            readOnly
            style={searchInputStyle}
          />
        </div>
      </div>
      
      <div style={rightStyle}>
        <button 
          style={buttonStyle} 
          onClick={onOpenSettingsModal}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <i className="fas fa-cog"></i> Settings
        </button>
        <button 
          style={buttonStyle} 
          onClick={onOpenVmixModal}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <i className="fas fa-video"></i> vMix
        </button>
        <button 
          style={buttonStyle} 
          onClick={onOpenDatabase}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <i className="fas fa-database"></i> Database
        </button>
        <button 
          style={logoutButtonStyle} 
          onClick={handleLogout}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 50, 50, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 50, 50, 0.2)'}
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
};

export default HeaderClean;