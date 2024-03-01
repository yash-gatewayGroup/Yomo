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
  const [loading, setLoading] = useState<Boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const id: any = localStorage.getItem("databaseId");    
    if (id) {
      fetchData(id);
    }
  }, []);

  const fetchData = (id: string) => {
    Firebase.firestore().collection("customersData").doc(id).get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data() as UserInfo | undefined;
          if (data) {
            setInfo([data]); 
          } else {
            console.log("Document data is undefined for ID:", id);
          }
        } else {
          console.log("No such document found with ID:", id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting document:", error);
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
                className="account-settings"
                key={index}
                onClick={handleProfileAction}
              >
           
                  {data.imageUrl ? (
                    <img
                      src={data.imageUrl}
                      alt="Profile"
                      style={{
                        height:"7vh",
                        width: "7vh",
                        objectFit: "cover",
                        maxHeight:"10vh",
                        maxWidth: '7vh',
                        borderRadius:'50%'
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
                <div className="details">
                  <p style={{ fontSize: 16, margin: 0, fontWeight: "400", fontFamily: 'Public Sans', color:"#FFFFFF" }}>
                    {data.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color:"#637381", fontWeight: "400", fontFamily: 'Public Sans', textOverflow: 'ellipsis', 
                  overflow:'hidden', whiteSpace: 'nowrap',width:"100%" }}>
                    {data.bio}
                  </p>
                </div>
                <div className="iconforward">
                  <ArrowForwardIosIcon style={{color:"#FFFFFF"}} />
                </div>
              </div>
            ))}
            <div className="additional-settings">
              <div className="account-settings" onClick={handleAction}>
                <div className="settings-icon">
                  <SettingsIcon style={{color:"#FFFFFF"}} />
                </div>
                <div
                  style={{ flex: "1", textAlign: "left" }}
                >
                  <p style={{ fontSize: 14, margin: 0, fontWeight: "400", fontFamily: 'Public Sans', color:"#FFFFFF" }}>
                    Account settings
                  </p>
                </div>
                <div>
                  <ArrowForwardIosIcon style={{color:"#FFFFFF"}}/>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", padding: 8 }}
                onClick={handleBlockAction}
              >
                <div style={{ padding: 10 }}>
                  <BlockIcon style={{color:"#FFFFFF"}} />
                </div>
                <div
                  style={{ flex: "1", textAlign: "left" }}
                >
                  <p style={{ fontSize: 14, margin: 0, fontWeight: "400", fontFamily: 'Public Sans', color:"#FFFFFF" }}>
                    Blocked Users
                  </p>
                </div>
                <div>
                  <ArrowForwardIosIcon style={{color:"#FFFFFF"}}/>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", padding: 8 }}
              >
                <div style={{ padding: 10 }}>
                  <HelpOutlineIcon style={{color:"#FFFFFF"}} />
                </div>
                <div
                  style={{ flex: "1", textAlign: "left" }}
                >
                 <p style={{ fontSize: 14, margin: 0, fontWeight: "400", fontFamily: 'Public Sans', color:"#FFFFFF" }}>
                    Help
                  </p>
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
