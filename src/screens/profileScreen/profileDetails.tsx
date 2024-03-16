import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Firebase from "firebase/compat/app";
import TextBoxComponent from "../../components/TextBox/TextBox";
import LoginButtonComponent from "../../components/Button/Button";
import { db, newTimestamp, storage } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import toast, { Toaster } from "react-hot-toast";
import { colors } from "../../theme/colors";

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
  const [isImageLoading, setIsImageLoading] = useState<Boolean>(false);
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
    setIsImageLoading(true);
    if (files.length > 0) {
      setIsImageLoading(false);
      const file = files[0];
      if (file.size > 3.1 * 1024 * 1024) {
        console.log("File size exceeds 3.1 MB. Please select a smaller image.");

        toast.error("File size exceeds 3.1 MB. Please select a smaller image.");
        setIsImageLoading(false);
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        console.log("File size exceeds 3.1 MB. Please select a smaller image.");
        toast.error("Invalid file type. Please select a JPEG, JPG, PNG, or GIF image.", {
          style: { fontFamily: "Public Sans", color: "#ffffff", fontWeight: "400px", fontSize: "14px" },
        });
        setIsImageLoading(false);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageUrl(reader.result as string);
        setIsImageLoading(false);
      };
      setImage(files[0]);
    }
  };

  const updateUser = async () => {
    setIsLoading(true);
    if (!image) {
      <p style={{ color: "white" }}>Please select an image.</p>;
    } else if (!customerName) {
      console.error("Kindly Write the Name.");
      return;
    } else if (!customerBio) {
      console.error("Kindly Write the Bio.");
      return;
    } else {
      setIsLoading(true);
      try {
        const storageRef = storage.ref(`images/${image.name}`);
        const uploadTask = storageRef.put(image);
        uploadTask.on("state_changed", (snapshot: any) => {
          console.log("snapshot", snapshot);
        });
        await uploadTask;
        const imageUrl = await storageRef.getDownloadURL();
        const id: any = localStorage.getItem("databaseId");
        db.collection("customersData")
          .doc(id)
          .update({
            bio: customerBio,
            name: customerName,
            imageUrl: imageUrl,
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
      } catch {
        return null;
      }
    }
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
                  {isImageLoading ? (
                    <CircularProgress style={{ color: "#ffffff" }} />
                  ) : (
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
                  )}
                </div>
              </div>
            ) : (
              <div className="image-placeholder">
                <CircularProgress />
              </div>
            )}
          </div>

          <div className="textBox-container">
          <Toaster position="bottom-center" reverseOrder={false} />
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
            {!customerBio || !customerName || !image ? (
              <div className="login-button-container">
                <LoginButtonComponent variant="contained" onClick={updateUser} name="Update" disable={true} />
              </div>
            ) : (
              <div className="login-button-container">
                <LoginButtonComponent variant="contained" onClick={updateUser} name="Update" isSaving={isLoading} />
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};
export default ProfileDetail;
