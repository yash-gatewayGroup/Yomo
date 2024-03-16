import React from "react";
import { useParams } from "react-router-dom";
import "./chatscreen.css";
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, OutlinedInput, Paper, Popover } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularImage } from "../../components/CircleImage/circleImage";
import { makeStyles } from "@mui/styles";
import LoginButtonComponent from "../../components/Button/Button";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import Message from "../../components/Message/Message";
import firebase from "firebase/compat/app";
import EmojiPicker from "emoji-picker-react";

interface UserData {
  id: string;
  name: string;
  imageUrl: string;
  status: string;
  customerId: string;
}

interface verificationParams {
  connectionId?: string | undefined;
}

const useStyles = makeStyles({
  paper: {
    color: "black",
  },
});

interface EmojiPickerProps {
  ref?: React.RefObject<HTMLElement>;
  onEmojiClick: (emoji: any) => void;
  open: boolean;
  width?: string;
}

const MessageScreen: React.FC<verificationParams> = () => {
  const { connectionId } = useParams<{ connectionId?: string | undefined }>();
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openDialogue, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const userId: string = localStorage.getItem("databaseId") ?? "";
  const classes = useStyles();
  const [image, setImage] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);
  const [message, setMessage] = React.useState<string | null>(null);
  const [userMessages, setUserMessages] = React.useState<any[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState<boolean>(false);
  const emojiPickerRef = React.useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = React.useState<Boolean>(false);

  //********************************************************For emoji selection ******************************************************************/
  const onEmojiClick = (emojiData: any) => {
    setMessage((prevMessage) => {
      if (prevMessage === null || prevMessage === "") {
        return emojiData.emoji;
      } else {
        return prevMessage + emojiData.emoji;
      }
    });
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const pickerProps = {
    ref: emojiPickerRef,
    onEmojiClick: onEmojiClick,
    open: showEmojiPicker,
    width: "...",
  };

  const castedProps = pickerProps as EmojiPickerProps;

  //***************************************************************************************************************************************** */

  //For Getting the overall Messages and making the counter Reset for unreaded messages
  React.useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !connectionId) {
        console.error("User ID or connection ID is undefined.");
        return;
      }
      const user1 = userId;
      const user2 = connectionId;
      const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
      const msgsRef = collection(db, "messages", id, "chat");
      const q = query(msgsRef, orderBy("createdAt", "asc"));
      onSnapshot(q, (querySnapshot) => {
        let msgs: any[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push(doc.data());
        });
        setUserMessages(msgs);
      });
      const docSnap = await getDoc(doc(db, "lastMsg", id));
      if (docSnap.exists() && docSnap.data()?.from !== user1) {
        await updateDoc(doc(db, "lastMsg", id), { unread: false });
      }
    };

    fetchMessages();
    resetUnreadMessageCount();
  }, [userId, connectionId]);

  // To get the connected user data
  React.useEffect(() => {
    try {
      if (connectionId) {
        const q = doc(db, "customersData", connectionId);
        const unsub = onSnapshot(q, async (snapshot) => {
          const data = snapshot.data() as UserData;
          setUserData(data);
        });
        return () => {
          unsub();
        };
      } else {
        console.error("Accepted IDs field does not exist or is empty.");
      }
    } catch (error) {
      console.error("Error fetching accepted IDs:", error);
    }
  }, []);

  //for selecting the image
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  //for displaying the image after selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files.length > 0) {
        setImage(e.target.files[0]);
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
          setImageUrl(reader.result as string);
        };
      }
    }
  };

  //for closing the Report user dialogue box
  const handleCloseDialogue = () => {
    setOpen(false);
    setReason("");
  };

  //for opening the Report user dialogue box
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  //Remove the userId From the Connection Array
  const removeIdFromConnections = async (userId: string, idToRemove: string) => {
    try {
      const customerDataRef = db.collection("customersData").doc(userId);
      const docSnapshot = await customerDataRef.get();
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        const updatedConnectionIds = data?.connections.filter((id: any) => id !== idToRemove);
        await customerDataRef.update({
          connections: updatedConnectionIds,
        });
      }
    } catch {
      console.log("Catch Block Executed For Removing Id From the Connection Id");
    }
  };

  // Add to 'blockedIds' in 'customersData'
  const addUserToBlock = async (userId: string, userIdToBlock: string) => {
    const customerDataRef = db.collection("customersData").doc(userId);
    const customerDataSnapshot = await customerDataRef.get();
    if (customerDataSnapshot.exists) {
      const customerData = customerDataSnapshot.data();
      const existingBlockedIds = customerData?.blockedIds || [];
      if (!existingBlockedIds.includes(userIdToBlock)) {
        await customerDataRef.update({
          blockedIds: [...existingBlockedIds, userIdToBlock],
        });
      }
    }
  };

  //If the user wants to any Block Contact
  const blockConnection = async () => {
    if (userId && connectionId) {
      await removeIdFromConnections(userId, connectionId);
      await removeIdFromConnections(connectionId, userId);
      await addUserToBlock(userId, connectionId);
      navigate(-1);
      console.log("Blocked successful");
    }
  };

  //If the user wants to Report any connection
  const reportedUser = () => {
    console.log("Reported with reason:", reason);
    handleCloseDialogue();
  };

  //For going to previous screen
  const goBack = () => {
    navigate(-1);
  };

  // For the increasing counter in the unreaded messages
  const incrementUnreadMessageCount = async (userId: string) => {
    try {
      const lastMsgDocRef = doc(db, "customersData", userId);
      const lastMsgDocSnap = await getDoc(lastMsgDocRef);
      if (lastMsgDocSnap.exists()) {
        const currentUnreadCount = lastMsgDocSnap.data().unread || 0;
        const newUnreadCount = currentUnreadCount + 1;
        await updateDoc(lastMsgDocRef, { unread: newUnreadCount });
        console.log("Unread message count updated successfully for user", userId);
      } else {
        console.error("Last message document not found for user", userId);
      }
    } catch (error) {
      console.error("Error updating unread message count:", error);
    }
  };

  //For reseting the unread message counter
  const resetUnreadMessageCount = async () => {
    try {
      const lastMsgDocRef = doc(db.collection("customersData"), connectionId);
      await updateDoc(lastMsgDocRef, { unread: 0 });
    } catch (error) {
      console.error("Error resetting unread message count:", error);
    }
  };

  //when user sends the message to the connection
  const handleSubmit = async (e: any) => {
    handleClearMessage();
    setIsLoading(true);
    e.preventDefault();
    const user1 = userId ?? "";
    const user2 = connectionId ?? "";
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let hasMessageOrImage = false;

    if (message) {
      hasMessageOrImage = true;
    }

    if (imageUrl) {
      hasMessageOrImage = true;
    }

    if (!hasMessageOrImage) {
      return;
    }
    const newTimestamp = firebase.firestore.Timestamp.now();
    const lastMsgDocRef = doc(db, "lastMsg", id);
    const lastMsgData = {
      message,
      from: user1,
      to: user2,
      createdAt: newTimestamp,
      media: imageUrl || "",
      unread: true,
    };
    await setDoc(lastMsgDocRef, lastMsgData);
    await incrementUnreadMessageCount(user1);

    if (message && imageUrl) {
      await addDoc(collection(db, "messages", id, "chat"), { message, from: user1, to: user2, createdAt: newTimestamp, media: imageUrl });
    } else if (imageUrl) {
      await addDoc(collection(db, "messages", id, "chat"), { from: user1, to: user2, createdAt: newTimestamp, media: imageUrl });
    } else if (message) {
      await addDoc(collection(db, "messages", id, "chat"), { message, from: user1, to: user2, createdAt: newTimestamp });
    } else {
      console.log("Kindly Enter some data");
    }

    if (message && imageUrl) {
      await setDoc(doc(db, "lastMsg", id), { message, from: user1, to: user2, createdAt: newTimestamp, media: imageUrl, unread: true });
    } else if (imageUrl) {
      await setDoc(doc(db, "lastMsg", id), { from: user1, to: user2, createdAt: newTimestamp, media: imageUrl, unread: true });
    } else if (message && !imageUrl) {
      await setDoc(doc(db, "lastMsg", id), { message, from: user1, to: user2, createdAt: newTimestamp, unread: true });
    } else {
      console.log("Kindly Enter some data");
    }
    setIsLoading(false);
  };

  //handles the message texts
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  //clearing the messages
  const handleClearMessage = () => {
    setMessage("");
    setImageUrl(undefined);
  };

  return (
    <>
      <div className="main-message-container">
        <div className="message-icon">
          <IconButton onClick={goBack} style={{ color: "white" }} size="medium">
            <ArrowBackIcon />
          </IconButton>
        </div>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          PaperProps={{
            style: { borderRadius: "12px" },
          }}
        >
          <Paper elevation={3}>
            <Box p={1}>
              <div className="main-box-container">
                <div className="main-box" onClick={blockConnection}>
                  <span className="box-text">Block</span>
                </div>
                <div
                  className="report-box"
                  onClick={() => {
                    setOpen(true);
                    handleClose();
                  }}
                >
                  <span className="box-text">Report</span>
                </div>
              </div>
            </Box>
          </Paper>
        </Popover>
        <Dialog
          open={openDialogue}
          onClose={handleCloseDialogue}
          classes={{
            paper: classes.paper,
          }}
        >
          <DialogTitle style={{ fontFamily: "Public Sans", fontSize: 16, fontWeight: "bold" }}>
            Are you sure you want to report "{userData?.name}" <br></br>Tell us reason why you want to report
          </DialogTitle>{" "}
          <DialogContent>
            <OutlinedInput
              id="reason"
              type="text"
              fullWidth
              value={reason}
              style={{ height: "150px", justifyContent: "flex-start", alignItems: "flex-start" }}
              placeholder="Your text here"
              onChange={(e) => setReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <LoginButtonComponent
              onClick={reportedUser}
              variant="contained"
              style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                fontFamily: "Public Sans",
                fontSize: 14,
                fontWeight: "bold",
                width: "30%",
              }}
              name="Report"
            />
            <LoginButtonComponent
              onClick={handleCloseDialogue}
              variant="contained"
              style={{
                backgroundColor: "#1f1f1f",
                color: "#ffffff",
                fontFamily: "Public Sans",
                fontSize: 14,
                fontWeight: "400",
                width: "30%",
              }}
              name="Cancel"
            />
          </DialogActions>
        </Dialog>
        <div className="header-message-screen">
          <CircularImage imageUrl={userData?.imageUrl} alt={userData?.name} style={{ height: "100%", width: "13%" }} />
          <div className={`status-dot-message ${userData?.status === "active" ? "green" : "red"}`}></div>
          <div className="header-name-text">{userData?.name}</div>
        </div>
        <div className="message-icon">
          <IconButton aria-label="delete" onClick={handleClick}>
            <MoreVertIcon fontSize="medium" style={{ color: "#ffffff" }} />
          </IconButton>
        </div>
      </div>
      <div className="chat-container">{userMessages.length ? userMessages.map((msg, i) => <Message key={i} msg={msg} user1={userId} />) : null}</div>

      <div className="message-bottom-nav">
        <div className="add-attachment">
          <IconButton aria-label="emoji-selection" onClick={toggleEmojiPicker}>
            <EmojiEmotionsIcon fontSize="medium" style={{ color: "#ffffff" }} />
          </IconButton>
          <div className="emoji-container">
            <EmojiPicker {...castedProps} />
          </div>
        </div>
        <div className="chat-text-container">
          <OutlinedInput
            placeholder="Type a message"
            style={{ color: "#ffffff", width: "100%", height: "70%", outlineWidth: "0px" }}
            onChange={handleInputChange}
            value={message}
          />
        </div>
        <div className="add-attachment">
          <input ref={fileInputRef} type="file" id="img" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          <IconButton aria-label="attach-photo" onClick={handleButtonClick}>
            {imageUrl ? (
              <img src={imageUrl} style={{ height: "25px", width: "25px" }} />
            ) : (
              <AddPhotoAlternateIcon fontSize="medium" style={{ color: "#ffffff" }} />
            )}
          </IconButton>
        </div>
        {imageUrl || message ? (
          <div className="add-attachment">
            {isLoading ? (
              <div className="message-send-loader">
              <CircularProgress style={{color:"#ffffff" }} size={25} />
              </div>
            ) : (
              <IconButton aria-label="send" onClick={handleSubmit}>
                <SendOutlinedIcon fontSize="small" style={{ color: "#ffffff" }} />
              </IconButton>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
};
export default MessageScreen;
