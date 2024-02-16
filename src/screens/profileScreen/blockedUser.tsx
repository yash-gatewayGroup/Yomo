import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "./profile.css";
import { db } from "../../firebase";

interface CustomerData {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  status: string;
  collectionId: string;
  documentId?: string;
}

const Blockeduser = () => {
  const [blockedUsers, setBlockedUsers] = useState<CustomerData[]>([]);
  const id: string | null = localStorage.getItem("databaseId");

  const handleUnblockUser = (documentId: any) => {
    id ? removeFromBlockedIds(id, documentId) : console.log("No id found");
  };

  const removeFromBlockedIds = async (userId: string, idToRemove: string) => {
    try {
      const userRef = db.collection("customersData").doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        const existingIds = userData?.blockedIds || [];
        const updatedBlockedIds = existingIds.filter(
          (existingId: any) => existingId !== idToRemove
        );
        await userRef.update({
          blockedIds: updatedBlockedIds,
        });
        console.log(
          `ID ${idToRemove} removed from the blockedIds array in document ${userId}`
        );
        window.location.reload();
      } else {
        console.log(
          `Document with ID ${userId} does not exist in the collection.`
        );
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error removing ${idToRemove} from blockedIds:`, error);
    }
  };

  useEffect(() => {
    fetchBlockedIds();
  }, []);

  const fetchBlockedIds = async () => {
    try {
      const id: string | null = localStorage.getItem("databaseId");
      if (id) {
        const snapshot = await db.collection("customersData").doc(id).get();
        if (snapshot.exists) {
          const data = snapshot.data();
          if (data && data.blockedIds) {
            const acceptedIdsArray = data.blockedIds;
            getCustomerDataByIds(acceptedIdsArray)
              .then((customerData) => {
                setBlockedUsers(customerData);
                console.log("Customer data:", customerData);
              })
              .catch((error) => {
                console.error("Error:", error);
              });
            console.log("Accepted IDs:", acceptedIdsArray);
          } else {
            console.log("Accepted IDs field does not exist or is empty.");
          }
        } else {
          console.log("Document does not exist.");
        }
      } else {
        console.log("No database ID found.");
      }
    } catch (error) {
      console.error("Error fetching accepted IDs:", error);
    }
  };

  const getCustomerDataByIds = async (ids: string[]) => {
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
        } else {
          console.log(`Document with ID ${customerId} does not exist`);
        }
      }
      return customerData;
    } catch (error) {
      console.error("Error getting customer data by IDs:", error);
      return [];
    }
  };

  return (
    <>
      <Header showBackButton={true} headerName="Blocked Users" />
      <div className="blocked-user-list">
        {blockedUsers.map((blocked) => (
          <div key={blocked.id} className="blocked-user-item">
            <div className="profile-pic-container">
              <img
                src={blocked.imageUrl}
                alt={blocked.name}
                className="profile-pic"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
              <div
                className={`status-dot ${
                  blocked.status === "online" ? "green" : "red"
                }`}
              ></div>
            </div>
            <div className="user-details">
              <p className="user-name">{blocked.name}</p>
            </div>
            <button
              className="unblock-button"
              onClick={() => handleUnblockUser(blocked.documentId)}
            >
              Unblock
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
export default Blockeduser;
