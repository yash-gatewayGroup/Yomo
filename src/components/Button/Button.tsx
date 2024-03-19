import React from "react";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { colors } from "../../theme/colors";

interface LoginButtonProps {
  onClick: (e: any) => void;
  disable?: boolean | undefined;
  name?: string;
  style?: React.CSSProperties;
  variant?: "text" | "outlined" | "contained";
  isSaving?: Boolean;
}

const LoginButtonComponent: React.FC<LoginButtonProps> = ({ onClick, disable, name, style, variant, isSaving }) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disable}
      style={{
        width: "90%",
        backgroundColor: disable ? "#808080" : colors.white,
        color: disable ? colors.white : colors.theme_color,
        fontFamily: "Public Sans",
        fontSize: 14,
        fontWeight: "bold",
        borderRadius: "5px",
        alignItems: "center",
        justifyContent: "center",
        textTransform: "none",
        ...style,
      }}
    >
      {isSaving ? <CircularProgress size={25} style={{ justifyContent: "center", alignContent: "center", color:"#000000" }}  /> : null}
      {isSaving ? "" : name}
    </Button>
  );
};

export default LoginButtonComponent;
