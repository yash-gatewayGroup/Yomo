import React, { ChangeEvent } from 'react';
import TextField from '@mui/material/TextField';

interface TextBoxProps {
  value: string;
  onChange: (value: string) => void;
  color?: string;
  label?: string;
  style?: React.CSSProperties;
  variant?: 'standard' | 'outlined' | 'filled';
  fullWidth?: boolean;
  placeholder?: any;
  multiline?: boolean;
  rows?: number;
}

const TextBoxComponent: React.FC<TextBoxProps> = ({ label, variant, fullWidth, value, onChange, color, style, placeholder, multiline, rows }) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  return (
    <TextField
      label={label}
      variant={variant}
      fullWidth={fullWidth}
      value={value}
      onChange={handleInputChange}
      style={{ margin: '8px 0', ...style }}
      placeholder={placeholder}
      color={'primary'}
      multiline={multiline}
      rows={rows}  
    />
  );
};

export default TextBoxComponent;
