import React, { FC } from "react";
import "./Header.css";
import SettingsIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showBackButton?: boolean;
  showOptionButton?: boolean;
  showLogo?: boolean;
  headerName?: string;
}
const Header: FC<HeaderProps> = ({
  showBackButton,
  showOptionButton,
  showLogo,
  headerName,
}) => {
const navigate = useNavigate();
  return (
    <div className="header">
      <div className="left-section">
        {showBackButton && (
          <IconButton
            onClick={() => navigate(-1)}
            style={{ color: "white" }}
            size="medium"
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        {showLogo ? <h3>Logo</h3> : <h3 style={{paddingLeft:15,fontSize:20}}>{headerName}</h3>}
      </div>
      {showOptionButton && (
        <div className="right-section">
          <IconButton
            onClick={() => console.log("Option clicked")}
            style={{ color: "white" }}
            size="large"
          >
            <SettingsIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};
export default Header;
