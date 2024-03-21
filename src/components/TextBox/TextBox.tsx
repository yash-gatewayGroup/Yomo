import React, { ChangeEvent } from "react";
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/styles";

interface TextBoxProps {
  value: string;
  onChange: (value: string) => void;
  color?: string;
  label?: string;
  style?: React.CSSProperties;
  variant?: "standard" | "outlined" | "filled";
  fullWidth?: boolean;
  placeholder?: any;
  multiline?: boolean;
  rows?: number;
}

const TextBoxComponent: React.FC<TextBoxProps> = ({ label, variant, fullWidth, value, onChange, color, style, placeholder, multiline, rows }) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  const classes = useStyles();
  return (
    <TextField
      className={classes.root}
      label={label}
      variant={variant}
      fullWidth={fullWidth}
      value={value}
      onChange={handleInputChange}
      style={{
        margin: "8px 0",
        fontSize: 14,
        fontFamily: "Public Sans",
        fontWeight: "400",
        ...style,
      }}
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
    />
  );
};

export default TextBoxComponent;

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#3A3A3A",
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: "#3A3A3A",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#3A3A3A",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#FFFFFF", // Set label color to white
      "&.Mui-focused": {
        color: "#FFFFFF", // Set label color to white on focus
      },
    },
    "& .MuiInputBase-root": {
      color: "#FFFFFF",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#3A3A3A",
    },
  },
});
