// Card.tsx
import React, { useState } from "react";
import { CircularImage } from "../CircleImage/circleImage";
import "./CardStyle.css";
import { CircularProgress } from "@mui/material";
import { colors } from "../../theme/colors";

interface Customer {
  collectionId: string;
  imageUrl: string;
  name: string;
  status: string;
  id: string;
  customerId: string;
  friendRequestId: string;
}

interface Props {
  customer: Customer;
  btnName?: string;
  deleteData: () => void;
  isSavingData?: boolean | undefined;
}

const Card: React.FC<Props> = ({ customer, deleteData, btnName, isSavingData }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await deleteData();
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="connection-user-item" key={customer.id}>
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

      <button className="withdraw-button" onClick={handleClick} disabled={isSavingData}>
        {isSavingData && loading && <CircularProgress size={15} style={{ color:colors.white, justifyContent: "center", alignContent: "center" }} />}
        {isSavingData && loading ? "" : btnName}
      </button>
    </div>
  );
};

export default Card;
