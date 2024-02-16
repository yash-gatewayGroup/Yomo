import React from "react";
import { MarkerF, MarkerProps } from "@react-google-maps/api";

interface CustomMarkerProps {
  position: MarkerProps["position"];
  clusterer: MarkerProps["clusterer"];
  draggable?: MarkerProps["draggable"];
  shape?: MarkerProps["shape"];
  onClick?: MarkerProps["onClick"]
}

export const CustomMarker: React.FC<CustomMarkerProps> = (
  props: CustomMarkerProps
) => <MarkerF {...props} />;
