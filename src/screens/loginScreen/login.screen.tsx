import React, { useState, useEffect } from "react";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import "./style.css";
import logo from "../../assets/MainLogo.png";
import firebase from "firebase/compat/app";
import toast, { Toaster } from "react-hot-toast";
import { colors } from "../../theme/colors";

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const navigate = useNavigate();

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

  // Sent OTP
  const signin = () => {
    setIsLoading(true);
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
    const isValidPhoneNumber = /^\d{10}$/.test(cleanedPhoneNumber);
    isValidPhoneNumber
      ? (() => {
          try {
            const PhoneNo = "+91" + phoneNumber;
            // navigate(`/otpscreen/${PhoneNo}`);
            let verify = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
              size: "invisible",
              siteKey: "6LfncGApAAAAAKz0aB2EZ6_yDYWrByfrPVto9GFE",
            });
            firebase
              .auth()
              .signInWithPhoneNumber(PhoneNo, verify)
              .then((result) => {
                localStorage.setItem("userCredentialId", result.verificationId);
                toast.success("sucessfully send the message.", {
                  style: { fontFamily: "Public Sans", color: colors.theme_color, fontWeight: "400px", fontSize: "14px" },
                });
                setIsLoading(false);
                navigate(`/otpscreen/${PhoneNo}`);
                window.location.reload();
              })
              .catch((err) => {
                setIsLoading(false);
                console.log(err);
                alert(err);
                // window.location.reload();
              });
          } catch (error) {
            console.error(error);
          }
        })()
      : (() => {
          toast.error("Please enter a valid 10-digit phone number.", {
            style: { fontFamily: "Public Sans", color: colors.theme_color, fontWeight: "400px", fontSize: "14px" },
          });
          setIsLoading(false);
        })();
  };

  return (
    <div className="main">
      <Toaster position="bottom-center" reverseOrder={false} />
      <div style={{ height: "100%", width: "100%" }}>
        <div className="img-container">
          <img
            src={logo}
            style={{
              width: "30%",
            }}
            alt="Logo"
          />
        </div>
        <div className="text-container">Branding</div>
      </div>
      <div id="recaptcha-container"></div>

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
          <LoginButtonComponent variant="contained" onClick={signin} name="Login" isSaving={isLoading} />
        </div>
      </div>
      <div className="footer">
        Privacy Policy, Terms & Conditions
        <br />
        Copyright @ 2024 All Rights Reserved
      </div>
    </div>
  );
};
export default Login;
