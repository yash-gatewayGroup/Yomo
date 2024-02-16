import { useState } from "react";
import "./profile.css";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import AlertDialogSlide from "../../components/AlertTranisitionDialogue/Dialogue";

const AccountSettingScreen = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleDeleteOpenDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    setIsDialogOpen(false);
    localStorage.removeItem('User');
    navigate('/login')
    window.location.reload();
  };

  const deleteAccount = async ()=>{
    console.log("Delete Account");
  }

  return (
    <>
      <Header showBackButton={true} headerName="Account Settings" />
      <div className="additional-settings">
        <div className="account-settings" onClick={handleOpenDialog}>
          <div className="settings-icon">
            <LogoutIcon />
          </div>
          <div style={{ flex: "1", padding: "10px 0", textAlign: "left" }}>
            <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
              Logout
            </p>
          </div>
          <AlertDialogSlide open={isDialogOpen} handleClose={handleCloseDialog} handleLogout={handleLogout} 
          firstMessage="Are you sure you want to Logout?" secondMessage="You will miss all the updates happening in your account"
          btnone="cancel" btnsecond="Logout"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: 8 }}>
          <div style={{ padding: 10 }}>
            <DescriptionOutlinedIcon />
          </div>
          <div style={{ flex: "1", padding: "10px 0", textAlign: "left" }}>
            <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
              Privacy & Terms
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: 8 }}  onClick={handleDeleteOpenDialog}>
          <div style={{ padding: 10 }}>
            <DeleteIcon />
          </div>
          <div style={{ flex: "1", padding: "10px 0", textAlign: "left" }}>
            <p style={{ fontSize: 16, fontWeight: "bold", margin: 0 }}>
              Delete Account
            </p>
          </div>
        </div>
        <AlertDialogSlide open={isDeleteDialogOpen} handleClose={handleCloseDialog} handleLogout={deleteAccount} 
          firstMessage="Are you sure you want to delete your account?" 
          secondMessage="You will loose all your data, chats and connections once your account is deleted"
          btnone="cancel" btnsecond="Delete"
          />
      </div>
    </>
  );
};

export default AccountSettingScreen;
