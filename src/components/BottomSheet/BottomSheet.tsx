import React, { useState } from "react";
import "@fontsource/public-sans";
import Drawer from "@mui/material/Drawer";
import LoginButtonComponent from "../Button/Button";
import firebase from "firebase/compat/app";
import { CircularProgress } from "@mui/material";

interface BottomSheetProps {
  id: string | undefined | null;
  name: string | undefined;
  bio: string | undefined | null;
  onButtonClick: (id: any) => void;
  image: string | undefined;
  visible: boolean;
  onClose?: () => void;
  isSaving?: Boolean;
}

interface Data {
  pendingIds: string[];
}

const pending = async (documentId: any, idToCheck: any) => {
  try {
    const doc = await firebase
      .firestore()
      .collection("customersData")
      .doc(documentId)
      .get();
    if (doc.exists) {
      const documentData = doc.data() as Data;
      const isIdPresent = documentData.pendingIds.includes(idToCheck);
      console.log(
        `ID ${idToCheck} is${isIdPresent ? "" : " not"} present in pendingIds.`
      );
      return isIdPresent;
    } else {
      console.log("No document found with the provided ID.");
      return false;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return false;
  }
};
const BottomSheet: React.FC<BottomSheetProps> = ({
  id,
  name,
  bio,
  onButtonClick,
  image,
  visible,
  onClose,
  isSaving,
}) => {
  const [ispending, setIsPending] = useState<Boolean>(false);
  const userId: string | null = localStorage.getItem("databaseId");

  if (id && userId) {
    pending(userId, id)
      .then((res) => {
        setIsPending(res);
        console.log("checkiPending res", res);
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
          backgroundColor: "#000000",
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
              color: "#FFFFFF",
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
          name={ispending ? "Pending"  : "Connect"}
          variant="contained"
          onClick={() => id && onButtonClick(id)}
          disable={!!ispending || isSaving}
          style={{
            fontFamily: "Public-Sans",
            fontSize: 14,
            fontWeight: ispending ? "500" : "bold",
            width: "90%",
            borderRadius: 8,
            margin: "20px auto",
            color: ispending ? "#FFFFFF" : "#000000",
            backgroundColor: ispending || isSaving ? "#1F1F1F" : "#FFFFFF",
          }}
          isSaving={isSaving}
        />
      </>
    </Drawer>
  );
};

export default BottomSheet;
