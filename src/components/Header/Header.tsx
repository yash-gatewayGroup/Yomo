import React, { FC } from "react";
import "./Header.css";
import SettingsIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/MainLogo.png";

interface HeaderProps {
  showBackButton?: boolean;
  showOptionButton?: boolean;
  showLogo?: boolean;
  headerName?: string;
  iconName?: React.ReactNode;
  onOptionClick?: () => void;
}

const Header: FC<HeaderProps> = ({ showBackButton, showOptionButton, showLogo, headerName, iconName, onOptionClick }) => {
  const navigate = useNavigate();
  return (
    <div className="header" style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}>
        <div className="left-section">
          {showBackButton && (
            <IconButton onClick={() => navigate(-1)} style={{ color: "white" }} size="medium">
              <ArrowBackIcon />
            </IconButton>
          )}
          <div>
            {showLogo ? (
              <img src={Logo} style={{ width: "auto", height: "40px", paddingInlineStart: 10, paddingTop: 10 }} />
            ) : (
              <h3 style={{ paddingLeft: 15, fontSize: 18, color: "#FFFFFF", fontWeight: "bold" }}>{headerName}</h3>
            )}
          </div>
        </div>
        {showOptionButton && (
          <div className="right-section">
            <IconButton onClick={onOptionClick} style={{ color: "white" }} size="large">
              {iconName}
            </IconButton>
          </div>
        )}
      </div>
  );
};
export default Header;
