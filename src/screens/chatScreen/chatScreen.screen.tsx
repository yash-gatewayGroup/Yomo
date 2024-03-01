import React from "react";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNavigation";
import "./chatscreen.css";

const ChatScreen = () => {
  const profiles = [
    {
      id: 1,
      profilePic: "profile1.jpg",
      name: "John Doe",
      minutesAgo: 5,
      messageNumber: 1,
      lastMessage: "Hey there! How are you?",
      status: "active",
    },
    {
      id: 2,
      profilePic: "profile2.jpg",
      name: "Jane Smith",
      minutesAgo: 10,
      messageNumber: 2,
      lastMessage: "I'm doing well, thank you",
      status: "active",
    },
  ];

  return (
    <>
      <Header headerName="Chats" />
      <div className="chat-user-list">
        {profiles.map((user) => (
          <div key={user.id} className="chat-user-item">
            <div className="chat-profile-pic-container">
              <img
                src={user.profilePic}
                alt={user.name}
                className="profile-pic"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
              <div
                className={`status-dot ${
                  user.status === "active" ? "green" : "red"
                }`}
              ></div>
            </div>
            <div className="user-details-container">
              <div className="user-details-row">
                <p className="user-name">{user.name}</p>
                <p className="minutes-ago">{user.minutesAgo} min</p>
              </div>
              <div className="user-details-row">
                <p className="user-last-message">{user.lastMessage}</p>
                <div className="green-circle">{user.minutesAgo}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav screenValue="chats"/>
    </>
  );
};

export default ChatScreen;
