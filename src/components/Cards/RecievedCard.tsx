import React, { useState } from "react";
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { CircularImage } from "../CircleImage/circleImage";
import "./CardStyle.css";
// import TextsmsIcon from "@mui/icons-material/Textsms";
import BlockIcon from "@mui/icons-material/Block";
import TextsmsIcon from "@mui/icons-material/ChatBubble";
import { CircularProgress } from "@mui/material";
interface Customer {
  id: string;
  collectionId: string;
  customerId: string;
  friendRequestId: string;
  imageUrl: string;
  name: string;
  status: string;
  imageName?: string;
}

interface Props {
  customer: Customer;
  accepted: (id: string, collectionId: string) => void;
  rejected: (id: string, collectionId: string) => void;
  imageName?: string;
  isSaving?: boolean;
}

const RecievedCard: React.FC<Props> = ({ customer, accepted, rejected, imageName, isSaving }) => {
  const [loading, setLoading] = useState(false);
  const handleAccepted = async () => {
    setLoading(true);
    try {
      await accepted(customer.customerId, customer?.friendRequestId);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleRejected = async () => {
    setLoading(true);
    try {
      await rejected(customer.customerId, customer?.friendRequestId);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="connection-user-item">
      <div className="image-container">
        <CircularImage imageUrl={customer.imageUrl} alt={customer.name} />
        <div
          className="statusdot"
          style={{
            backgroundColor: customer.status === "online" ? "green" : "red",
          }}
        ></div>
      </div>
      <div className="userdetails">{customer.name}</div>
      {isSaving && loading ? (
        <div className="btn-container">
          {<CircularProgress size={15} style={{ color: "white", justifyContent: "center", alignContent: "center" }} />}
        </div>
      ) : (
        <div className="btn-container">
          <div onClick={handleAccepted}>
            {!imageName ? <DoneOutlinedIcon className="icon" fontSize="small" /> : <TextsmsIcon className="icon-text" fontSize="small" />}
          </div>
          <div onClick={handleRejected}>
            {!imageName ? <CloseOutlinedIcon className="icon" fontSize="small" /> : <BlockIcon className="icon-text" fontSize="small" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecievedCard;
