import React from 'react';
import Button from '@mui/material/Button';

interface LoginButtonProps {
  onClick: (e: any) => void;
  name?: string;
  style?: React.CSSProperties;
  variant?: 'text' | 'outlined' | 'contained';
}

const LoginButtonComponent: React.FC<LoginButtonProps> = ({ onClick, name, style, variant }) => {
  return (
    <Button variant={variant} onClick={onClick} style={{ margin: '8px 0', borderRadius: '30px',...style }}>
    {name}
    </Button>
  );
};

export default LoginButtonComponent;
