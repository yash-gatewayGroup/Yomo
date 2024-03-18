import React, { useRef, useEffect } from "react";
import moment from "moment-timezone";
import avatarImageSrc from "../../assets/avatar.png";
import ZoomableImage from "../ZoomableImage/ZoomableImage";

interface MessageProps {
  msg: {
    from: string | undefined;
    media?: string | undefined;
    message: string | undefined;
    createdAt: number;
  };
  user1: string | null;
}

const Message: React.FC<MessageProps> = ({ msg, user1 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);

  const createdAtDate = new Date(msg.createdAt * 1000);  
  const createdAtInIST = moment(createdAtDate).tz("Asia/Kolkata").format("h:mm A");
  const [showZoomedImage, setShowZoomedImage] = React.useState(false);
  const [clickedImageUrl, setClickedImageUrl] = React.useState<string | undefined>("");

  const handleClick = (imageUrl: string) => {
    setClickedImageUrl(imageUrl);
    setShowZoomedImage(true);
  };

  const handleClose = () => {
    setShowZoomedImage(false);
    setClickedImageUrl("");
  };

  return (
    <div className={`message_wrapper ${msg.from === user1 ? "own" : ""}`} ref={scrollRef}>
      {clickedImageUrl && <ZoomableImage imageUrl={clickedImageUrl} onClose={handleClose} />}
      <div style={{ flexDirection: "column", display: "flex", justifyContent: "flex-end", paddingInlineEnd: "5%" }}>
        {msg.from === user1 ? (
          <small style={{ alignSelf: msg.from === user1 ? "flex-end" : "flex-start", color: "#999999", fontSize: 12, fontFamily: "Public Sans" }}>
            {createdAtInIST}
          </small>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <img src={avatarImageSrc} alt="Avatar" style={{ height: "32px", width: "32px", borderRadius: "50%", marginLeft: "15px" }} />

            <small
              style={{
                alignSelf: msg.from === user1 ? "flex-end" : "flex-start",
                color: "#999999",
                fontSize: 12,
                fontFamily: "Public Sans",
                marginTop: "10px",
                paddingInlineStart: "8px",
              }}
            >
              {createdAtInIST}
            </small>
          </div>
        )}
        {msg.media && msg.message ? (
          <p className={msg.from === user1 ? "me" : "friend"}>
            <div style={{ justifyContent: msg.from === user1 ? "flex-end" : "flex-start", display: "flex" }}>
              {msg.media && (
                <img
                  src={msg.media}
                  alt={msg.message}
                  style={{ height: "50%", width: "80%", alignSelf: msg.from === user1 ? "flex-end" : "flex-start" }}
                  onClick={() => handleClick(msg.media ?? "")}
                />
              )}
            </div>
            <div style={{ paddingTop: "8px" }}>{msg.message}</div>
            <br />
          </p>
        ) : msg.media ? (
          <div style={{ width: "60%", alignSelf: msg.from === user1 ? "flex-end" : "", paddingLeft: msg.from != user1 ? "40px" : "0px" }}>
            <img
              src={msg.media}
              alt={msg.message}
              style={{
                height: "50%",
                width: "100%",
                maxWidth: "100%",
                aspectRatio: "1 / 1",
                borderRadius: "10px",
              }}
              onClick={() => handleClick(msg.media ?? "")}
            />
          </div>
        ) : msg.message ? (
          <p className={msg.from === user1 ? "me" : "friend"}>
            {msg.message}
            <br />
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Message;
