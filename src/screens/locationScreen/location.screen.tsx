import React, { useEffect, useState } from "react";
import BottomNav from "../../components/BottomNav/BottomNavigation";
import Header from "../../components/Header/Header";
import ListIcon from "@mui/icons-material/List";
import MapIcon from "@mui/icons-material/Map";
import "./location.css";
// import MapContainer from "./Mapcontainer";
import BottomSheet from "../../components/BottomSheet/BottomSheet";
import { collection, getDocs } from "firebase/firestore";
import { db, newTimestamp } from "../../firebase";
import Map, { MapType } from "./Map";
import { MarkerClusterer, MarkerF } from "@react-google-maps/api";
import { CustomMarker } from "./Custommarker";

export interface Profiles {
  id: string | null;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  name: string | undefined;
  imageUrl: string | undefined;
  bio: string | undefined | null;
  acceptedIds?: string[] | undefined;
  blockedIds?: string[] | undefined;
}

const LocationScreen = () => {
  const [isMapView, setIsMapView] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState<Profiles[]>([]);
  const [bottomSheet, setBottomSheet] = useState<string>("");
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const id: string | null = localStorage.getItem("databaseId");
  const [currentPosition, setCurrentPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [map, setMap] = useState<MapType | null>(null);
  const [mapWidth, setMapWidth] = React.useState<number | undefined>();
  const [mapZoomLevel, setMapZoomLevel] = React.useState<number | undefined>();
  const [markerOffsets, setMarkerOffsets] = React.useState<PositionOffsets>({});

  type PositionOffsets = { [id: number]: { lat: number; lng: number } };
  const MARKER_DISPLACEMENT_FACTOR = 0.05;
  const MARKER_CLUSTER_MAX_ZOOM = 10;
  const handleToggleBottomSheet = () => {
    setBottomSheetVisible(!bottomSheetVisible);
  };

  useEffect(() => {
    const getCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          latitude && longitude
            ? addLatitudeLongitudeToDocuments(latitude, longitude)
            : getCurrentPosition();
        },
        (error) => {
          console.error("Error getting current position:", error);
        }
      );
    };
    getCurrentPosition();
    // eslint-disable-next-line
  }, [window.location.reload]);

  const addLatitudeLongitudeToDocuments = async (
    latitude: number,
    longitude: number
  ) => {
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
          res === undefined && latitude && longitude
            ? fetchAllData(latitude, longitude)
            : addLatitudeLongitudeToDocuments(latitude, longitude);
        })
        .catch((err: any) => {
          console.log("Error", err);
        });
    } catch (error) {
      console.error("Error adding latitude and longitude to documents:", error);
    }
  };

  const fetchAllData = async (latitude: number, longitude: number) => {
    try {
      const excludedId: any = localStorage.getItem("databaseId");
      const collectionRef = collection(db, "customersData");
      const querySnapshot = await getDocs(collectionRef);
      const profiles: Profiles[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== excludedId) {
          const data = doc.data();
          const profile = {
            id: doc.id,
            name: data.name,
            imageUrl: data.imageUrl,
            bio: data.bio,
            latitude: data.latitude,
            longitude: data.longitude,
            acceptedIds: data.acceptedIds,
            blockedIds: data.blockedIds,
          };
          profiles.push(profile);
          latitude && profile && nearbyLocation
            ? nearbyLocation(latitude, longitude, profiles)
            : fetchAllData(latitude, longitude);
        }
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const nearbyLocation = async (
    inlatitude: number,
    inlongitude: number,
    profiles: Profiles[]
  ) => {
    let nearby: Profiles[] = [];
    try {
      nearby = profiles.filter(
        ({ latitude, longitude, acceptedIds, blockedIds }) => {
          if (
            latitude !== undefined &&
            longitude !== undefined &&
            longitude !== null &&
            latitude !== null
          ) {
            const R = 6371;
            const latDiff = (inlatitude - latitude) * (Math.PI / 180);
            const lngDiff = (inlongitude - longitude) * (Math.PI / 180);
            const a =
              Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
              Math.cos(latitude * (Math.PI / 180)) *
                Math.cos(inlatitude * (Math.PI / 180)) *
                Math.sin(lngDiff / 2) *
                Math.sin(lngDiff / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            if (distance <= 10) {
              if (isIdBlockedOrAccepted(id, acceptedIds, blockedIds)) {
                return false;
              }
              return true;
            }
          }
          return false;
        }
      );
      if (nearby.length === 0) {
        console.log("No nearby locations found within 10 km radius.");
      }
      setNearbyLocations(nearby);
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
    }
  };

  function isIdBlockedOrAccepted(id: any, acceptedIds: any, blockedIds: any) {
    if (id) {
      if (
        (acceptedIds && acceptedIds.includes(id)) ||
        (blockedIds && blockedIds.includes(id))
      ) {
        return true;
      }
    } else {
      console.log("Id not found");
    }
    return false;
  }

  const toggleView = () => {
    setIsMapView(!isMapView);
  };

  const dataView = () => {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          flexWrap: "wrap",
          marginTop: 70,
        }}
      >
        {nearbyLocations.map((profile, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              margin: "10px",
              width: "20vh",
              overflow: "hidden",
              height: "25vh",
              borderRadius: "25px",
            }}
            onClick={() => {
              if (profile.id) {
                handleToggleBottomSheet();
                setBottomSheet(profile.id);
              }
            }}
          >
            <div
              style={{
                borderRadius: "25px",
                overflow: "hidden",
                width: "90%",
                height: "100%",
              }}
            >
              <img
                src={profile.imageUrl}
                alt={profile.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "17vh",
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "0",
                width: "80%",
                borderBottomLeftRadius: "25px",
                borderBottomRightRadius: "25px",
                padding: "10px",
                backgroundColor: "#ffffff",
              }}
            >
              <h2 style={{ margin: "0", fontSize: "16px" }}>{profile.name}</h2>
              <p
                style={{
                  margin: "5px 0",
                  fontSize: "14px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.bio}
              </p>
            </div>
            {bottomSheet === profile.id && bottomSheetVisible ? (
              <BottomSheet
                id={profile.id}
                name={profile.name}
                bio={profile.bio}
                image={profile.imageUrl}
                onButtonClick={handleButtonClick}
                visible={bottomSheetVisible}
                onClose={handleToggleBottomSheet}
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  const hasLongLat = (
    inlineUnit: Profiles
  ): inlineUnit is Profiles & { latitude: number; longitude: number } =>
    inlineUnit.latitude != null && inlineUnit.longitude != null;

  useEffect(() => {
    function mapFitBounds() {
      if (!map) return;
      const bounds = new google.maps.LatLngBounds();
      nearbyLocations
        .filter(hasLongLat)
        .map(({ latitude, longitude }) =>
          bounds.extend(new google.maps.LatLng(latitude, longitude))
        );

      map.fitBounds(bounds);
    }
    if (map) {
      // map.panTo(...)
      mapFitBounds();
    }
  }, [map]);

  useEffect(() => {
    const generateOffsets = () => {
      if (mapWidth == null) {
        return;
      }
      const offsets = groupUnitsByLatAndLong(nearbyLocations).reduce(
        (acc, inlineUnitList) => {
          if (inlineUnitList.length < 2) {
            return acc;
          }
          const displacementAngle = (2 * Math.PI) / inlineUnitList.length;
          inlineUnitList.forEach((inlineUnit: any, index) => {
            const angle = index * displacementAngle;
            const displacementX =
              MARKER_DISPLACEMENT_FACTOR * mapWidth * Math.cos(angle);
            const displacementY =
              MARKER_DISPLACEMENT_FACTOR * mapWidth * Math.sin(angle);

            acc[inlineUnit.id] = {
              lng: displacementX,
              lat: displacementY,
            };
          });
          return acc;
        },
        {} as PositionOffsets
      );
      setMarkerOffsets(offsets);
    };

    generateOffsets();
  }, [mapWidth]);

  const groupUnitsByLatAndLong = (inlineUnits: Profiles[]) => {
    const groups: Profiles[][] = [];
    inlineUnits.forEach((inlineUnit) => {
      if (groups.some((group) => group.includes(inlineUnit))) {
        return;
      }
      const otherUnits = inlineUnits.filter(
        (unit) => unit.id !== inlineUnit.id
      );
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
    return (
      unit1.latitude === unit2.latitude && unit1.longitude === unit2.longitude
    );
  };

  const MapView = () => {
    const handleZoomChange = () => {
      const zoomLevel = map?.getZoom();
      const mapBounds = map?.getBounds();
      const mapEastEdge = mapBounds?.getNorthEast().lng();
      const mapWestEdge = mapBounds?.getSouthWest().lng();

      const mapWidth =
        mapEastEdge && mapWestEdge ? mapEastEdge - mapWestEdge : 0;
      setMapWidth(mapWidth);
      setMapZoomLevel(zoomLevel);
    };

    const transformPosition = (lat: number, lng: number, id: any) => {
      if (
        !mapZoomLevel ||
        !markerOffsets[id] ||
        mapZoomLevel <= MARKER_CLUSTER_MAX_ZOOM
      ) {
        return { lat, lng };
      }

      return {
        lat: lat + markerOffsets[id].lat,
        lng: lng + markerOffsets[id].lng,
      };
    };

    const hasLongLat = (
      inlineUnit: Profiles
    ): inlineUnit is Profiles & { latitude: number; longitude: number } =>
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
            {currentPosition && (
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
            )}
            <MarkerClusterer
              maxZoom={MARKER_CLUSTER_MAX_ZOOM}
              options={{
                zoomOnClick: true,
                imagePath:
                  "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
              }}
            >
              {(clusterer) => (
                <>
                  {nearbyLocations
                    .filter(hasLongLat)
                    .map(({ id, latitude, longitude, bio, imageUrl, name }) => (
                      <>
                        <CustomMarker
                          key={id}
                          onClick={() => {
                            if (id) {
                              handleToggleBottomSheet();
                              setBottomSheet(id);
                            }
                          }}
                          position={transformPosition(latitude, longitude, id)}
                          clusterer={clusterer}
                          draggable
                        />
                        {bottomSheet === id && bottomSheetVisible ? (
                          <BottomSheet
                            id={id}
                            name={name}
                            bio={bio}
                            image={imageUrl}
                            onButtonClick={handleButtonClick}
                            visible={bottomSheetVisible}
                            onClose={handleToggleBottomSheet}
                          />
                        ) : null}
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

  const handleButtonClick = async (receiverId: string) => {
    // const receiverId: string = localStorage.getItem('databaseId') ?? '';
    // try {
    //   await db.collection('customersData').doc(id).collection('received').add({
    //     receiverId,
    //     timestamp: new Date(),
    //     status: 'pending',
    //   });
    //   await db.collection('customersData').doc(receiverId).collection('sent').add({
    //     id,
    //     timestamp: new Date(),
    //     status: 'pending',
    //   });
    //   console.log('Friend request sent successfully!');
    // } catch (error) {
    //   console.error('Error sending friend request:', error);
    // }

    //creating the new table for maintaining the connection requests
    try {
      await db.collection("friendRequests").add({
        senderId: id,
        receiverId: receiverId,
        reqStatus: "pending",
        timestamp: newTimestamp,
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <>
      <Header showLogo={true} />
      <div
        style={{
          height: "5vh",
          width: "100%",
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            width: "70%",
            backgroundColor: "#007bff",
            height: "2vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            borderRadius: "20px",
            cursor: "pointer",
            zIndex: 1,
            padding: "10px 20px",
            position: "fixed",
            marginBottom: "20px",
          }}
        >
          <span style={{ textAlign: "center" }}>
            Showing Results within 10KM area
          </span>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ marginBottom: "100px", width: "100%" }}>
          {isMapView ? dataView() : MapView()}
        </div>
        {!bottomSheetVisible ? (
          <div
            style={{
              position: "fixed",
              bottom: "70px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#ffffff",
              borderRadius: "20px",
              cursor: "pointer",
              zIndex: 1,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onClick={toggleView}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "2vh",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                {isMapView ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "black",
                    }}
                  >
                    <MapIcon />
                    <span>Map View</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "black",
                    }}
                  >
                    <ListIcon />
                    <span>List View</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <BottomNav screenValue="location" />
    </>
  );
};

export default LocationScreen;
