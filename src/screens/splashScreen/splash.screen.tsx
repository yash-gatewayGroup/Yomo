import React, { useEffect, useState } from "react";
import "./splash.style.css";
import { Navigate } from "react-router-dom";
import Logo from "../../assets/MainLogo.png";
import { CircularProgress } from "@mui/material";

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
    <div className="App">
      {loading ? (
        <div className="splash-screen">
          <img src={Logo} alt="" className="logo" />
        </div>
      ) : (
        <div className="splash-screen">
          <CircularProgress color="primary" size={50} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          width: "100%",
          textAlign: "center",
          fontSize: '12px',
          fontFamily: 'Public Sans',
          color: "#444444",
          fontWeight: "400"
        }}
      >
        Copyright @ 2024. All Rights Reserved.
      </div>
    </div>
  );
};

export default SplashScreen;
