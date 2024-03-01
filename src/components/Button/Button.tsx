import React from "react";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";

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
        backgroundColor: "#FFFFFF",
        color: "#000000",
        fontFamily: "Public Sans",
        fontSize: 15,
        fontWeight: "bold",
        borderRadius: "5px",
        alignItems: "center",
        justifyContent: "center",
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
