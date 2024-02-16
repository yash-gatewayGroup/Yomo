import React, { useEffect, useState, ChangeEventHandler } from "react";
import Header from "../../components/Header/Header";
import Firebase from "firebase/compat/app";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import { db, newTimestamp, storage } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";
import { CircularProgress } from "@mui/material";

interface UserInfo {
  bio: string;
  name: string;
  imageUrl: string;
}

const ProfileDetail = () => {
  const [info, setInfo] = useState<UserInfo[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerBio, setCustomerBio] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const id: any = localStorage.getItem("documentId");
    if (id) {
      fetchData(id);
    }
  }, []);

  useEffect(() => {
    if (info.length > 0) {
      setCustomerName(info[0].name);
      setCustomerBio(info[0].bio);
    }
  }, [info]);

  const updateUser = async () => {
    const id: any = localStorage.getItem("databaseId");
    db.collection("customersData")
      .doc(id)
      .update({
        bio: customerBio,
        name: customerName,
        timeStamp: newTimestamp,
      })
      .then((res) => {
        console.log("Res", res);
        navigate(-1);
      })
      .catch((err: any) => {
        console.log("Error", err);
      });
  };

  const fetchData = (id: any) => {
    const getFromFirebase = Firebase.firestore().collection("customersData");
    getFromFirebase.where("id", "==", id).onSnapshot((querySnapShot) => {
      const saveFirebaseTodos: any = [];
      querySnapShot.forEach((doc) => {
        saveFirebaseTodos.push(doc.data());
      });
      setInfo(saveFirebaseTodos);
    });
  };

  const handleDrop = async (image: any) => {
    const file = image[0];

    const handleImageUpload = async () => {
      if (!image) {
        console.error("No image selected.");
      } else {
        const id: any = localStorage.getItem("databaseId");
        const filename = file.name;
        const storageRef = storage.ref(`images/${filename}`);
        const metadata = {
          contentType: "image/png",
        };
        const uploadTask = storageRef.put(file, metadata);
        uploadTask.on("state_changed", (snapshot: any) => {
          console.log("snapshot", snapshot);
        });
        await uploadTask;
        const imageUrl = await storageRef.getDownloadURL();
        db.collection("customersData")
          .doc(id)
          .update({
            imageUrl: imageUrl,
          })
          .then((res) => {
            console.log("Res", res);
          });
      }
    };
    handleImageUpload();
  };

  return (
    <>
      <Header showBackButton={true} headerName="My Profile Details" />
      {info.map((data, index) => (
        <div key={index} className="image-container">
          <div className="image-wrapper">
            {data.imageUrl ? (
              <img src={data.imageUrl} className="image-wrapper img" />
            ) : (
              <div className="image-placeholder">
                <CircularProgress />
              </div>
            )}

            <div className="dropzone-container">
              <Dropzone onDrop={handleDrop}>
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} className="dropzone-container1" >
                    <input
                      {...getInputProps()}
                      accept=".jpg , .jpeg , .png , .gif ,image/*"
                    />
                    <p className="dropzone-text" >Click or drag & drop to Update a new image</p>
                  </div>
                )}
              </Dropzone>
            </div>
          </div>

          <div className="textBox-container">
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
          </div>

          <div className="login-button-container">
            <LoginButtonComponent
              onClick={updateUser}
              name="save"
              variant="contained"
              style={{ width: "100%", height: "30%" }}
            />
          </div>
        </div>
      ))}
    </>
  );
};
export default ProfileDetail;
