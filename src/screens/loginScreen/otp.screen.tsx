import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoginButtonComponent from "../../components/Button/Button";
import OtpInput from "react-otp-input";
import { db, newTimestamp } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import Header from "../../components/Header/Header";
import firebase from "firebase/compat/app";
import { colors } from "../../theme/colors";

interface OtpVerificationParams {
  phoneNumber?: string;
}

const Otpscreen: React.FC<OtpVerificationParams> = () => {
  const navigate = useNavigate();
  const { phoneNumber } = useParams<{ phoneNumber?: string }>();
  const [otp, setOtp] = useState("");
  const [resendBtnDisabled, setResendBtnDisabled] = useState(true);
  const [countDown, setCountDown] = useState(30);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("./dashboard")
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

  const checkAndAddUser = async (user: any) => {
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
            setIsLoading(false);
            navigate("/welcome");
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
          setIsLoading(false);
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
              setIsLoading(false);
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
    setIsLoading(true);
    if (otp === null) return;
    try {
      const verificationId = localStorage.getItem("userCredentialId");
      if (verificationId) {
        const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
        const user = await firebase.auth().signInWithCredential(credential);
        toast.success("Otp verified Sucessfully", {
          style: { fontFamily: "Public Sans", color: colors.theme_color, fontWeight: "400px", fontSize: "14px" },
        });
        if (user.user) {
          checkAndAddUser(user.user);
        } else {
          console.log("User Not found");
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      toast.error("Verification failed wrong Otp entered:", {
        style: { fontFamily: "Public Sans", color: colors.theme_color, fontWeight: "400px", fontSize: "14px" },
      });
    }
  };

  const resendOtp = () => {
    try {
      let verify = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
        siteKey: "6LfncGApAAAAAKz0aB2EZ6_yDYWrByfrPVto9GFE",
      });
      phoneNumber &&
        firebase
          .auth()
          .signInWithPhoneNumber(phoneNumber, verify)
          .then((result) => {
            localStorage.setItem("userCredentialId", result.verificationId);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            console.log(err);
            alert(err);
          });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>
      <Header showLogo={true} showBackButton={true} />
      <Toaster position="bottom-center" reverseOrder={false} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: colors.theme_color,
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
            paddingTop: "40%",
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
            backgroundColor: colors.theme_color,
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
          <LoginButtonComponent variant="contained" onClick={handleVerify} name="Verify" isSaving={isLoading} />
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
            onClick={resendOtp}
          >
            <p
              style={{
                color: "#666666",
                fontWeight: "500",
                fontSize: 16,
                fontFamily: "Public Sans",
              }}
            >
              Resend Code: {countDown > 0 && countDown < 30 && `${countDown}s`}
            </p>
          </button>
        </div>
      </div>
    </>
  );
};
export default Otpscreen;
