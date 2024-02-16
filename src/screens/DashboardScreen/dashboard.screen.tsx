import React from "react";
import { Navigate } from "react-router-dom";

const DashboardScreen: React.FC = () => {
  return (
    <div>
    {<Navigate to="/chats" />}
    </div>
  );
};

export default DashboardScreen;
