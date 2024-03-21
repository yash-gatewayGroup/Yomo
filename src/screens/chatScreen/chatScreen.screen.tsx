import React from "react";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNavigation";
import "./chatscreen.css";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { CircularImage } from "../../components/CircleImage/circleImage";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Fab, IconButton, InputBase, Paper } from "@mui/material";
import moment from "moment-timezone";
import AddIcon from "@mui/icons-material/Add";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

interface CustomerData {
  id: string;
  name: string;
  imageUrl: string;
  status: string;
  unread: number;
  customerId: string;
}

const ChatScreen = () => {
  const id: string | null = localStorage.getItem("databaseId");
  const [myConnection, setMyConnections] = React.useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [lastMessages, setLastMessages] = React.useState<{ [key: string]: string }>({});
  const [timeAgo, setTimeAgo] = React.useState<{ [key: string]: string }>({});
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState<CustomerData[]>([]);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const navigate = useNavigate();

  // Fetching the last message of the connections
  const getLastMessage = async (user2: string) => {
    const userId: string | null = localStorage.getItem("databaseId") ?? "";
    const id = userId > user2 ? `${userId + user2}` : `${user2 + userId}`;
    const msgsRef = db.collection("lastMsg").doc(id);
    const doc = await msgsRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data) {
        if (data.message !== undefined) {
          const messageTime = moment.unix(data.createdAt.seconds);
          setLastMessages((prevLastMessages) => ({
            ...prevLastMessages,
            [user2]: data.message,
          }));
          setTimeAgo((prevLastMessages) => ({
            ...prevLastMessages,
            [user2]: messageTime.fromNow(),
          }));
        } else {
          const messageTime = moment.unix(data.createdAt.seconds);
          setLastMessages((prevLastMessages) => ({
            ...prevLastMessages,
            [user2]: "Media",
          }));
          setTimeAgo((prevLastMessages) => ({
            ...prevLastMessages,
            [user2]: messageTime.fromNow(),
          }));
        }
      } else {
        console.log("No such document!");
      }
    }
  };

  //Getting the data of the users who are there in connections by their id
  const getConnectedUserDataByIds = async (connectedIds: string[]) => {
    try {
      const customerDataPromises: Promise<CustomerData>[] = [];
      for (const customerId of connectedIds) {
        const docRef = doc(db, "customersData", customerId);
        const promise = new Promise<CustomerData>((resolve, reject) => {
          onSnapshot(
            docRef,
            (snapshot) => {
              const data = snapshot.data() as CustomerData;
              const newData = { ...data, customerId: snapshot.id };
              getLastMessage(snapshot.id);
              resolve(newData);
            },
            reject
          );
        });
        customerDataPromises.push(promise);
      }
      const resolvedData = await Promise.all(customerDataPromises);
      return resolvedData;
    } catch (error) {
      console.error("Error fetching customer data:", error);
      return [];
    }
  };

  //Getting the list of user who are connected
  React.useEffect(() => {
    setIsLoading(true);
    try {
      if (id) {
        const q = doc(db, "customersData", id);
        const unsub = onSnapshot(q, async (snapshot) => {
          const data = snapshot.data();
          const acceptedIdsArray = data?.connections;
          if (acceptedIdsArray) {
            const getBlockedUserData = await getConnectedUserDataByIds(acceptedIdsArray);
            setMyConnections(getBlockedUserData);
            setIsLoading(false);
          } else {
            setMyConnections([]);
            setIsLoading(false);
          }
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

  //Function for opening the searchBar
  const searchClick = () => {
    setSearchOpen(true);
    console.log("Search Pressed");
  };

  //Function for handling the search Response
  const handleSearchClose = () => {
    setSearchOpen(false);
    setFilteredData([]);
  };

  //Getting the value from the searchbar
  const handleInputChange = (e: any) => {
    const { value } = e.target;
    if (e.key === "Enter") {
      setSearchValue(value);
      const filtered = myConnection.filter((item) => item.name.toLowerCase().includes(searchValue.toLowerCase()));
      setFilteredData(filtered);
    } else {
      setSearchValue(value);
      const filtered = myConnection.filter((item) => item.name.toLowerCase().includes(searchValue.toLowerCase()));
      setFilteredData(filtered);
    }
  };

  //if user selects the chat option
  const handleChangeScreen = (id: string) => {
    navigate(`/message/${id}`);
  };

  return (
    <div style={{ height: "100%" }}>
      {searchOpen ? (
        <div className="header-container">
          <div className="search-bar-container">
            <Paper
              component="form"
              sx={{ display: "flex", alignItems: "center", width: "90%", height: "70%", borderRadius: "25px" }}
              className="search-bar-paper"
            >
              <IconButton sx={{ color: "#000000" }} aria-label="menu" onClick={handleSearchClose}>
                <KeyboardBackspaceIcon />
              </IconButton>
              <InputBase sx={{ ml: 1, flex: 1 }} onKeyDown={handleInputChange} placeholder="Search by name" onChange={handleInputChange} />
            </Paper>
          </div>
        </div>
      ) : myConnection.length > 8 ? (
        <div className="header-container">
          <Header headerName="Chats" showOptionButton={true} iconName={<SearchIcon />} onOptionClick={searchClick} />
        </div>
      ) : (
        <div className="header-container">
          <Header headerName="Chats" />
        </div>
      )}

      <div className="main-chat-container">
        {isLoading ? (
          <div className="chat-loader-style">
            <CircularProgress style={{ color: "#ffffff" }} />
          </div>
        ) : myConnection.length === 0 ? (
          <div className="no-data-text">
            <div className="no-chat-text">No chats found, Kindly start chatting with the peoples around you</div>
          </div>
        ) : (
          <div className="chat-user-list">
            {!searchOpen
              ? myConnection.map((user) => (
                  <div key={user.id} className="chat-user-item" onClick={() => handleChangeScreen(user.customerId)}>
                    <div className="image-container">
                      <CircularImage imageUrl={user.imageUrl} alt={user.name} />
                      <div className={`statusdot ${user.status === "online" ? "green" : "red"}`}></div>
                    </div>
                    {lastMessages[user.customerId] != null ? (
                      <div className="user-details-row">
                        <p className="user-name">{user.name}</p>
                        <p className="minutes-ago">{timeAgo[user.customerId]}</p>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontFamily: "Public Sans",
                          fontSize: "14px",
                          fontWeight: "400",
                          paddingInlineStart: "12px",
                        }}
                      >
                        {user.name}
                      </div>
                    )}
                    <div className="user-details-row">
                      <p className="user-last-message">{lastMessages[user.customerId]}</p>
                      {user.unread != 0 ? (
                        <div className="green-circle">
                          <p className="unread-number-of-messages">{user.unread}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              : null}
            {filteredData.length !== 0 || !searchOpen ? (
              filteredData.map((user) => (
                <div key={user.id} className="chat-user-item" onClick={() => handleChangeScreen(user.customerId)}>
                  <div style={{ width: "15%" }}>
                    <CircularImage imageUrl={user.imageUrl} alt={user.name} />
                    <div className={`status-dot-chat ${user.status === "online" ? "green" : "red"}`}></div>
                  </div>
                  <div className="user-details-container">
                    <div className="user-details-row">
                      <p className="user-name">{user.name}</p>
                      <p className="minutes-ago">{timeAgo[user.customerId]}</p>
                    </div>
                    <div className="user-details-row">
                      <p className="user-last-message">{lastMessages[user.customerId]}</p>
                      {user.unread !== 0 && (
                        <div className="green-circle">
                          <p className="unread-number-of-messages">{user.unread}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : filteredData.length === 0 && searchValue ? (
              <div className="no-data-text">
                <div className="no-chat-text">No chats found for the name you have searched</div>
              </div>
            ) : (
              <div className="no-data-text">
                <div className="no-chat-text">Please enter the name in the searchbox whom you want to search</div>
              </div>
            )}

            {myConnection.length > 8 && (
              <Fab
                size="medium"
                aria-label="add"
                style={{
                  position: "fixed",
                  bottom: "10%",
                  right: "2vh",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }}
              >
                <AddIcon />
              </Fab>
            )}
          </div>
        )}
      </div>

      <div className="bottom-nav-container">
        <BottomNav screenValue="chats" />
      </div>
    </div>
  );
};

export default ChatScreen;
