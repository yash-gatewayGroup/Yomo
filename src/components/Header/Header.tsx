import React, { FC } from "react";
import "./Header.css";
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
    <div className="header" >
        <div className="left-section">
          {showBackButton && (
            <IconButton onClick={() => navigate(-1)} style={{ color: "white" }} size="medium">
              <ArrowBackIcon />
            </IconButton>
          )}
          <div>
            {showLogo ? (
              <img src={Logo} alt="logo-pic" className="logo"/>
            ) : (
              <h3 className="header-text">{headerName}</h3>
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
