import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNavigation";
import Firebase from "firebase/compat/app";
import "./profile.css";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SettingsIcon from "@mui/icons-material/Settings";
import BlockIcon from "@mui/icons-material/Block";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface UserInfo {
  bio: string;
  name: string;
  imageUrl: string;
}

const ProfileScreen = () => {
  const [info, setInfo] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const id: any = localStorage.getItem("documentId");    
    if (id) {
      fetchData(id);
    }
  }, []);

  const fetchData = (id: any) => {
    const getFromFirebase = Firebase.firestore().collection("customersData");
    getFromFirebase.where("id", "==", id).onSnapshot((querySnapShot) => {
      const saveFirebaseTodos: any = [];
      querySnapShot.forEach((doc) => {
        saveFirebaseTodos.push(doc.data());
      });
      setInfo(saveFirebaseTodos);
      setLoading(false);
    });
  };

  const handleAction = () => {
    navigate("/accountSettings");
  };

  const handleProfileAction = () => {
    navigate("/profileDetails");
  };

  const handleBlockAction = () => {
    navigate("/blockeduser");
  };

  return (
    <>
      <Header headerName="My Profile" />
      {loading ? (
        <div className="loading-indicator">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="container">
            {info.map((data, index) => (
              <div
                className="content"
                key={index}
                onClick={handleProfileAction}
              >
                <div
                  style={{
                    width: "auto",
                    height: "auto",
                    paddingTop: 5,
                    padding: 6,
                  }}
                >
                  {data.imageUrl ? (
                    <img
                      src={data.imageUrl}
                      alt="Profile"
                      className="profile-picture"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#ddd",
                      }}
                    ></div>
                  )}
                </div>
                <div className="details">
                  <p style={{ fontSize: 18, margin: 0, fontWeight: "bold" }}>
                    {data.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, maxLines: 2 }}>
                    {data.bio}
                  </p>
                </div>
                <div className="icon">
                  <ArrowForwardIosIcon />
                </div>
              </div>
            ))}
            <div className="additional-settings">
              <div className="account-settings" onClick={handleAction}>
                <div className="settings-icon">
                  <SettingsIcon />
                </div>
                <div
                  style={{ flex: "1", padding: "10px 0", textAlign: "left" }}
                >
                  <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
                    Account settings
                  </p>
                </div>
                <div style={{ padding: 10 }}>
                  <ArrowForwardIosIcon />
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", padding: 8 }}
                onClick={handleBlockAction}
              >
                <div style={{ padding: 10 }}>
                  <BlockIcon />
                </div>
                <div
                  style={{ flex: "1", padding: "10px 0", textAlign: "left" }}
                >
                  <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
                    Blocked Users
                  </p>
                </div>
                <div style={{ padding: 10 }}>
                  <ArrowForwardIosIcon />
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", padding: 8 }}
              >
                <div style={{ padding: 10 }}>
                  <HelpOutlineIcon />
                </div>
                <div
                  style={{ flex: "1", padding: "10px 0", textAlign: "left" }}
                >
                  <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
                    Help
                  </p>
                </div>
                <div style={{ padding: 10 }}>
                  <ArrowForwardIosIcon />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <BottomNav screenValue="profile" />
    </>
  );
};
export default ProfileScreen;
