import React, { useEffect, useState } from "react";
import "./style.css";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import { db, storage, newTimestamp } from "../../firebase";
import ImageUploader from "react-images-upload";
import firebase from "firebase/compat/app";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";

const WelcomeScreen: React.FC = () => {
  const [customerName, setCustomerName] = useState<string>("");
  const [customerBio, setCustomerBio] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (files: File[]) => {
    setImageLoading(true);
    if (files.length > 0) {
      setImage(files[0]);
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      setImageLoading(false);
    }
  };

  useEffect(() => {
    const checkDocumentId = async () => {
      const changeId = localStorage.getItem("databaseId");
      if (changeId) {
        try {
          const docSnapshot = await db.collection("users").doc(changeId).get();
          const userData = docSnapshot.data();
          if (userData && userData.documentId) {
            window.location.replace("/dashboard");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      } else {
        console.log("changeId is not defined or null");
      }
    };
    checkDocumentId();
  }, []);

  const addDocumentId = async (documentId: string) => {
    const changeId: string | undefined =
      localStorage.getItem("userCollectionId") || undefined;
    const dataAdd = await db.collection("users").doc(changeId).set(
      {
        documentId: documentId,
      },
      { merge: true }
    );
    console.log(dataAdd);
  };

  const handleUpload = async () => {
    if (!image) {
      console.error("No image selected.");
    } else if (!customerName) {
      console.error("Kindly Write the Name.");
      return;
    } else if (!customerBio) {
      console.error("Kindly Write the Bio.");
      return;
    } else {
      setLoading(true);
      try {
        const storageRef = storage.ref(`images/${image.name}`);
        const uploadTask = storageRef.put(image);

        uploadTask.on("state_changed", (snapshot: any) => {
          console.log("snapshot", snapshot);
        });
        await uploadTask;
        const imageUrl = await storageRef.getDownloadURL();
        const id = firebase.firestore().collection("customersData").doc().id;
        const documentRef = await db.collection("customersData").add({
          id: id,
          name: customerName,
          bio: customerBio,
          imageUrl: imageUrl,
          timeStamp: newTimestamp,
        });
        const uniqueId = documentRef.id;
        addDocumentId(uniqueId);
        localStorage.setItem("databaseId", uniqueId);
        setLoading(false);
        navigate("/dashboard");
        setCustomerName("");
        setCustomerBio("");
        setImage(null);
        setImageUrl(undefined);
      } catch (error: any) {
        console.error("Error uploading image:", error.message);
      }
    }
  };

  const customerNameWords = (value: any) => {
    const words = value.trim().split(/\s+/);
    if (words.length <= 9) {
      setCustomerName(value);
    }
  };

  const customerBioWords = (value: any) => {
    const words = value.trim().split(/\s+/);
    console.log(words);

    if (words.length <= 40) {
      setCustomerBio(value);
    }
  };

  return (
    <>
      <Header showLogo={true} />
      <div className="welcome-container">
        {loading ? (
          <div className="loading-indicator">
            <CircularProgress color="primary" />
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                fontSize: 24,
                fontFamily: "Public Sans",
                fontWeight: "bold",
                color: "#FFFFFF",
                padding: "30px",
              }}
            >
              Add Your details
            </div>
            <div className="image-upload-section">
              {!imageUrl ? (
                // <ImageUploader
                //   onChange={handleImageChange}
                //   withIcon={true}
                //   className="circular-image-upload"
                //   imgExtension={[".jpg", ".jpeg", ".png", ".gif"]}
                //   maxFileSize={5242880}
                //   buttonText={"Upload Image"}
                //   style={{
                //     borderRadius: "50%",
                //     overflow: "hidden",
                //     width: "30vh",
                //     height: "20vh",
                //     border: "2px dashed #666",
                //   }}
                // />
                <label
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "70%",
                    width: "70%",
                    borderRadius: "50%",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src={imageUrl}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                      width: "60%",
                      height: "60%",
                      border: "2px dashed #666",
                      borderColor: "#2f2f2f",
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{
                      display: "none",
                      backgroundColor: "#FFFFFF",
                    }}
                    onChange={(e: any) => {
                      console.log("image", e.target.files);
                      handleImageChange(e.target.files);
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      backgroundColor: "#1a1a1a",
                      borderRadius: "50%",
                      width: "50%",
                      height: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <PhotoCameraRoundedIcon style={{ color: "FFFFFF" }} />
                    <div className="overlay-text">Update photo</div>
                  </div>
                  <div
                    style={{
                      color: "#A8A8A8",
                      alignSelf: "flex-end",
                      textAlign: "center",
                      fontSize: 12,
                      fontFamily: "Public Sans",
                      fontWeight: 400,
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif <br></br> Max size of
                    3.1 MB
                  </div>
                </label>
              ) : imageLoading ? (
                <CircularProgress />
              ) : (
                <label
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "70%",
                    width: "70%",
                    borderRadius: "50%",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src={imageUrl}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                      width: "60%",
                      height: "60%",
                      border: "2px dashed #666",
                      borderColor: "#2f2f2f",
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{
                      display: "none",
                      backgroundColor: "#FFFFFF",
                    }}
                    onChange={(e: any) => {
                      console.log("image", e.target.files);
                      handleImageChange(e.target.files);
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                    }}
                  >
                    <ModeEditRoundedIcon style={{ color: "FFFFFF" }} />
                  </div>
                </label>
              )}
            </div>

            <div className="form-section">
              <TextBoxComponent
                value={customerName}
                onChange={(value) => customerNameWords(value)}
                label="Full Name"
                variant="outlined"
                fullWidth
                color="white"
                style={{
                  borderRadius: "8px",
                  width: "90%",
                  fontSize: 14,
                }}
                placeholder={"Your Name Here"}
              />

              <TextBoxComponent
                value={customerBio}
                onChange={(value) => customerBioWords(value)}
                label="Bio"
                variant="outlined"
                fullWidth
                color="white"
                style={{
                  borderRadius: "8px",
                  width: "90%",
                  fontSize: 14,
                  maxLines: 3,
                  paddingBottom: "30px",
                }}
                placeholder={"Describe yourself in few Words"}
                multiline={true}
                rows={3}
              />

              <LoginButtonComponent
                variant="contained"
                onClick={handleUpload}
                name="Save"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default WelcomeScreen;
