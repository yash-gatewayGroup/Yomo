import React from "react";

interface SquareImageProps {
    imageUrl: string | undefined;
    alt: string | undefined;
  }
  
export const SquareImage: React.FC<SquareImageProps> = ({ imageUrl, alt }) => {
    const containerStyle: React.CSSProperties = {
      width: '100%',
      paddingTop: '100%',
      position: 'relative',
      overflow: 'hidden',
    };
  
    const imageStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    };
  
    return (
      <div style={containerStyle}>
        <img src={imageUrl} alt={alt} style={imageStyle} />
      </div>
    );
  };