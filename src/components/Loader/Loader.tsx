import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const loaderStyles: React.CSSProperties = {
  zIndex: 1500, 
  color: '#000000',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const Loader: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <div style={open ? loaderStyles : { display: 'none' }}>
      <CircularProgress color="inherit" />
    </div>
  );
};

export default Loader;
