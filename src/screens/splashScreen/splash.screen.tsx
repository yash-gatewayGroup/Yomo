import React, { useEffect, useState } from "react";
import Logo from "../../assets/MainLogo.png";
import { CircularProgress } from "@mui/material";
import { strings } from "../../theme/string";

const SplashScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const verifyToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.replace("/dashboard");
    } else {
      window.location.replace("/login");
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      verifyToken();
    }, 2000);
  }, []);

  return (
    <div className="splash-container">
      <div className="splash-content">
        {loading ? <img src={Logo} alt="" className="splash-logo" /> : <CircularProgress color="primary" size={50} />}
      </div>
      <div className="copyright-text">{strings.Copyright}</div>
    </div>
  );
};

export default SplashScreen;
