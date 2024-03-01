import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoginButtonComponent from "../../components/Button/Button";
import OtpInput from "react-otp-input";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth, db, newTimestamp } from "../../firebase";
import { CircularProgress } from "@mui/material";
import Header from "../../components/Header/Header";

interface OtpVerificationParams {
  phoneNumber?: string;
}

// auth.settings.appVerificationDisabledForTesting = true;

const Otpscreen: React.FC = () => {
  const navigate = useNavigate();
  const { phoneNumber } = useParams<{ phoneNumber?: string }>();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isModalVisible, setModalVisibility] = useState<boolean>(true);
  const [otp, setOtp] = useState("");
  const [resendBtnDisabled, setResendBtnDisabled] = useState(true);
  const [countDown, setCountDown] = useState(50);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        sendOtp();
      }
    };
    verifyToken();
  }, []);

  useEffect(() => {
    let intervalId: any;
    if (resendBtnDisabled && countDown > 0) {
      intervalId = setInterval(() => {
        setCountDown(countDown - 1);
      }, 1000);
    } else {
      clearInterval(intervalId);
      setResendBtnDisabled(false);
      setCountDown(30);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [resendBtnDisabled, countDown]);

  const sendOtp = async () => {
    let verify = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "visible",
      callback: (response: any) => {},
      "expired-callback": () => {},
      siteKey: "6LfncGApAAAAAKz0aB2EZ6_yDYWrByfrPVto9GFE",
    });

    const formattedPhoneNumber: string = phoneNumber || "DefaultPhoneNumber";
    signInWithPhoneNumber(auth, formattedPhoneNumber, verify)
      .then((result) => {
        setConfirmationResult(result);
        setModalVisibility(false);
        setResendBtnDisabled(true);
      })
      .catch((err) => {
        console.log(err);
        if (err.code === "auth/network-request-failed") {
          alert(err.code);
        } else {
          console.log("An unexpected error occurred. Please try again later.");
        }
        setModalVisibility(false);
      });
  };

  const checkAndAddUser = async (user: any) => {
    setIsLoading(true);
    try {
      const querySnapshot = await db.collection("users").where("phoneNumber", "==", phoneNumber).get();

      if (querySnapshot.empty) {
        // If phoneNumber is not present
        await db
          .collection("users")
          .add({
            phoneNumber: phoneNumber,
            uid: user.uid,
            timestamp: newTimestamp,
          })
          .then((docRef: any) => {
            const userCollectionId = docRef.id;
            console.log(userCollectionId);
            localStorage.setItem("token", user.accessToken);
            localStorage.setItem("userCollectionId", userCollectionId);
            navigate("/welcome");
            window.location.reload();
          })
          .catch((err: any) => {
            console.log("Error from catch block", err);
          });
      } else {
        // If phoneNumber is present
        let documentIdFound = false;
        querySnapshot.forEach((doc: any) => {
          const userCollectionId = doc.data();
          localStorage.setItem("token", user.accessToken);
          localStorage.setItem("databaseId", userCollectionId.documentId);
          documentIdFound = true;
          navigate("/dashboard");
          window.location.reload();
        });

        if (!documentIdFound) {
          // If phoneNumber is present but documentId is not present
          await db
            .collection("users")
            .add({
              phoneNumber: phoneNumber,
              uid: user.uid,
              timestamp: newTimestamp,
            })
            .then((docRef: any) => {
              const userCollectionId = docRef.id;
              console.log(userCollectionId);
              localStorage.setItem("token", user.accessToken);
              localStorage.setItem("userCollectionId", userCollectionId);
              navigate("/welcome");
              window.location.reload();
            })
            .catch((err: any) => {
              console.log("Error from catch block", err);
            });
        }
      }
    } catch (error) {
      console.error("Error checking and adding user:", error);
    }
  };

  const handleVerify = async () => {
    if (otp === null) return;
    try {
      if (confirmationResult) {
        setIsLoading(true);
        confirmationResult
          .confirm(otp)
          .then((credential) => {
            const user = credential;
            if (user.user) {
              checkAndAddUser(user.user);
            }
          })
          .catch((err) => {
            setIsLoading(false);
            console.log("Verification Unsuccessful,User", err);
          });
      } else {
        setIsLoading(false);
        console.error("Confirmation result is null");
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Verification failed:", error);
      if (error.code === "auth/invalid-verification-code") {
        alert("The OTP you have Entered is Invalid");
      }
    }
  };

  return (
    <>
      {isModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <div id="recaptcha-container">
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="modal">
          <CircularProgress />
        </div>
      )}
      <Header showLogo={true} showBackButton={true} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#000000",
        }}
      >
        <div
          style={{
            height: "20%",
            display: "flex",
            width: "90%",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              fontFamily: "Public Sans",
              fontSize: 24,
              fontWeight: "bold",
              color: "#FFFFFF",
            }}
          >
            Got it, please confirm your number
          </h2>
          <h5
            style={{
              fontFamily: "Public Sans",
              color: "#A8A8A8",
              fontWeight: "400",
              fontSize: 14,
            }}
          >
            We've sent a 6-digit code to your Mobile No. Please <br />
            enter the code in the box below to verify your number
          </h5>
        </div>
        <div
          style={{
            height: "50%",
            display: "flex",
            width: "90%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
          }}
        >
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            shouldAutoFocus={true}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
            inputStyle={{
              height: "100%",
              width: "100%",
              fontSize: 15,
              margin: "10px 0",
              backgroundColor: "transparent",
              border: "1px solid #ffffff",
              outline: "none",
              color: "#FFFFFF",
              fontFamily: "Public Sans",
              fontWeight: "400",
            }}
          />
        </div>
        <div
          style={{
            height: "20%",
            display: "flex",
            width: "90%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoginButtonComponent variant="contained" onClick={handleVerify} name="Verify" />
          <button
            style={{
              cursor: "pointer",
              border: "none",
              backgroundColor: "transparent",
              marginTop: "10px",
              fontSize: "14px",
              textDecoration: "underline",
            }}
            disabled={resendBtnDisabled}
            onClick={() => {}}
          >
            <p
              style={{
                color: "#666666",
                fontWeight: "500",
                fontSize: 16,
                fontFamily: "Public Sans",
              }}
            >
              Resend Code: {countDown > 0 && countDown < 130 && `${countDown}s`}
            </p>
          </button>
        </div>
      </div>
    </>
  );
};
export default Otpscreen;
