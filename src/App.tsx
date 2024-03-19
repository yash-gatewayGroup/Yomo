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
import MessageScreen from "./screens/chatScreen/messageScreen";

const App: React.FC = () => {
  const [userStatus, setUserStatus] = useState<string>("offline");
  // eslint-disable-next-line
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("databaseId");
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
      <InternetConnectivity />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={token !== "null" ? <Login /> : <DashboardScreen />} />
        <Route path="/otpscreen/:phoneNumber" element={token !== "null" ? <Otpscreen /> : <DashboardScreen />} />
        <Route path="/welcome" element={id ? <WelcomeScreen /> : token !== "null" ? <Login /> : <WelcomeScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/connection" element={<ConnectionScreen />} />
        <Route path="/chats" element={<ChatScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/message/:connectionId" element={<MessageScreen />} />
        <Route path="/profileDetails" element={<ProfileDetail />} />
        <Route path="/blockeduser" element={<Blockeduser />} />
      </Routes>
      <div style={{ flexGrow: 1 }}>
        <div style={{ height: "6%", backgroundColor: colors.theme_color }}></div>
        <Routes>
          <Route path="/accountSettings" element={<AccountSettingScreen />} />
          <Route path="/location" element={<LocationScreen />} />
        </Routes>
      </div>
      {/* <BottomNav /> */}
    </Router>
  );
};
export default App;
