import React, { useEffect, useState } from 'react';
import './splash.style.css'
import { Navigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="App">
      {loading ? (
        <div className="splash-screen">
          <img src="/logo.png" alt="" className="logo" />
        </div>
      ) : (
        <Navigate to="/login" />
      )}
    </div>
  )
};

export default SplashScreen;