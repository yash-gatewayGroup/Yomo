import React, { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav/BottomNavigation";
import Header from "../../components/Header/Header";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import "./connection.css";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import TextsmsIcon from "@mui/icons-material/Textsms";
import { db } from "../../firebase";
import { Timestamp } from "firebase/firestore";
import { CircularProgress } from "@mui/material";

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
  documentId?: string;
}

interface SenderData {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  status: string;
  collectionId: string;
}

const ConnectionScreen = () => {
  const [value, setValue] = React.useState("received");
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [receivecustomerData, setReceivecustomerData] = useState<SenderData[]>(
    []
  );
  const [myConnection, setMyConnections] = useState<CustomerData[]>([]);
  const [received, setReceived] = useState<number>(0);
  const id: string | null = localStorage.getItem("databaseId");
  const [loading, setLoading] = useState(false);

  // const getProfile = async (profileId: string) => {
  //   try {
  //     const snapshot: any = await db
  //       .collection("customersData")
  //       .doc(profileId)
  //       .get();
  //     setProfileSentData((prevData) => prevData.concat(snapshot.data()));
  //   } catch (error) {
  //     console.error("Error fetching profile:", error);
  //     return null;
  //   }
  // };

  // const getSentFriendRequests = async (senderId: string, userId: string) => {
  //   try {
  //     const snapshot = await db
  //       .collection("customersData")
  //       .doc(userId)
  //       .collection("sent")
  //       .doc(senderId)
  //       .get();

  //     const data = snapshot.data();
  //     if (data) {
  //       const sentRequest = {
  //         receiverId: data.id,
  //         status: data.status,
  //       };
  //       getProfile(data.id);
  //       return sentRequest;
  //     } else {
  //       console.error("Document not found");
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error("Error getting sent friend request:", error);
  //     return null;
  //   }
  // };

  //Common Function For changing the Tab

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    const totalCount = receivecustomerData.length;
    setReceived(totalCount);
  };

  async function removeIdFromAcceptedIds(idToRemove: string) {    
    try {
      if (id) {
        const userRef = db.collection("customersData").doc(id);
        const userSnapshot = await userRef.get();
        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          if (userData) {
            const acceptedIds = userData.acceptedIds || [];
            if (acceptedIds.includes(idToRemove)) {
              const updatedAcceptedIds = acceptedIds.filter(
                (id: any) => id !== idToRemove
              );
              await userRef.update({ acceptedIds: updatedAcceptedIds });
              window.location.reload();
              setLoading(false);
            } else {
              console.log(
                `ID ${idToRemove} not found in accepted IDs for user ${id}`
              );
              window.location.reload();
              setLoading(false);
            }
          } else {
            console.log(`User document with ID ${id} not found`);
            window.location.reload();
            setLoading(false);
          }
        } else {
          console.error("User data not available");
          window.location.reload();
          setLoading(false);
        }
      } else {
        console.error("Id not Found");
        window.location.reload();
        setLoading(false);
      }
    } catch (error) {
      console.error("Error removing ID from accepted IDs:", error);
      window.location.reload();
      setLoading(false);
    }
  }

  //Function for Removing the Accepted Id's
  const removeFromAcceptedIds = async (customerId: string) => {
    try {
      const customerDataRef = db.collection("customersData").doc(customerId);
      const customerDataSnapshot = await customerDataRef.get();
      if (customerDataSnapshot.exists) {
        const customerData = customerDataSnapshot.data();
        const existingIds = customerData?.acceptedIds || [];
        const updatedAcceptedIds = existingIds.filter(
          (existingId: any) => existingId !== id
        );
        await customerDataRef.update({
          acceptedIds: updatedAcceptedIds,
        });
        console.error(
          `Customer ID ${id} removed from the acceptedIds array in document ${customerId}`
        );
        removeIdFromAcceptedIds(customerId);
      } else {
        console.error(
          `Document with ID ${customerId} does not exist in customersData collection.`
        );
        removeIdFromAcceptedIds(customerId);
      }
    } catch (error) {
      console.error(`Error removing ${id} from acceptedIds:`, error);
    }
  };

  //common Function for sending the user to the Blocked
  const blocked = async (documentId: any) => {
    setLoading(true);
    if (id) {
      const customerDataRef = db.collection("customersData").doc(id);
      const customerDataSnapshot = await customerDataRef.get();

      if (customerDataSnapshot.exists) {
        const customerData = customerDataSnapshot.data();
        const existingIds = customerData?.blockedIds || [];
        const updatedIdsSet = new Set([...existingIds, documentId]);
        const updatedIds = Array.from(updatedIdsSet);
        await customerDataRef.update({
          blockedIds: updatedIds,
        });
        removeFromAcceptedIds(documentId);
      } else {
        const updatedIds = [documentId];
        await customerDataRef.set(
          {
            blockedIds: updatedIds,
          },
          { merge: true }
        );
        removeFromAcceptedIds(documentId);
      }
    } else {
      console.error("Error: No ID provided.");
    }
  };

  //When the user clicks for Received Tab
  const Received = () => {
    //Delete the data after the user has accepted the FriendRequests or deleted the Friend Requests
    const deleteData = async (collectionId: string) => {
      if (collectionId) {
        setLoading(true);
        await db.collection("friendRequests").doc(collectionId).delete();
        window.location.reload();
        setLoading(false);
      } else {
        console.error("No Collection Data Found");
        setLoading(false);
      }
    };

    //Get the Document ID by passing the id we are getting in the collection
    const getDocumentIdsByField = async (
      collectionPath: string,
      fieldName: string,
      fieldValue: any
    ): Promise<string[]> => {
      try {
        const collectionRef = db.collection(collectionPath);
        const querySnapshot = await collectionRef
          .where(fieldName, "==", fieldValue)
          .get();
        const documentIds: string[] = [];
        querySnapshot.forEach((doc) => {
          documentIds.push(doc.id);
        });
        return documentIds;
      } catch (error) {
        console.error("Error getting document IDs:", error);
        return [];
      }
    };

    //Function for Accepting the Friend Requests by the user
    const accepted = async (customerId: string, collectionId: string) => {
      let usersDocumentId: string;
      setLoading(true);
      try {
        const documentIds = await getDocumentIdsByField(
          "customersData",
          "id",
          customerId
        );
        if (documentIds.length > 0) {
          usersDocumentId = documentIds[0];
          if (id) {
            const customerDataRef = db.collection("customersData").doc(id);
            const customerDataSnapshot = await customerDataRef.get();
            if (customerDataSnapshot.exists) {
              const customerData = customerDataSnapshot.data();
              const existingIds = customerData?.acceptedIds || [];
              let updatedIds;
              if (existingIds.length > 0) {
                updatedIds = [...existingIds, usersDocumentId];
              } else {
                updatedIds = [usersDocumentId];
              }
              await customerDataRef.update({
                acceptedIds: updatedIds,
              });
              setLoading(false);
              const userDocumentRef = db
                .collection("customersData")
                .doc(usersDocumentId);
              const userDocumentSnapshot = await userDocumentRef.get();
              if (userDocumentSnapshot.exists) {
                const userData = userDocumentSnapshot.data();
                const existingAcceptedIds = userData?.acceptedIds || [];

                let updatedAcceptedIds;
                if (existingAcceptedIds.length > 0) {
                  updatedAcceptedIds = [...existingAcceptedIds, id];
                } else {
                  updatedAcceptedIds = [id];
                }

                await userDocumentRef.update({
                  acceptedIds: updatedAcceptedIds,
                });
                setLoading(false);
              } else {
                console.error(
                  `Document with ID ${usersDocumentId} does not exist in users collection.`
                );
                setLoading(false);
              }
              deleteData(collectionId);
            } else {
              console.error("No data Exists");
            }
          }
        } else {
          console.error(
            "Error: No document ID found for the provided customer ID."
          );
          setLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    //If user Rejects the Friend Requests the this function is called
    const rejected = async (customerId: string, collectionId: string) => {
      setLoading(true);
      let usersDocumentId: string;
      try {
        const documentIds = await getDocumentIdsByField(
          "customersData",
          "id",
          customerId
        );
        if (documentIds.length > 0) {
          usersDocumentId = documentIds[0];
          blocked(usersDocumentId);
          deleteData(collectionId);
          setLoading(false);
        } else {
          console.error("No Id Found");
          setLoading(false);
        }
      } catch {
        console.error("errorr");
        setLoading(false);
      }
    };

    //Get the Id who sends the Requests
    const getSendersIds = async () => {
      try {
        const snapshot = await db
          .collection("friendRequests")
          .where("receiverId", "==", id)
          .get();
        const senderIds: { senderId: string; collectionId: string }[] = [];
        snapshot.forEach((doc) => {
          const collectionId = doc.id;
          const { senderId } = doc.data() as FriendRequest;
          senderIds.push({ senderId, collectionId });
        });
        return senderIds;
      } catch (error) {
        console.error("Error getting sender IDs:", error);
        return [];
      }
    };

    //To get who has sended the Data
    const fetchSenderData = async (
      senderIds: { senderId: string; collectionId: string }[]
    ) => {
      setLoading(true);
      const senderData: SenderData[] = [];
      for (const { senderId, collectionId } of senderIds) {
        try {
          const snapshot = await db
            .collection("customersData")
            .doc(senderId)
            .get();
          if (snapshot.exists) {
            const data = snapshot.data() as SenderData;
            senderData.push(data);
            setLoading(false);
          }
        } catch (error) {
          console.error(
            `Error fetching sender data for ID ${senderId}:`,
            error
          );
          setLoading(false);
        }
      }
      return senderData.map((sender, index) => ({
        ...sender,
        collectionId: senderIds[index].collectionId,
      }));
    };

    //Getting the Senders data for the send Tab
    useEffect(() => {
      const getSenderData = async () => {
        setLoading(true);
        try {
          const senderIds = await getSendersIds();
          const fetchedSenderData = await fetchSenderData(senderIds);
          setReceivecustomerData(fetchedSenderData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching sender data:", error);
          setLoading(false);
        }
      };
      getSenderData();
    }, []);

    return (
      <>
        {loading ? (
          <div className="loading-indicator">
            <CircularProgress />
          </div>
        ) : (
          <div className="connection-user-list">
            {receivecustomerData.map((customer) => (
              <div key={customer.id} className="connection-user-item">
                <div className="profile-pic-container">
                  <img
                    src={customer.imageUrl}
                    alt={customer.name}
                    className="profile-pic"
                  />
                  <div
                    className={`status-dot ${
                      customer.status === "online" ? "green" : "red"
                    }`}
                  ></div>
                </div>
                <div className="user-details">
                  <p className="user-name">{customer.name}</p>
                </div>
                <div
                  style={{ paddingRight: 10 }}
                  onClick={() => accepted(customer.id, customer.collectionId)}
                >
                  <CheckBoxIcon />
                </div>
                <div
                  onClick={() => rejected(customer.id, customer.collectionId)}
                >
                  <CancelIcon />
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  //If the user is in the send tab then he wil be redirecting here
  const Sender = () => {
    // const withDraw = async (userId: string) => {
    //   console.error("userId", userId);

    //   const id: string | null = localStorage.getItem("databaseId");
    //   if (id) {
    //     try {
    //       const snapshot = await db.collection("customersData").doc(id).get();
    //       const userData = snapshot.data();
    //       if (userData && userData.id) {
    //         const customerId = userData.id;
    //         console.error("customerId",customerId);

    //         if (userId === customerId) {
    //           console.error("User ID matches customer ID");
    //         } else {
    //           console.error("User ID does not match customer ID");
    //         }
    //       } else {
    //         console.error("Invalid customer data or missing ID");
    //       }
    //     } catch (error) {
    //       console.error("Error getting customer data:", error);
    //     }
    //   }
    // };
    const withDraw = async (documentId: string) => {
      setLoading(true);
      try {
        await db.collection("friendRequests").doc(documentId).delete();
        window.location.reload();
        setLoading(false);
      } catch (error) {
        console.error("Error withDrawing:", error);
        setLoading(false);
      }
    };

    //To get the id of the who has sended the Request
    const getSendersIds = async () => {
      setLoading(true);
      try {
        const snapshot = await db
          .collection("friendRequests")
          .where("senderId", "==", id)
          .get();
        const receiverIds: { receiverId: string; collectionId: string }[] = [];
        snapshot.forEach((doc) => {
          const collectionId = doc.id;
          const { receiverId } = doc.data() as FriendRequest;
          receiverIds.push({ receiverId, collectionId });
        });
        setLoading(false);
        return receiverIds;
      } catch (error) {
        console.error("Error getting receiver IDs:", error);
        setLoading(false);
        return [];
      }
    };

    //To get the Customers data from the id
    const getCustomerData = async (
      receiverIds: { receiverId: string; collectionId: string }[]
    ) => {
      try {
        const customerData: CustomerData[] = [];
        for (const { receiverId } of receiverIds) {
          const snapshot = await db
            .collection("customersData")
            .doc(receiverId)
            .get();
          if (snapshot.exists) {
            const data = snapshot.data() as CustomerData;
            customerData.push(data);
          }
        }
        return customerData;
      } catch (error) {
        console.error("Error getting customer data:", error);
        return [];
      }
    };

    useEffect(() => {
      setLoading(true);
      if (id) {
        getSendersIds().then(async (receiverIds) => {
          const fetchedCustomerData = await getCustomerData(receiverIds);
          setCustomerData(
            fetchedCustomerData.map((customer, index) => ({
              ...customer,
              requestId: receiverIds[index].receiverId,
              collectionId: receiverIds[index].collectionId,
            }))
          );
        });
        setLoading(false);
      } else {
        console.error("Id is not Present");
      }
    }, [id]);

    return (
      <>
        {loading ? (
          <div className="loading-indicator">
            <CircularProgress />
          </div>
        ) : (
          <div className="connection-user-list">
            {customerData.map((customer) => (
              <div key={customer.collectionId} className="connection-user-item">
                <div className="profile-pic-container">
                  <img
                    src={customer.imageUrl}
                    alt={customer.name}
                    className="profile-pic"
                  />
                  <div
                    className={`status-dot ${
                      customer.status === "online" ? "green" : "red"
                    }`}
                  ></div>
                </div>
                <div className="user-details">
                  <p className="user-name">{customer.name}</p>
                </div>
                <button
                  className="withdraw-button"
                  onClick={() => withDraw(customer.collectionId)}
                >
                  withdraw
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  //if the user is in the Connection tab then user will redirected here
  const Connection = () => {
    useEffect(() => {
      fetchAcceptedIds();
    }, []);

    //To fetch the id which are accepted Requests
    const fetchAcceptedIds = async () => {
      setLoading(true);
      try {
        const id: string | null = localStorage.getItem("databaseId");
        if (id) {
          const snapshot = await db.collection("customersData").doc(id).get();
          if (snapshot.exists) {
            const data = snapshot.data();
            if (data && data.acceptedIds) {
              const acceptedIdsArray = data.acceptedIds;
              getCustomerDataByIds(acceptedIdsArray)
                .then((customerData) => {
                  setMyConnections(customerData);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error("Error:", error);
                  setLoading(false);
                });
            } else {
              console.error("Accepted IDs field does not exist or is empty.");
              setLoading(false);
            }
          } else {
            console.error("Document does not exist.");
            setLoading(false);
          }
        } else {
          console.error("No database ID found.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching accepted IDs:", error);
        setLoading(false);
      }
    };

    const getCustomerDataByIds = async (ids: string[]) => {
      setLoading(true);
      try {
        const customerData: CustomerData[] = [];
        for (const customerId of ids) {
          const snapshot = await db
            .collection("customersData")
            .doc(customerId)
            .get();
          if (snapshot.exists) {
            const data = snapshot.data() as CustomerData;
            customerData.push({ ...data, documentId: snapshot.id });
            setLoading(false);
          } else {
            console.error(`Document with ID ${customerId} does not exist`);
            setLoading(false);
          }
        }
        return customerData;
      } catch (error) {
        console.error("Error getting customer data by IDs:", error);
        setLoading(false);
        return [];
      }
    };

    const message = () => {};

    return (
      <>
        {loading ? (
          <div className="loading-indicator">
            <CircularProgress />
          </div>
        ) : (
          <div className="connection-user-list">
            {myConnection.map((connection) => (
              <div key={connection.documentId} className="connection-user-item">
                <div className="profile-pic-container">
                  <img
                    src={connection.imageUrl}
                    alt={connection.name}
                    className="profile-pic"
                  />
                  <div
                    className={`status-dot ${
                      connection.status === "online" ? "green" : "red"
                    }`}
                  ></div>
                </div>
                <div className="user-details">
                  <p className="user-name">{connection.name}</p>
                </div>
                <div
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    margin: 0,
                    paddingTop: 7,
                  }}
                >
                  <div style={{ paddingRight: 10 }} onClick={message}>
                    <TextsmsIcon fontSize="medium" />
                  </div>
                  <div onClick={() => blocked(connection.documentId)}>
                    <BlockIcon fontSize="small" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Header headerName="Matches" />
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={handleChange}
              aria-label="lab API tabs example"
              sx={{ fontWeight: "bold" }}
            >
              {received != 0 ? (
                <Tab
                  label={`received ${received}`}
                  value="received"
                  sx={{ fontWeight: "bold", color: "black" }}
                />
              ) : (
                <Tab
                  label={`received `}
                  value="received"
                  sx={{ fontWeight: "bold", color: "black" }}
                />
              )}
              <Tab
                label="Sent"
                value="sent"
                sx={{ fontWeight: "bold", color: "black" }}
              />
              <Tab
                label="My Connection"
                value="MyConnection"
                sx={{ fontWeight: "bold", color: "black" }}
              />
            </TabList>
          </Box>
          <TabPanel value="received">{Received()}</TabPanel>
          <TabPanel value="sent">{Sender()}</TabPanel>
          <TabPanel value="MyConnection">{Connection()}</TabPanel>
        </TabContext>
      </Box>
      <BottomNav screenValue="connection" />
    </>
  );
};
export default ConnectionScreen;
