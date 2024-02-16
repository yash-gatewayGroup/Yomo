import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";

interface BottomSheetProps {
  id: string | undefined | number;
  name: string | undefined;
  bio: string | undefined | null;
  onButtonClick: (id: any) => void;
  image: string | undefined;
  visible: boolean;
  onClose: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  id,
  name,
  bio,
  onButtonClick,
  image,
  visible,
  onClose,
}) => {
  return (
    <>
      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#c0c0c0",
            height: "60%",
            borderTopLeftRadius: "50px",
            borderTopRightRadius: "50px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
            width: "100%",
          }}
        >
          <div
            style={{
              height: "40%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={image}
              alt="Profile"
              style={{
                maxWidth: "100%",
                maxHeight: "90%",
                objectFit: "cover",
                borderRadius:"50px",
                height:"100%",
                width:"44vh"
              }}
            />
          </div>
          <div style={{ width: "90%", height: "70%", textAlign: "start" }}>
            <h1 style={{ margin: 0 }}>{name}</h1>
            <p style={{ margin: 0 }}>{bio}</p>
          </div>

          <div
            style={{
              backgroundColor: "#808080",
              height: "5vh",
              width: "90%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              borderBottomLeftRadius: "20px",
              borderBottomRightRadius: "20px",
              zIndex: 1,
            }}
            onClick={(() => id && onButtonClick(id))}
          >
            <h2 style={{ fontSize: "1rem" }}>Connect</h2>{" "}
          </div>
          <div
            style={{
              width: "10vh",
              height: "7vh",
              margin: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={onClose}
          >
            <CancelIcon fontSize="large" />
          </div>
        </div>
      )}
    </>
  );
};

export default BottomSheet;
