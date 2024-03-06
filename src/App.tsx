import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashScreen from "../src/screens/splashScreen/splash.screen";
import Login from "../src/screens/loginScreen/login.screen";
import "./App.css";
import ChatScreen from "./screens/chatScreen/chatScreen.screen";
import LocationScreen from "./screens/locationScreen/location.screen";
import ConnectionScreen from "./screens/connectionScreen/connection.screen";
import ProfileScreen from "./screens/profileScreen/profile.screen";
import DashboardScreen from "./screens/DashboardScreen/dashboard.screen";
import Otpscreen from "./screens/loginScreen/otp.screen";
import WelcomeScreen from "./screens/loginScreen/welcome.screen";
import AccountSettingScreen from "./screens/profileScreen/accountSettings";
import ProfileDetail from "./screens/profileScreen/profileDetails";
import Blockeduser from "./screens/profileScreen/blockedUser";
import { db } from "./firebase";
import InternetConnectivity from "./components/InternetConnectivity/InternetConnectivity";
import { colors } from "./theme/colors";

const App: React.FC = () => {
  const [userStatus, setUserStatus] = useState<string>("offline");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const updateUserStatus = () => {
      const userIsOnline = true;
      const userId: string | null = localStorage.getItem("databaseId");
      if (userId) {
        const userRef = db.collection("customersData").doc(userId);
        userRef
          .update({
            status: userIsOnline ? "online" : "away",
          })
          .then(() => {})
          .catch((error: any) => console.error("Error updating user status:", error));
      }
    };
    updateUserStatus();
    const awayTimeout = setTimeout(() => {
      setUserStatus("away");
    }, 5 * 60 * 1000);

    return () => clearTimeout(awayTimeout);
  }, []);

  return (
    <Router>
      {/* <Header /> */}
      <div style={{ flexGrow: 1 }}>
      <InternetConnectivity />
      <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={token !== "null" ? <Login /> : <DashboardScreen />} />
      </Routes>
      <div style={{ height: "7%", backgroundColor: colors.theme_color }}></div>
        <InternetConnectivity />
        <Routes>
          <Route path="/otpscreen/:phoneNumber" element={token !== "null" ? <Otpscreen /> : <DashboardScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/accountSettings" element={<AccountSettingScreen />} />
          <Route path="/chats" element={<ChatScreen />} />
          <Route path="/connection" element={<ConnectionScreen />} />
          <Route path="/location" element={<LocationScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/profileDetails" element={<ProfileDetail />} />
          <Route path="/blockeduser" element={<Blockeduser />} />
        </Routes>
      </div>
      {/* <BottomNav /> */}
    </Router>
  );
};
export default App;
