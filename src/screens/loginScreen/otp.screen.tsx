import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopPageNumber from "../../components/TopPageNumber/TopPageNumber";
import LoginButtonComponent from "../../components/Button/Button";
import OtpInput from "react-otp-input";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../../firebase";

interface OtpVerificationParams {
  phoneNumber?: string;
}

const Otpscreen: React.FC = () => {
  const navigate = useNavigate();
  const { phoneNumber } = useParams<{ phoneNumber?: string }>();
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isModalVisible, setModalVisibility] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<number>(2);
  const [otp, setOtp] = useState("");
  const [resendBtnDisabled, setResendBtnDisabled] = useState(true);
  const [countDown, setCountDown] = useState(30);

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

  useEffect(() => {
    setTimeout(sendOtp, 2000);
    return () => {
      console.log("Component will unmount.");
    };
  }, []);

  const sendOtp = async () => {
    let verify = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "normal",
      callback: (response: any) => {
        console.log("Verify Response", response);
        return response;
      },
      expiredCallback: (r: any) => {
        console.log("Expired-", r);
      },
    });

    const formattedPhoneNumber: string = phoneNumber || "DefaultPhoneNumber";
    signInWithPhoneNumber(auth, formattedPhoneNumber, verify)
      .then((result) => {
        setConfirmationResult(result);
        setModalVisibility(false);
        setResendBtnDisabled(true);
        window.confirm.toString();
      })
      .catch((err) => {
        console.log(err);
        if (err.code === "auth/network-request-failed") {
          alert(err.code);
        } else {
          console.log("An unexpected error occurred. Please try again later.");
        }
      });
  };

  const handleVerify = async () => {
    if (otp === null) return;
    try {
      if (confirmationResult) {
        confirmationResult
          .confirm(otp)
          .then((credential) => {
            const user = credential;
            localStorage.setItem("User", "true");
            if (user.user) {
              navigate("/welcome");
              window.location.reload();
            }
          })
          .catch((err) => {
            console.log("Verification Unsuccessful,User", err);
          });
      } else {
        console.error("Confirmation result is null");
      }
    } catch (error: any) {
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
            <div id="recaptcha-container"></div>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "90vh",
        }}
      >
        <TopPageNumber
          activePage={activePage}
        />
        <div
          style={{
            height: "20%",
            display: "flex",
            width: "73%",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            marginTop: "20px",
          }}
        >
          <h2>Got it, please confirm your number</h2>
          <h5 style={{ fontFamily: "sans-serif" }}>
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
              width: "70%",
              fontSize: 18,
              margin: "10px 0",
            }}
          />
          <div
            style={{
              height: "20%",
              display: "flex",
              width: "82%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoginButtonComponent
              onClick={handleVerify}
              name="verify"
              variant="contained"
              style={{ width: "100%", height: "40px", marginTop: "70px" }}
            />
            <p>
              Didn't get the code?
              <button
                style={{
                  color: resendBtnDisabled ? "grey" : "blue",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "transparent",
                  marginTop: "10px",
                  fontSize: "14px",
                  textDecoration: "underline",
                }}
                disabled={resendBtnDisabled}
                onClick={() => {
                  sendOtp();
                }}>
                Resend it
              </button>
              {countDown > 0 && countDown < 30 && `(after ${countDown}s)`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default Otpscreen;