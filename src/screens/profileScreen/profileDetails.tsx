import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Firebase from "firebase/compat/app";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import { db, newTimestamp, storage } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

interface UserInfo {
  bio: string;
  name: string;
  imageUrl: string;
}

const ProfileDetail = () => {
  const [info, setInfo] = useState<UserInfo[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerBio, setCustomerBio] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const id: any = localStorage.getItem("databaseId");
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

  const handleImageChange = (files: File[]) => {
    if (files.length > 0) {
      setImage(files[0]);
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      handleImageUpload();
    }
  };

  const updateUser = async () => {
    setIsLoading(true);
    const id: any = localStorage.getItem("databaseId");
    db.collection("customersData")
      .doc(id)
      .update({
        bio: customerBio,
        name: customerName,
        timeStamp: newTimestamp,
      })
      .then((res) => {
        navigate(-1);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.log("Error", err);
        setIsLoading(false);
      });
  };

  const fetchData = (id: string) => {
    setIsLoading(true);
    Firebase.firestore()
      .collection("customersData")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data() as UserInfo | undefined;
          if (data) {
            setInfo([data]);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
        setIsLoading(false);
      });
  };

  const handleImageUpload = async () => {
    if (!image) {
      console.error("No image selected.");
    } else {
      const storageRef = storage.ref(`images/${image.name}`);
      const uploadTask = storageRef.put(image);
      uploadTask.on("state_changed", (snapshot: any) => {
        console.log("snapshot", snapshot);
      });
      await uploadTask;
      const imageUrl = await storageRef.getDownloadURL();
      const id: any = localStorage.getItem("databaseId");
      db.collection("customersData").doc(id).update({
        imageUrl: imageUrl,
      });
    }
  };

  return (
    <>
      <div style={{ height: "7%", backgroundColor: "#000000" }}>
        <Header showBackButton={true} headerName="My Profile Details" />
      </div>
      {isLoading && (
        <div className="loading-indicator">
          <CircularProgress />
        </div>
      )}
      {info.map((data, index) => (
        <div key={index} className="image-container-profile-detail">
          <div className="image-wrapper">
            {data.imageUrl ? (
              <div className="image-overlay">
                <img src={data.imageUrl} className="image-wrapper img" />
                <div className="overlay-content">
                  <label>
                    <PhotoCameraRoundedIcon className="overlay-image" />
                    <div className="overlay-text">Update photo</div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{
                        display: "none",
                      }}
                      onChange={(e: any) => {
                        handleImageChange(e.target.files);
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="image-placeholder">
                <CircularProgress />
              </div>
            )}
          </div>

          <div className="textBox-container">
            <TextBoxComponent
              value={customerName}
              onChange={(value) => setCustomerName(value)}
              label="Full Name"
              variant="outlined"
              fullWidth
              style={{
                width: "90%",
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
                width: "90%",
              }}
              placeholder={"Describe yourself in few Words"}
              multiline={true}
              rows={3}
            />
            <div className="login-button-container">
              <LoginButtonComponent variant="contained" onClick={updateUser} name="Update" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
export default ProfileDetail;
