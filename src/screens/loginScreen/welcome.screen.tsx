import React, { useState } from "react";
import "./style.css";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import TopPageNumber from "../../components/TopPageNumber/TopPageNumber";
import { db, storage, newTimestamp } from "../../firebase";
import { useNavigate } from "react-router-dom";
import firebase from "firebase/compat/app";
import { CircularProgress } from "@mui/material";

const WelcomeScreen: React.FC = () => {
  const [activePage, setActivePage] = useState<number>(3);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerBio, setCustomerBio] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined >(undefined);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const handleClearImage = () => {
    setImage(null);
    setImageUrl(undefined);
  };

  const handleImageChange = (files: File[]) => {
    setImageLoading(true);
    if (files.length > 0) {
      setImage(files[0]);
      const reader = new FileReader();
      console.log("imgUrl", reader.result);
      reader.readAsDataURL(files[0]);
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      setImageLoading(false);
    }
  };

  const addDocumentId = async(documentId: string) => {
    const changeId: string | undefined =
      localStorage.getItem("userCollectionId") || undefined;
    const dataAdd= await db.collection("users").doc(changeId).set(
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
        localStorage.setItem("documentId",id)
        localStorage.setItem("databaseId", uniqueId);
        setLoading(false);
        navigate("/dashboard");
        setCustomerName("");
        setCustomerBio("");
        setImage(null);
        setImageUrl(undefined);
        window.location.reload();
      } catch (error: any) {
        console.error("Error uploading image:", error.message);
      }
    }
  };

  return (
    <>
      {loading ? (
        <div className="loading-indicator">
          <CircularProgress />
        </div>
      ) : (
        <div className="container">
          <div
            style={{
              height: "20vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "end",
            }}
          >
            <TopPageNumber activePage={activePage} />
          </div>
          <div className="image-upload-section">
            {!imageUrl ? (
              <label>
                <img src={imageUrl} className="circular-image-upload"/>
                <p>Upload</p>
                <input
                  type="file"
                  accept="image/*"
                  style={{
                    display: "none",
                  }}
                  onChange={(e:any)=>{
                    console.log("image", e.target.files);
                    handleImageChange(e.target.files)
                  }}
                />
              </label>
            ) : // <ImageUploader
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
            imageLoading ? (
              <CircularProgress />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Selected"
                  style={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    width: "30vh",
                    height: "20vh",
                    border: "2px dashed #666",
                  }}
                />
                <Button
                  style={{ marginTop: 10 }}
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearImage}
                ></Button>
              </div>
            )}
          </div>

          <div className="form-section">
            <TextBoxComponent
              value={customerName}
              onChange={(value) => setCustomerName(value)}
              label="Full Name"
              variant="outlined"
              fullWidth
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                width: "89%",
                fontSize: 16,
              }}
              placeholder={"Your Name Here"}
              multiline={false}
              rows={0}
            />

            <TextBoxComponent
              value={customerBio}
              onChange={(value) => setCustomerBio(value)}
              label="Bio"
              variant="outlined"
              fullWidth
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                width: "89%",
                fontSize: 16,
              }}
              placeholder={"Describe yourself in few Words"}
              multiline={true}
              rows={5}
            />
            <LoginButtonComponent
              onClick={handleUpload}
              name="save"
              variant="contained"
              style={{ width: "89%", height: "30%" }}
            />
          </div>
        </div>
      )}
    </>
  );
};
export default WelcomeScreen;
