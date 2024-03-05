import React from "react";
import { MarkerF, MarkerProps } from "@react-google-maps/api";

interface CustomMarkerProps {
  position: MarkerProps["position"];
  clusterer: MarkerProps["clusterer"];
  draggable?: MarkerProps["draggable"];
  shape?: MarkerProps["shape"];
  onClick?: MarkerProps["onClick"]
}

export default function CustomMarker(props: CustomMarkerProps) {
  const { position, clusterer, draggable, shape, onClick } = props;

  return <MarkerF position={position} clusterer={clusterer} draggable={draggable} shape={shape} onClick={onClick} />;
}
