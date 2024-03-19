import React from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    const navigateToNextScreen = () => {
      const id = localStorage.getItem("databaseId");
      if (!id) {
        navigate("./welcome");
      } else {
        console.log("Id not present");
      }
    };
    navigateToNextScreen();
  }, []);
  return <div>{<Navigate to="/location" />}</div>;
};

export default DashboardScreen;
