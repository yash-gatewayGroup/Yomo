import React from 'react';

interface HeaderProps {
    activePage: number;
}

const TopPageNumber: React.FC<HeaderProps> = ({ activePage,  }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff00',height:"30%" }}>
          {[1, 2, 3].map((pageNumber) => (
            <button
              key={pageNumber}
              style={{
                    margin: '0 8px',
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: pageNumber === activePage ? '#007bff' : '#eee',
                    color: pageNumber === activePage ? '#fff' : '#A9A9A9',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    outline: 'none', 
                    fontWeight: 600,
                    fontSize: 14
                  }}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      );
    };

export default TopPageNumber;