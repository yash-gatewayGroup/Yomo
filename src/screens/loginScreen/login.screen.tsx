import React, { useState, useEffect } from "react";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { CircularProgress } from "@mui/material";
import logo from "../../assets/MainLogo.png";

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  React.useEffect(() => {
    const handleBackButton = (event: any) => {
      event.preventDefault();
      window.location.href = "/";
    };
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        window.location.replace("/dashboard");
      }
    };
    verifyToken();
  }, []);

  const navigate = useNavigate();
  const handleNext = async () => {
    setIsLoading(true);
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
    const isValidPhoneNumber = /^\d{10}$/.test(cleanedPhoneNumber);
    isValidPhoneNumber
      ? (() => {
          try {
            const PhoneNo = "+91" + phoneNumber;
            navigate(`/otpscreen/${PhoneNo}`);
          } catch (error) {
            console.error(error);
            setIsLoading(false);
          }
        })()
      : (() => {
          alert("Please enter a valid 10-digit phone number.");
          setIsLoading(false);
        })();
  };

  return (
    <>
      {isLoading ? (
        <div className="loading-main-container">
          <CircularProgress />
        </div>
      ) : (
        <div className="main">
          <div className="img-container">
            <div style={{ height: "`100%", width: "100%" }}>
              <img
                src={logo}
                style={{
                  width: "40%",
                }}
                alt="Logo"
              />
            </div>
            <div className="text-container">Branding</div>
          </div>

          <div className="otp-container">
            <TextBoxComponent
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value)}
              label="Mobile No."
              variant="outlined"
              color="white"
              fullWidth
              style={{
                borderRadius: "8px",
                width: "90%",
                fontSize: 16,
              }}
              placeholder={"+91 xxxx xxxx xx"}
            />
            <div className="buttonContainer">
              <LoginButtonComponent variant="contained" onClick={handleNext} name="Save" />
            </div>
          </div>
          <div className="footer">
            Privacy Policy, Terms & Conditions
            <br />
            Copyright @ 2024 All Rights Reserved
          </div>
        </div>
      )}
    </>
  );
};
export default Login;
