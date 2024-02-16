// import React, { useState } from "react";
// import Map, { MapType } from "./Map";
// import { MarkerClusterer, MarkerF } from "@react-google-maps/api";
// import { CustomMarker } from "./Custommarker";
// import { db, newTimestamp } from "../../firebase";
// import BottomSheet from "../../components/BottomSheet/BottomSheet";

// export interface InlineUnitList {
//   id: number;
//   latitude: number | null | undefined;
//   longitude: number | null | undefined;
//   name: string | undefined;
//   imageUrl: string | undefined;
//   bio: string | undefined | null;
//   acceptedIds?: string[] | undefined;
//   blockedIds?: string[] | undefined;
// }

// interface CustomerData {
//   id: string;
//   name: string;
//   bio: string;
//   imageUrl: string;
//   status: string;
//   collectionId: string;
//   documentId?: string;
// }

// export default function MapContainer() {
//   const [map, setMap] = useState<MapType | null>(null);
//   const [markerOffsets, setMarkerOffsets] = React.useState<PositionOffsets>({});
//   const [mapWidth, setMapWidth] = React.useState<number | undefined>();
//   const [mapZoomLevel, setMapZoomLevel] = React.useState<number | undefined>();
//   const [currentPosition, setCurrentPosition] =
//     useState<google.maps.LatLngLiteral | null>(null);
//   const [nearbyLocations, setNearbyLocations] = useState<InlineUnitList[]>([]);
//   const [inlineUnits, setInlineUnit] = useState<InlineUnitList[]>([]);
//   const id: string | null = localStorage.getItem("databaseId");
//   const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
//   const [bottomSheet, setBottomSheet] = useState<number>();
//   console.log("nearbyLocations",nearbyLocations);

//   const hasSameLngAndLat = (unit1: InlineUnitList, unit2: InlineUnitList) => {
//     return (
//       unit1.latitude === unit2.latitude && unit1.longitude === unit2.longitude
//     );
//   };

//   const handleToggleBottomSheet = () => {
//     setBottomSheetVisible(!bottomSheetVisible);
//   };

//   React.useEffect(() => {
//     const fetchInlineUnits = async () => {
//       try {
//         const snapshot = await db.collection("customersData").get();
//         const fetchedInlineUnits: InlineUnitList[] = [];
//         snapshot.forEach((doc) => {
//           const data = doc.data();
//           const inlineUnit: InlineUnitList = {
//             id: data.id,
//             name: data.name,
//             imageUrl: data.imageUrl,
//             bio: data.bio,
//             latitude: data.latitude,
//             longitude: data.longitude,
//             acceptedIds: data.acceptedIds,
//             blockedIds: data.blockedIds,
//           };
//           fetchedInlineUnits.push(inlineUnit);
//         });
//         setInlineUnit(fetchedInlineUnits);
//       } catch (error) {
//         console.error("Error fetching inline units:", error);
//       }
//     };
//     fetchInlineUnits();
//   }, []);

//   const groupUnitsByLatAndLong = (inlineUnits: InlineUnitList[]) => {
//     const groups: InlineUnitList[][] = [];
//     inlineUnits.forEach((inlineUnit) => {
//       if (groups.some((group) => group.includes(inlineUnit))) {
//         return;
//       }
//       const otherUnits = inlineUnits.filter(
//         (unit) => unit.id !== inlineUnit.id
//       );
//       const group: InlineUnitList[] = [inlineUnit];
//       otherUnits.forEach((otherUnit) => {
//         if (hasSameLngAndLat(inlineUnit, otherUnit)) {
//           group.push(otherUnit);
//         }
//       });
//       groups.push(group);
//     });
//     return groups;
//   };

//   const hasLongLat = (
//     inlineUnit: InlineUnitList
//   ): inlineUnit is InlineUnitList & { latitude: number; longitude: number } =>
//     inlineUnit.latitude != null && inlineUnit.longitude != null;

//   type PositionOffsets = { [id: number]: { lat: number; lng: number } };
//   const MARKER_DISPLACEMENT_FACTOR = 0.05;
//   const MARKER_CLUSTER_MAX_ZOOM = 10;

//   React.useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setCurrentPosition({ lat: latitude, lng: longitude });
//         nearbyLocation(position.coords.latitude, position.coords.longitude)
//       },
//       (error) => {
//         console.error("Error getting current position:", error);
//       }
//     );
//   }, []);

//   React.useEffect(() => {
//     function mapFitBounds() {
//       if (!map) return;
//       const bounds = new google.maps.LatLngBounds();
//       inlineUnits
//         .filter(hasLongLat)
//         .map(({ latitude, longitude }) =>
//           bounds.extend(new google.maps.LatLng(latitude, longitude))
//         );

//       map.fitBounds(bounds);
//     }
//     if (map) {
//       // map.panTo(...)
//       mapFitBounds();
//     }
//   }, [map]);

//   React.useEffect(() => {
//     const generateOffsets = () => {
//       if (mapWidth == null) {
//         return;
//       }
//       const offsets = groupUnitsByLatAndLong(inlineUnits).reduce(
//         (acc, inlineUnitList) => {
//           if (inlineUnitList.length < 2) {
//             return acc;
//           }
//           const displacementAngle = (2 * Math.PI) / inlineUnitList.length;
//           inlineUnitList.forEach((inlineUnit: any, index) => {
//             const angle = index * displacementAngle;
//             const displacementX =
//               MARKER_DISPLACEMENT_FACTOR * mapWidth * Math.cos(angle);
//             const displacementY =
//               MARKER_DISPLACEMENT_FACTOR * mapWidth * Math.sin(angle);

//             acc[inlineUnit.id] = {
//               lng: displacementX,
//               lat: displacementY,
//             };
//           });
//           return acc;
//         },
//         {} as PositionOffsets
//       );
//       console.log(offsets);
//       setMarkerOffsets(offsets);
//     };

//     generateOffsets();
//   }, [mapWidth]);

//   const handleZoomChange = () => {
//     const zoomLevel = map?.getZoom();
//     const mapBounds = map?.getBounds();
//     const mapEastEdge = mapBounds?.getNorthEast().lng();
//     const mapWestEdge = mapBounds?.getSouthWest().lng();

//     const mapWidth = mapEastEdge && mapWestEdge ? mapEastEdge - mapWestEdge : 0;
//     setMapWidth(mapWidth);
//     setMapZoomLevel(zoomLevel);
//   };

//   const transformPosition = (lat: number, lng: number, id: any) => {
//     if (
//       !mapZoomLevel ||
//       !markerOffsets[id] ||
//       mapZoomLevel <= MARKER_CLUSTER_MAX_ZOOM
//     ) {
//       return { lat, lng };
//     }

//     return {
//       lat: lat + markerOffsets[id].lat,
//       lng: lng + markerOffsets[id].lng,
//     };
//   };

//     const nearbyLocation = async (
//       inlatitude: number,
//       inlongitude: number,
//     ) => {
//       let nearby: InlineUnitList[] = [];
//       try {
//         nearby = inlineUnits.filter(
//           ({ latitude, longitude, acceptedIds, blockedIds }) => {
//             if (
//               latitude !== undefined &&
//               longitude !== undefined &&
//               longitude !== null &&
//               latitude !== null
//             ) {
//               const R = 6371;
//               const latDiff = (inlatitude - latitude) * (Math.PI / 180);
//               const lngDiff = (inlongitude - longitude) * (Math.PI / 180);
//               const a =
//                 Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
//                 Math.cos(latitude * (Math.PI / 180)) *
//                   Math.cos(inlatitude * (Math.PI / 180)) *
//                   Math.sin(lngDiff / 2) *
//                   Math.sin(lngDiff / 2);
//               const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//               const distance = R * c;
//               if (distance <= 10) {
//                 if (distance === 0) {
//                   console.log("Location found at the same coordinates:", latitude, longitude);
//                 } else {
//                   console.log("Locations found nearby:", latitude, longitude);
//                 }
//                 return true;
//               }
//             }
//             return false;
//           }
//         );
//         if (nearby.length === 0) {
//           console.log("No nearby locations found within 10 km radius.");
//         }
//         setNearbyLocations(nearby);
//         console.log("STEP 4 GETTING The Nearby Location", nearby);
//       } catch (error) {
//         console.error("Error fetching nearby locations:", error);
//       }
//     };

//   const handleButtonClick = async (receiverId: string) => {
//     try {
//       await db.collection("friendRequests").add({
//         senderId: id,
//         receiverId: receiverId,
//         reqStatus: "pending",
//         timestamp: newTimestamp,
//       });
//       console.log("Friend request sent successfully!");
//     } catch (error) {
//       console.error("Error sending friend request:", error);
//     }
//   };

//   return (
//     <>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           width: "100%",
//           flexWrap: "wrap",
//           justifyItems: "center",
//           alignSelf: "center",
//         }}
//       >
//         <Map setMap={setMap} onZoomChanged={handleZoomChange}>
//           {currentPosition && (
//             <MarkerF
//               position={{ lat: currentPosition.lat, lng: currentPosition.lng }}
//               icon={{
//                 url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//               }}
//               title="Your current location"
//             />
//           )}
//           <MarkerClusterer
//             maxZoom={MARKER_CLUSTER_MAX_ZOOM}
//             options={{
//               zoomOnClick: true,
//               imagePath:
//                 "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
//             }}
//           >
//             {(clusterer) => (
//               <>
//                 {inlineUnits
//                   .filter(hasLongLat)
//                   .map(({ id, latitude, longitude, bio, imageUrl, name }) => (
//                     <>
//                       <CustomMarker
//                         key={id}
//                         onClick={() => {
//                           if (id) {
//                             handleToggleBottomSheet();
//                             setBottomSheet(id);
//                           }
//                         }}
//                         position={transformPosition(latitude, longitude, id)}
//                         clusterer={clusterer}
//                         draggable
//                       />
//                       {bottomSheet === id && bottomSheetVisible ? (
//                         <BottomSheet
//                           id={id}
//                           name={name}
//                           bio={bio}
//                           image={imageUrl}
//                           onButtonClick={handleButtonClick}
//                           visible={bottomSheetVisible}
//                           onClose={handleToggleBottomSheet}
//                         />
//                       ) : null}
//                     </>
//                   ))}
//               </>
//             )}
//           </MarkerClusterer>
//         </Map>
//       </div>
//     </>
//   );
// }
