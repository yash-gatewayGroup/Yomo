import React from "react";

interface CircularImageProps {
  imageUrl: string | undefined;
  alt: string | undefined;
  style?: React.CSSProperties;
}

export const CircularImage: React.FC<CircularImageProps> = ({ imageUrl, alt, style }) => {
  const containerStyle: React.CSSProperties = {
    width: "50px", // Adjust the size of the container as per your requirement
    height: "50px", // Adjust the size of the container as per your requirement
    borderRadius: "50%", // Make the container circular
    overflow: "hidden",
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <div style={containerStyle}>
      <img src={imageUrl} alt={alt} style={imageStyle} />
    </div>
  );
};
