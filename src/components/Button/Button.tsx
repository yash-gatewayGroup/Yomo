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

const LoginButtonComponent: React.FC<LoginButtonProps> = ({
  onClick,
  disable,
  name,
  style,
  variant,
  isSaving
}) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disable}
      style={{
        width: "90%",
        backgroundColor: colors.white,
        color: colors.theme_color,
        fontFamily: "Public Sans",
        fontSize: 15,
        fontWeight: "bold",
        borderRadius: "5px",
        alignItems: "center",
        justifyContent: "center",
        textTransform: "none",
        ...style,
      }}
    >
      {isSaving ? (
        <CircularProgress size={20} style={{ justifyContent:"center",alignContent:"center" }} />
      ) : null}
      {isSaving ? "" : name}
    </Button>
  );
};

export default LoginButtonComponent;
