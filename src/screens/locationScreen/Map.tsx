import React, { useState } from "react";
import {
  GoogleMap,
  GoogleMapProps,
  useLoadScript,
} from "@react-google-maps/api";

const options = {
  disableDefaultUI: true,
  scaleControl: true,
  mapTypeId: "roadmap",
  labels: true,
};

export type MapType = Parameters<NonNullable<GoogleMapProps["onLoad"]>>[0];

type MapProps = React.PropsWithChildren<{
  setMap: (map: MapType) => void | Promise<void>;
  onZoomChanged: () => void;
}>;

export default function Map(props: MapProps) {
  const { setMap, onZoomChanged, children } = props;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBsk8fe2yngY-Nz5su1YrOLUneiYcYXSms",
  });

  const [defaultCenter, setDefaultCenter] = useState({ lat: 0, lng: 0 });
  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDefaultCenter({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting current position:", error);
      }
    );
  }, []);

  const renderMap = () => {
    const loadHandler = (map: MapType) => {
      setMap(map);
    };

    return (
      <>
        {defaultCenter ? (
          <GoogleMap
            id="circle-example"
            mapContainerStyle={{
              height: "100vh",
              width: "100%",
              maxWidth: "220vh",
              maxHeight: "100vh",
            }}
            zoom={2}
            center={defaultCenter}
            options={options}
            onLoad={loadHandler}
            onZoomChanged={onZoomChanged}
          >
            {children}
          </GoogleMap>
        ) : (
          <h1>Loading...</h1>
        )}
      </>
    );
  };

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>;
  }

  return isLoaded ? renderMap() : <div>Loading...</div>;
}
