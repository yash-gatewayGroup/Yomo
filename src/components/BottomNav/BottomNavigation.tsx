import React, { FC } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PlaceIcon from '@mui/icons-material/Place';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';

interface HeaderProps {
  screenValue?: string;
}

const BottomNav: FC<HeaderProps> = ({ screenValue }) => {
  const [value, setValue] = React.useState<string>(screenValue || 'location');

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const getIconStyle = (selected: boolean) => {
    return {
      color: selected ? "#FFFFFF" : "#646464",
    };
  };

  const CustomBottomNavigation = (props: any) => {
    return (
      <BottomNavigation
        value={value}
        showLabels={true}
        onChange={handleChange}
        style={{ backgroundColor: "#000000" }}
      >
        {props.children}
      </BottomNavigation>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, width: '100%' }}>
      <CustomBottomNavigation>
        <BottomNavigationAction
          label="Chats"
          value="chats"
          icon={<ChatBubbleIcon fontSize='small' />}
          style={getIconStyle(value === 'chats')}
          component={Link}
          to="/chats"  
        />
        <BottomNavigationAction 
        label="Near You" 
        value="location" 
        icon={<PlaceIcon fontSize='medium' />} 
        style={getIconStyle(value === 'location')} 
        component={Link}
        to="/location" 
        />
        <BottomNavigationAction label="Connection" 
        value="connection" 
        icon={<GroupAddIcon fontSize='medium' />} 
        style={getIconStyle(value === 'connection')} 
        component={Link}
        to="/connection"
        />
        <BottomNavigationAction label="My Profile" 
        value="profile" 
        icon={<PersonIcon fontSize='medium' />} 
        style={getIconStyle(value === 'profile')} 
        component={Link}
        to="/profile"
        />
      </CustomBottomNavigation>
     </div>
  );
}
export default BottomNav;