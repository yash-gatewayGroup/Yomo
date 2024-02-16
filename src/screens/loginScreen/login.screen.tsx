import React, { useState } from "react";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import TopPageNumber from "../../components/TopPageNumber/TopPageNumber";
import "./style.css";
import { db, newTimestamp } from "../../firebase";
import { CircularProgress } from "@mui/material";

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activePage, setActivePage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  const navigate = useNavigate();
  const checkAndAddUser = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const querySnapshot = await db
        .collection("users")
        .where("phoneNumber", "==", phoneNumber)
        .get();
      querySnapshot.empty
        ? (async () => {
            const docRef = await db.collection("users").add({
              phoneNumber: phoneNumber,
              timestamp: newTimestamp,
            });
            const userCollectionId = docRef.id;
            localStorage.setItem("userCollectionId", userCollectionId);
            navigate(`/otpscreen/${phoneNumber}`);
            setIsLoading(false);
          })()
        : (async () => {
            navigate("/dashboard");
            console.log(
              "User with phone number",
              phoneNumber,
              "already exists"
            );
            setIsLoading(false);
          })();
    } catch (error) {
      console.error("Error checking and adding user:", error);
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
    const isValidPhoneNumber = /^\d{10}$/.test(cleanedPhoneNumber);
    isValidPhoneNumber
      ? (() => {
          try {
            const PhoneNo = "+91" + phoneNumber;
            checkAndAddUser(PhoneNo);
            // navigate(`/otpscreen/${PhoneNo}`);
          } catch (error) {
            console.error(error);
            setIsLoading(false);
          }
          console.log(phoneNumber);
        })()
      : (() => {
          alert("Please enter a valid 10-digit phone number.");
          setIsLoading(false);
        })();
  };

  return (
    <>
      {isLoading ? (
        <div style={{justifyContent:"center",display:"flex",alignContent:"center"}}>
        <CircularProgress />
        </div>
      ) : (
        <div className="main">
          <TopPageNumber activePage={activePage} />
          <div className="logo-text">
            <h1>Logo</h1>
          </div>
          <div className="otp-container">
            <TextBoxComponent
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value)}
              label="Enter your phone number"
              variant="outlined"
              color="white"
              fullWidth
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                width: "89%",
                fontSize: 16,
              }}
              placeholder={"+91 xxxx xxxx xx"}
            />
            <div className="buttonContainer">
              <LoginButtonComponent
                onClick={handleNext}
                name="Next"
                variant="contained"
                style={{ width: "90%", height: "40%" }}
              />
            </div>
          </div>

          <div className="footer">
            <h5>
              Privacy Policy, Terms & Conditions
              <br />
              Copyright @ 2024 All Rights Reserved
            </h5>
          </div>
        </div>
      )}
    </>
  );
};
export default Login;
