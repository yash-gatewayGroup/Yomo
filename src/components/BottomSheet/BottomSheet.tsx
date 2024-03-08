import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import LoginButtonComponent from "../Button/Button";
import firebase from "firebase/compat/app";
import { colors } from "../../theme/colors";

interface BottomSheetProps {
  id: string | undefined | null;
  name: string | undefined;
  bio: string | undefined | null;
  onButtonClick: (id: any, isaccept: boolean) => void;
  image: string | undefined;
  friendRequestId: string | undefined | null;
  visible: boolean;
  onClose?: () => void;
  isSaving?: Boolean;
}

interface Data {
  pendingIds: string[];
  toAcceptIds: string[];
}

const pending = async (documentId: any, idToCheck: any) => {
  try {
    const doc = await firebase.firestore().collection("customersData").doc(documentId).get();
    if (doc.exists) {
      const documentData = doc.data() as Data;
      const isIdPresent = documentData.pendingIds.includes(idToCheck);
      return isIdPresent;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return false;
  }
};

const toAccept = async (documentId: any, idToCheck: any) => {
  try {
    const doc = await firebase.firestore().collection("customersData").doc(documentId).get();
    if (doc.exists) {
      const documentData = doc.data() as Data;
      const isIdPresent = documentData.toAcceptIds.includes(idToCheck);
      return isIdPresent;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return false;
  }
};

const BottomSheet: React.FC<BottomSheetProps> = ({ id, name, bio, onButtonClick, image,friendRequestId, visible, onClose, isSaving }) => {
  const [ispending, setIsPending] = useState<Boolean>(false);
  const [isaccept, setIsAccept] = useState<boolean>(false);
  const userId: string | null = localStorage.getItem("databaseId");

  if (id && userId) {
    pending(userId, id)
      .then((res) => {
        setIsPending(res);
      })
      .catch((err: any) => {
        console.log("error from catch block of pending", err);
      });
  } else {
    return null;
  }
  if (id && userId) {
    toAccept(userId, id)
      .then((res) => {
        setIsAccept(res);
      })
      .catch((err: any) => {
        console.log("error from catch block of pending", err);
      });
  } else {
    return null;
  }

  return (
    <Drawer
      anchor="bottom"
      open={visible}
      onClose={onClose}
      SlideProps={{
        style: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          height: "70vh",
          backgroundColor: colors.theme_color,
        },
      }}
      // sx={{ borderRadius: "25px", borderTopRightRadius: "25px" }}
      // variant="temporary"
    >
      <>
        <img
          src={image}
          alt="Profile"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "65%",
          }}
        />
        <div
          style={{
            textAlign: "start",
            marginTop: "20px",
            height: "17vh",
          }}
        >
          <h1
            style={{
              color: colors.white,
              fontFamily: "Public-Sans",
              fontSize: 20,
              fontWeight: "bold",
              width: "90%",
              margin: "0px auto",
            }}
          >
            {name}
          </h1>
          <p
            style={{
              color: "#999999",
              fontFamily: "Public-Sans",
              fontSize: 14,
              paddingTop: 10,
              width: "90%",
              height: "80%",
              margin: "0px auto",
            }}
          >
            {bio}
          </p>
        </div>
        <LoginButtonComponent
          name={ispending ? "Pending" : isaccept ? "Accept" : "Connect"}
          variant="contained"
          onClick={() => id && onButtonClick(id, isaccept)}
          disable={!!ispending || isSaving }
          style={{
            fontFamily: "Public-Sans",
            fontSize: 14,
            fontWeight: ispending ? "500" : "bold",
            width: "90%",
            borderRadius: 8,
            margin: "20px auto",
            color: ispending ? colors.white : colors.theme_color,
            backgroundColor: ispending || isSaving ? "#1F1F1F" : isaccept ? "#008000" : colors.white,
          }}
          isSaving={isSaving}
        />
      </>
    </Drawer>
  );
};

export default BottomSheet;
