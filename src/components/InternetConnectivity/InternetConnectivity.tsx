import React, { useState, useEffect } from 'react';
import "./InternetConnectivity.css"

const InternetConnectivity: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="internet-disconnected-popup">
          <p>You are offline. Please check your internet connection.</p>
        </div>
      )}
    </>
  );
};

export default InternetConnectivity;
