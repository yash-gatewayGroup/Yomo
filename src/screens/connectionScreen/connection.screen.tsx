import React, { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav/BottomNavigation";
import Header from "../../components/Header/Header";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import "./connection.css";
import { db } from "../../firebase";
import { Timestamp, collection, doc, documentId, onSnapshot, query, where } from "firebase/firestore";
import SearchIcon from "@mui/icons-material/Search";
import Card from "../../components/Cards/Card";
import RecievedCard from "../../components/Cards/RecievedCard";
import { useNavigate } from "react-router-dom";

interface FriendRequest {
  receiverId: string;
  reqStatus: string;
  senderId: string;
  timestamp: Timestamp;
}

interface CustomerData {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  status: string;
  collectionId: string;
  customerId: string;
  friendRequestId: string;
  documentId?: string;
  accepted?: (id: string, collectionId: string) => void;
  rejected?: (id: string, collectionId: string) => void;
}

const ConnectionScreen = () => {
  // const [value, setValue] = React.useState("received");
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [receivecustomerData, setReceivecustomerData] = useState<CustomerData[]>([]);
  const [myConnection, setMyConnections] = useState<CustomerData[]>([]);
  const [received, setReceived] = useState<number>(0);
  const id: string | null = localStorage.getItem("databaseId");
  const [isSavingData, setIsSavingData] = useState<boolean>(false);
  const [value, setValue] = useState("received");
  const navigate = useNavigate();

  // **********************************************************Common Function ******************************************************************//

  //Handles the change of the Tab
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    const totalCount = receivecustomerData.length;
    setReceived(totalCount);
  };

  // Remove customerId from 'pendingIds' in 'customersData'
  const updatePendingIdsInUser = async (userId: string, idToRemove: string) => {
    const docRef = db.collection("customersData").doc(userId);
    const docSnapshot = await docRef.get();
    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const updatedPendingIds = data?.pendingIds.filter((id: any) => id !== idToRemove);
      await docRef.update({
        pendingIds: updatedPendingIds,
      });
    } else {
      console.log("Document does not exist.");
    }
  };

  // Remove customerId from 'toAcceptIds' in 'customerData'
  const updatetoAcceptIdsInUser = async (userId: string, idToRemove: string) => {
    const docRef = db.collection("customersData").doc(userId);
    const docSnapshot = await docRef.get();
    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const updatedPendingIds = data?.toAcceptIds.filter((id: any) => id !== idToRemove);
      await docRef.update({
        toAcceptIds: updatedPendingIds,
      });
    } else {
      console.log("Document does not exist.");
    }
  };

  // Add to 'connections' in 'customerData'
  const updateConnectionsInUser = async (userId: string, idToAddInConnection: string) => {
    if (id) {
      const customerDataRef = db.collection("customersData").doc(userId);
      const customerDataSnapshot = await customerDataRef.get();
      if (customerDataSnapshot.exists) {
        const customerData = customerDataSnapshot.data();
        const existingConnections = customerData?.connections || [];
        if (!existingConnections.includes(idToAddInConnection))
          await customerDataRef.update({
            connections: [...existingConnections, idToAddInConnection],
          });
      }
    }
  };

  // Delete Friend Request from 'friendRequests'
  const deleteFriendRequest = async (friendRequestId: string) => {
    if (friendRequestId) await db.collection("friendRequests").doc(friendRequestId).delete();
  };

  // Add to 'blockedIds' in 'customersData'
  const addUserToBlock = async (userId: string, userIdToBlock: string) => {
    if (id) {
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
    }
  };

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

  //Fetch Customers from provided array of requests ("Used as common in the Received and send Tab useEffect")
  const fetchCustomerData = async (recievedRequests: { customerId: string; friendRequestId: string }[]) => {
    try {
      const userData: CustomerData[] = [];
      const customers = await db
        .collection("customersData")
        .where(
          documentId(),
          "in",
          recievedRequests.map((r) => r.customerId)
        )
        .get();

      if (customers.size > 0) {
        customers.forEach((result: any) => {
          userData.push({
            ...result.data(),
            customerId: result.id,
            friendRequestId: recievedRequests.find((r) => r.customerId === result.id)?.friendRequestId,
          });
        });
      }
      return userData;
    } catch (error) {
      console.error("Error getting customer data:", error);
      return [];
    }
  };

  const searchClick = () => {
    console.log("Search clicked");
  };

  // **********************************************************Common Function ******************************************************************//

  // **********************************************************Received Tab ********************************************************************//
  //If the user clicks for 'Receive' Tab
  const Received = () => {
    //Function for Accepting the Friend Requests by the user
    const accepted = async (senderId: string, friendRequestId: string) => {
      try {
        if (senderId && id) {
          setIsSavingData(true);
          await updateConnectionsInUser(id, senderId);
          await updateConnectionsInUser(senderId, id);
          await updatePendingIdsInUser(id, senderId);
          await updatePendingIdsInUser(senderId, id);
          await updatetoAcceptIdsInUser(senderId, id);
          await updatetoAcceptIdsInUser(id, senderId);
          await deleteFriendRequest(friendRequestId);
          setIsSavingData(false);
        } else {
          console.error(`Document with ID does not exist in users collection.`);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    //If user Rejects the Friend Requests the this function is called
    const rejected = async (senderId: string, friendRequestId: string) => {
      try {
        if (senderId && id && friendRequestId) {
          await updatePendingIdsInUser(id, senderId);
          await updatePendingIdsInUser(senderId, id);
          await addUserToBlock(id, senderId);
          await deleteFriendRequest(friendRequestId);
          await handleChange;
        }
      } catch {
        console.error("errorr");
      }
    };

    // Fetch requests from 'friendRequests'
    useEffect(() => {
      try {
        const q = query(collection(db, "friendRequests"), where("receiverId", "==", id));
        const unsub = onSnapshot(q, async (querySnapshot) => {
          const recievedRequests: { customerId: string; friendRequestId: string }[] = [];
          querySnapshot.forEach((doc) => {
            const friendRequestId = doc.id;
            const { senderId } = doc.data() as FriendRequest;
            recievedRequests.push({ customerId: senderId, friendRequestId });
          });
          if (recievedRequests.length > 0) {
            const senders = await fetchCustomerData(recievedRequests);
            setReceivecustomerData(senders);
          } else {
            setReceivecustomerData([]);
          }
        });

        return () => {
          unsub();
        };
      } catch (error) {
        console.error("Error getting sender IDs:", error);
        return;
      }
    }, []);
    // **************************************************************//

    return (
      <>
        {receivecustomerData.length === 0 ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "#FFFFFF",
              zIndex: 2,
            }}
          >
            <span
              style={{
                color: "#666666",
                fontFamily: "Public Sans",
                fontSize: 12,
                fontWeight: "400",
              }}
            >
              You have not received any Friend Request
            </span>
          </div>
        ) : (
          <div className="connection-user-list">
            {receivecustomerData.map((customer) => (
              <RecievedCard key={customer.customerId} customer={customer} accepted={accepted} rejected={rejected} isSaving={isSavingData} />
            ))}
          </div>
        )}
      </>
    );
  };
  // **********************************************************Received Tab ********************************************************************//

  // **********************************************************Sender Tab **********************************************************************//
  //If the user clicks for 'Sent' Tab
  const Sender = () => {
    // **************************************************************//
    // Fetch requests from 'friendRequests'
    useEffect(() => {
      try {
        const q = query(collection(db, "friendRequests"), where("senderId", "==", id));
        const unsub = onSnapshot(q, async (querySnapshot) => {
          const sentRequests: { customerId: string; friendRequestId: string }[] = [];
          querySnapshot.forEach((doc) => {
            const friendRequestId = doc.id;
            const { receiverId } = doc.data() as FriendRequest;
            sentRequests.push({ customerId: receiverId, friendRequestId });
          });
          if (sentRequests.length > 0) {
            setCustomerData(await fetchCustomerData(sentRequests));
          } else {
            setCustomerData([]);
          }
        });

        return () => {
          unsub();
        };
      } catch (error) {
        console.error("Error getting receiver IDs:", error);
        return;
      }
    }, []);

    // Withdraw Sent Request
    const withdrawRequest = async (friendRequestId: string, receiverId: string, userId: string | null) => {
      if (friendRequestId && receiverId && userId) {
        setIsSavingData(true);
        await updatePendingIdsInUser(userId, receiverId);
        await updatetoAcceptIdsInUser(receiverId, userId);
        await deleteFriendRequest(friendRequestId);
        setIsSavingData(false);
      }
    };
    // **************************************************************//

    return (
      <>
        {customerData.length === 0 ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "#FFFFFF",
              zIndex: 2,
            }}
          >
            <span
              style={{
                color: "#666666",
                fontFamily: "Public Sans",
                fontSize: 12,
                fontWeight: "400",
              }}
            >
              Yor have no pending send Friend Request
            </span>
          </div>
        ) : (
          <div className="connection-user-list">
            {customerData.map((customer) => (
              <Card
                key={customer.id}
                customer={customer}
                deleteData={() => withdrawRequest(customer.friendRequestId, customer.customerId, id)}
                btnName="Withdraw"
                isSavingData={isSavingData}
              />
            ))}
          </div>
        )}
      </>
    );
  };
  // **********************************************************Sender Tab **********************************************************************//

  // **********************************************************Connection Tab ******************************************************************//
  //if the user is in the Connection tab then user will redirected here
  const Connection = () => {
    useEffect(() => {
      try {
        if (id) {
          const q = doc(db, "customersData", id);
          const unsub = onSnapshot(q, async (snapshot) => {
            const data = snapshot.data();
            const acceptedIdsArray = data?.connections;
            if (acceptedIdsArray) {
              const getBlockedUserData = await getConnectedUserDataByIds(acceptedIdsArray);
              setMyConnections(getBlockedUserData);
            } else {
              setMyConnections([]);
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

    //Send the user to the Block Array from the Connection
    const rejected = async (senderId: string) => {
      if (senderId && id) {
        setIsSavingData(true);
        await removeIdFromConnections(id, senderId);
        await removeIdFromConnections(senderId, id);
        await addUserToBlock(id, senderId);
        setIsSavingData(false);
      } else {
        console.log("Else Block Executed because Either senderId, Id, FriendRequestId Not found while Block");
      }
    };

    const message = (id: string) => {
      navigate(`/message/${id}`);
    };

    // **********************************************************Connection Tab ******************************************************************//

    return (
      <>
        {myConnection.length === 0 ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "#FFFFFF",
              zIndex: 2,
            }}
          >
            <span
              style={{
                color: "#666666",
                fontFamily: "Public Sans",
                fontSize: 12,
                fontWeight: "400",
              }}
            >
              You are not Connected to anyone.
            </span>
          </div>
        ) : (
          <div className="connection-user-list">
            {myConnection.map((connection) => (
              <RecievedCard
                key={connection.id}
                customer={connection}
                accepted={() => message(connection.customerId)}
                rejected={rejected}
                imageName="true"
                isSaving={isSavingData}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="tab-container">
        <div style={{ height: "7%" }}>
          <Header headerName="Matches" showOptionButton={true} iconName={<SearchIcon />} onOptionClick={searchClick} />
        </div>
        <div style={{ height: "86%" }}>
          <TabContext value={value}>
            <TabList onChange={handleChange}>
              <Tab
                value="received"
                label={
                  <div className="main-received-box">
                    <div className="tab-text">Received</div>
                    {received !== 0 && <div className="received-box">{received}</div>}
                  </div>
                }
              />
              <Tab
                label="Sent"
                value="sent"
                className="tab-text"
                style={{
                  color: "#FFFFFF",
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: "Public Sans",
                }}
              />
              <Tab
                label="My Connection"
                value="MyConnection"
                style={{
                  color: "#FFFFFF",
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: "Public Sans",
                }}
              />
            </TabList>
            <TabPanel value="received">{Received()}</TabPanel>
            <TabPanel value="sent">{Sender()}</TabPanel>
            <TabPanel value="MyConnection">{Connection()}</TabPanel>
          </TabContext>
        </div>
      </div>
      <div style={{ height: "6%" }}>
        <BottomNav screenValue="connection" />
      </div>
    </>
  );
};
export default ConnectionScreen;
