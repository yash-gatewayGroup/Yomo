import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "./profile.css";
import { db } from "../../firebase";
import { CircularProgress } from "@mui/material";
import Card from "../../components/Cards/Card";
import "./profile.css";
import { doc, onSnapshot } from "firebase/firestore";


interface CustomerData {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  status: string;
  collectionId: string;
  documentId?: string;
  customerId: string;
  friendRequestId: string;
}

const Blockeduser = () => {
  const [blockedUsers, setBlockedUsers] = useState<CustomerData[]>([]);
  const id: string | null = localStorage.getItem("databaseId");
  const [loading, setLoading] = useState(false);
  const [isSavingData, setIsSavingData] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const q = doc(db, "customersData", id);
      const unsub = onSnapshot(q, async (snapshot) => {
        const data = snapshot.data();
        const acceptedIdsArray = data?.blockedIds;
        if (acceptedIdsArray) {
          const getBlockedUserData = await getCustomerDataByIds(acceptedIdsArray);
          setBlockedUsers(getBlockedUserData);
        } else {
          setBlockedUsers([]);
        }
        setLoading(false);
      });

      return () => {
        unsub();
      };
    } else {
      console.log("No database ID found.");
    }
  }, []);

  const getCustomerDataByIds = async (userBlockedsIds: string[]) => {
    try {
      const customerDataPromises: Promise<CustomerData>[] = [];
      for (const customerId of userBlockedsIds) {
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

  const removeConnectionFromBlock = async (unBlockId: any) => {
    setIsSavingData(true);
    try {
      if (id) {
        const customerDataRef = db.collection("customersData").doc(id);
        const docSnapshot = await customerDataRef.get();
        const data = docSnapshot.data();
        const existingIds = data?.blockedIds || [];
        const updatedBlockedConnectionIds = existingIds.filter((existingId: any) => existingId !== unBlockId);
        await customerDataRef.update({
          blockedIds: updatedBlockedConnectionIds,
        });
        setIsSavingData(false);
      }
    } catch {
      console.log("Catch Block Executed For Removing Id From the Connection Id");
      setIsSavingData(false);
    }
  };

  return (
    <>
    <div className="header-container">
      <Header showBackButton={true} headerName="Blocked Users" />
      </div>
      {loading ? (
        <div className="loading-indicator">
          <CircularProgress />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="block-user-container">
          <span className="block-text">No block users Found</span>
        </div>
      ) : (
        <div className="block-user-container">
          {blockedUsers.map((blocked) => (
            <Card
              key={blocked.id}
              customer={blocked}
              deleteData={() => removeConnectionFromBlock(blocked.customerId)}
              btnName="Unblock"
              isSavingData={isSavingData}
            />
          ))}
        </div>
      )}
    </>
  );
};
export default Blockeduser;
