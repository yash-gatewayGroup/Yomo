import React, { useEffect, useState } from "react";
import BottomNav from "../../components/BottomNav/BottomNavigation";
import Header from "../../components/Header/Header";
import ListIcon from "@mui/icons-material/List";
import MapIcon from "@mui/icons-material/Map";
import BottomSheet from "../../components/BottomSheet/BottomSheet";
import { collection, onSnapshot } from "firebase/firestore";
import { db, newTimestamp } from "../../firebase";
import Map, { MapType } from "./Map";
import { MarkerClusterer } from "@react-google-maps/api";
import CustomMarker from "./Custommarker";
import { CircularProgress } from "@mui/material";
import "./location.css";
import "../../App.css"
import { SquareImage } from "../../components/SquareImage/SquareImage";
import circleImage from "../../assets/circle.png";
import { colors } from "../../theme/colors";
import toast, { Toaster } from "react-hot-toast";

export interface Profiles {
  id: string | null;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  name: string | undefined;
  imageUrl: string | undefined;
  bio: string | undefined | null;
  friendRequestId?: string | undefined | null;
  connections?: string[] | undefined;
  blockedIds?: string[] | undefined;
  pendingIds?: string[] | undefined;
}

const LocationScreen = () => {
  const [isMapView, setIsMapView] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState<Profiles[]>([]);
  const [bottomSheet, setBottomSheet] = useState<Profiles>();
  const id: string | null = localStorage.getItem("databaseId");
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral>();
  const [map, setMap] = useState<MapType | null>(null);
  const [mapWidth, setMapWidth] = React.useState<number | undefined>();
  const [mapZoomLevel, setMapZoomLevel] = React.useState<number | undefined>();
  const [markerOffsets, setMarkerOffsets] = React.useState<PositionOffsets>({});
  const [loading, setLoading] = useState<Boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  type PositionOffsets = { [id: number]: { lat: number; lng: number } };
  const MARKER_DISPLACEMENT_FACTOR = 0.05;
  const MARKER_CLUSTER_MAX_ZOOM = 19;
  const handleToggleBottomSheet = () => {
    setBottomSheet(undefined);
  };

  useEffect(() => {
    const getCurrentPosition = () => {
      // navigator.geolocation.watchPosition(
      //   (currentPosition) => {
      //     setCurrentPosition({
      //       lat: currentPosition.coords.latitude,
      //       lng: currentPosition.coords.longitude,
      //     });
      //     currentPosition.coords.latitude && currentPosition.coords.longitude
      //       ? addLatitudeLongitudeToDocuments(
      //           currentPosition.coords.latitude,
      //           currentPosition.coords.longitude
      //         )
      //       : getCurrentPosition();
      //   },
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          position.coords.latitude && position.coords.longitude
            ? addLatitudeLongitudeToDocuments(position.coords.latitude, position.coords.longitude)
            : getCurrentPosition();
        },
        (error) => {
          error.code === 1 ? getCurrentPosition() : console.error("Error getting current position:", error);
        }
      );
    };
    getCurrentPosition();
    // eslint-disable-next-line
  }, [window.location.reload]);

  const addLatitudeLongitudeToDocuments = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const id: any = localStorage.getItem("databaseId");
      db.collection("customersData")
        .doc(id)
        .set(
          {
            latitude: latitude,
            longitude: longitude,
          },
          { merge: true }
        )
        .then((res: any) => {
          res === undefined && latitude && longitude ? fetchAllData(latitude, longitude) : addLatitudeLongitudeToDocuments(latitude, longitude);
        })
        .catch((err: any) => {
          console.log("Error", err);
        });
    } catch (error) {
      setLoading(false);
      console.error("Error adding latitude and longitude to documents:", error);
    }
  };

  const fetchAllData = async (latitude: number, longitude: number) => {
    try {
      const collectionRef = collection(db, "customersData");
      const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
        const profiles: Profiles[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== id) {
            const data = doc.data();
            const profile = {
              id: doc.id,
              name: data.name,
              imageUrl: data.imageUrl,
              bio: data.bio,
              latitude: data.latitude,
              longitude: data.longitude,
              connections: data.connections,
              blockedIds: data.blockedIds,
              pendingIds: data.pendingIds,
            };
            profiles.push(profile);
            latitude && profile && nearbyLocation ? nearbyLocation(latitude, longitude, profiles) : fetchAllData(latitude, longitude);
          }
        });
        setLoading(false);
      });

      // Cleanup function to unsubscribe when component unmounts or no longer needs updates
      return () => unsubscribe();
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const nearbyLocation = async (inlatitude: number, inlongitude: number, profiles: Profiles[]) => {
    let nearby: Profiles[] = [];
    try {
      nearby = profiles.filter(({ latitude, longitude, blockedIds, connections }) => {
        if (latitude !== undefined && longitude !== undefined && longitude !== null && latitude !== null) {
          const R = 6371;
          const latDiff = (inlatitude - latitude) * (Math.PI / 180);
          const lngDiff = (inlongitude - longitude) * (Math.PI / 180);
          const a =
            Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
            Math.cos(latitude * (Math.PI / 180)) * Math.cos(inlatitude * (Math.PI / 180)) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          if (distance <= 10) {
            if (id) {
              if ((connections && connections.includes(id)) || (blockedIds && blockedIds.includes(id))) {
                return false;
              }
            }
            return true;
          }
        }
        return false;
      });
      if (nearby.length === 0) {
        setLoading(false);
      }
      setLoading(false);
      setNearbyLocations(nearby);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching nearby locations:", error);
    }
  };

  const toggleView = () => {
    setIsMapView(!isMapView);
  };
  
  const dataView = () => {
    return (
      <div className="location-main-list-container">
        <div className="list-container">
          {nearbyLocations.length === 0 ? (
            <div className="no-user-container">
              <span className="no-user-text">
                Quiet zone for now! <br></br>
                No users found nearby
              </span>
            </div>
          ) : (
            nearbyLocations.map((profile, index) => (
              <div
                // style={{ width: "48%" }}
                key={index}
                className="location-image-container-list"
                onClick={() => {
                  if (profile.id) {
                    // handleToggleBottomSheet();
                    setBottomSheet(profile);
                  }
                }}
              >
                <SquareImage imageUrl={profile.imageUrl} alt={profile.name} />
                <div className="card-container">
                  <h2 className="card-name-text">{profile.name}</h2>
                  <p className="card-bio-text">{profile.bio}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const hasLongLat = (inlineUnit: Profiles): inlineUnit is Profiles & { latitude: number; longitude: number } => inlineUnit.latitude != null && inlineUnit.longitude != null;

  useEffect(() => {
    function mapFitBounds() {
      if (!map) return;
      const bounds = new window.google.maps.LatLngBounds();
      nearbyLocations.filter(hasLongLat).map(({ latitude, longitude }) => bounds.extend(new google.maps.LatLng(latitude, longitude)));

      map.fitBounds(bounds);
    }
    if (map) {
      // map.panTo(...)
      mapFitBounds();
    }
  }, [map]);
  // eslint-disable-next-line

  useEffect(() => {
    const generateOffsets = () => {
      if (mapWidth == null) {
        return;
      }
      const offsets = groupUnitsByLatAndLong(nearbyLocations).reduce((acc, inlineUnitList) => {
        if (inlineUnitList.length < 2) {
          return acc;
        }
        const displacementAngle = (2 * Math.PI) / inlineUnitList.length;
        inlineUnitList.forEach((inlineUnit: any, index) => {
          const angle = index * displacementAngle;
          const displacementX = MARKER_DISPLACEMENT_FACTOR * mapWidth * Math.cos(angle);
          const displacementY = MARKER_DISPLACEMENT_FACTOR * mapWidth * Math.sin(angle);

          acc[inlineUnit.id] = {
            lng: displacementX,
            lat: displacementY,
          };
        });
        return acc;
      }, {} as PositionOffsets);
      setMarkerOffsets(offsets);
    };

    generateOffsets();
  }, [mapWidth]);
  // eslint-disable-next-line

  const groupUnitsByLatAndLong = (inlineUnits: Profiles[]) => {
    const groups: Profiles[][] = [];
    inlineUnits.forEach((inlineUnit) => {
      if (groups.some((group) => group.includes(inlineUnit))) {
        return;
      }
      const otherUnits = inlineUnits.filter((unit) => unit.id !== inlineUnit.id);
      const group: Profiles[] = [inlineUnit];
      otherUnits.forEach((otherUnit) => {
        if (hasSameLngAndLat(inlineUnit, otherUnit)) {
          group.push(otherUnit);
        }
      });
      groups.push(group);
    });
    return groups;
  };

  const hasSameLngAndLat = (unit1: Profiles, unit2: Profiles) => {
    return unit1.latitude === unit2.latitude && unit1.longitude === unit2.longitude;
  };

  const MapView = () => {
    const handleZoomChange = () => {
      const zoomLevel = map?.getZoom();
      const mapBounds = map?.getBounds();
      const mapEastEdge = mapBounds?.getNorthEast().lng();
      const mapWestEdge = mapBounds?.getSouthWest().lng();

      const mapWidth = mapEastEdge && mapWestEdge ? mapEastEdge - mapWestEdge : 0;
      setMapWidth(mapWidth);
      setMapZoomLevel(zoomLevel);
    };

    const transformPosition = (lat: number, lng: number, id: any) => {
      if (!mapZoomLevel || !markerOffsets[id] || mapZoomLevel <= MARKER_CLUSTER_MAX_ZOOM) {
        return { lat, lng };
      }
      return {
        lat: lat + markerOffsets[id].lat,
        lng: lng + markerOffsets[id].lng,
      };
    };

    const hasLongLat = (inlineUnit: Profiles): inlineUnit is Profiles & { latitude: number; longitude: number } =>
      inlineUnit.latitude != null && inlineUnit.longitude != null;

    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            flexWrap: "wrap",
            justifyItems: "center",
            alignSelf: "center",
          }}
        >
          <Map setMap={setMap} onZoomChanged={handleZoomChange}>
            {/* {currentPosition && (
              <MarkerF
                position={{
                  lat: currentPosition.lat,
                  lng: currentPosition.lng,
                }}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
                title="Your current location"
              />
            )} */}
            <MarkerClusterer
              maxZoom={MARKER_CLUSTER_MAX_ZOOM}
              options={{
                zoomOnClick: true,
                maxZoom: 5,
                minimumClusterSize: 2,
                averageCenter: true,
                styles: [
                  {
                    height: 50,
                    textColor: colors.theme_color,
                    fontFamily: "Public Sans",
                    fontWeight: "600px",
                    width: 50,
                    // url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" height="50" width="100"%3E%3Ccircle cx="25" cy="25" r="20" stroke="black" stroke-width="3" fill="green" /%3E%3C/svg%3E',
                    // url: 'https://camo.githubusercontent.com/e05e5ac9e0af5385e1fefccbe297a14d48d6f9bfc57d1e4e7f7a7ec0808a9b7d/68747470733a2f2f6d61726b65722e6e616e6f6b612e66722f6d61705f636c75737465722d4646303030302d3132302e737667',
                    url: circleImage,
                  },
                ],
              }}
            >
              {(clusterer) => (
                <>
                  {nearbyLocations.filter(hasLongLat).map((profile) => (
                    <>
                      <CustomMarker
                        key={profile.id}
                        onClick={() => {
                          if (id) {
                            // handleToggleBottomSheet();
                            setBottomSheet(profile);
                          }
                        }}
                        position={transformPosition(profile.latitude, profile.longitude, profile.id)}
                        clusterer={clusterer}
                        draggable={false}
                      />
                    </>
                  ))}
                </>
              )}
            </MarkerClusterer>
          </Map>
        </div>
      </>
    );
  };

  const createRequest = async (userId: string, receiverId: string) => {
    if (id) {
      const customerDataRef = db.collection("customersData").doc(userId);
      const customerDataSnapshot = await customerDataRef.get();
      if (customerDataSnapshot.exists) {
        const customerData = customerDataSnapshot.data();
        const existingIds = customerData?.pendingIds || [];
        const updatedIdsSet = new Set([...existingIds, receiverId]);
        const updatedIds = Array.from(updatedIdsSet);
        await customerDataRef.update({
          pendingIds: updatedIds,
        });
      } else {
        const updatedIds = [receiverId];
        await customerDataRef.set(
          {
            pendingIds: updatedIds,
          },
          { merge: true }
        );
      }
    } else console.log("Error id not found");
  };

  const createAcceptRequest = async (userId: string, receiverId: string) => {
    if (id) {
      const customerDataRef = db.collection("customersData").doc(userId);
      const customerDataSnapshot = await customerDataRef.get();
      if (customerDataSnapshot.exists) {
        const customerData = customerDataSnapshot.data();
        const existingIds = customerData?.toAcceptIds || [];
        const updatedIdsSet = new Set([...existingIds, receiverId]);
        const updatedIds = Array.from(updatedIdsSet);
        await customerDataRef.update({
          toAcceptIds: updatedIds,
        });
      } else {
        const updatedIds = [receiverId];
        await customerDataRef.set(
          {
            toAcceptIds: updatedIds,
          },
          { merge: true }
        );
      }
    } else console.log("Error id not found");
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

  // Remove customerId from 'isAcceptids' in 'customersData'
  const updateAcceptIdsInUser = async (userId: string, idToRemove: string) => {
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

  // Delete Friend Request from 'friendRequests'
  const deleteFriendRequest = async (friendRequestId: string) => {
    if (friendRequestId) await db.collection("friendRequests").doc(friendRequestId).delete();
  };

  //Find the Id from the FirendReuests
  const findCollectionIdBySenderId = async (receiverId: string) => {
    const collectionRef = db.collection("friendRequests");
    try {
      const querySnapshot = await collectionRef.get();
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data.senderId === receiverId) {
          deleteFriendRequest(docSnapshot.id);
        }
      }
      return null;
    } catch (error) {
      console.error("Error finding collection ID:", error);
      return null;
    }
  };

  const handleButtonClick = async (receiverId: string, isaccept: Boolean) => {
    //creating the new table for maintaining the connection requests
    setIsSaving(true);
    try {
      if (id && receiverId) {
        if (isaccept === true) {
          await updateConnectionsInUser(id, receiverId);
          await updateConnectionsInUser(receiverId, id);
          await updateAcceptIdsInUser(id, receiverId);
          await updatePendingIdsInUser(receiverId, id);
          await updatePendingIdsInUser(id, receiverId);
          await findCollectionIdBySenderId(receiverId);
          setIsSaving(false);
          handleToggleBottomSheet()
          toast.success("Connection Accepted Sucessful, Kindly check connection screen")
        } else {
          await db
            .collection("friendRequests")
            .add({
              senderId: id,
              receiverId: receiverId,
              reqStatus: "pending",
              timestamp: newTimestamp,
            })
            .then(async (res) => {
              if (res) {
                await createRequest(id, receiverId);
                await createAcceptRequest(receiverId, id);
                setIsSaving(false);
                handleToggleBottomSheet()
                toast.success("connection request sent sucessfully, kindly wait to be accepted")
              }
            });
        }
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header showLogo={true} />
      <div className="toast">
      <Toaster position="top-center" reverseOrder={false} />
      </div>
      {loading ? (
        <div className="loading-indicator">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="location-main-view">
            <div className="rounded-box">
              <span className="static-btn-text">Showing results within 10km area</span>
            </div>
          </div>
          {isMapView ? dataView() : MapView()}

          <div className="bottom-btn-container" onClick={toggleView}>
            <div className="bottom-circular-btn">
              <div className="bottom-btn-view">
                {isMapView ? (
                  <div className="map-view">
                    <MapIcon />
                    <span className="map-text">Map</span>
                  </div>
                ) : (
                  <div className="list-view">
                    <ListIcon />
                    <span>List</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <BottomSheet
            id={bottomSheet?.id}
            name={bottomSheet?.name}
            bio={bottomSheet?.bio}
            image={bottomSheet?.imageUrl}
            friendRequestId={bottomSheet?.friendRequestId}
            onButtonClick={handleButtonClick}
            visible={Boolean(bottomSheet?.id)}
            onClose={handleToggleBottomSheet}
            isSaving={isSaving}
          />
        </>
      )}
      <BottomNav screenValue="location" />
    </>
  );
};

export default LocationScreen;
