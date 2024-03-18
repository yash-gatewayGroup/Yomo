import React, { useState } from "react";
import { Modal } from "@mui/material";

interface ImageUrlProps {
  imageUrl: string;
  onClose: () => void;
}
const ZoomableImage: React.FC<ImageUrlProps> = ({ imageUrl, onClose }) => {
  return (
    <Modal
      open={true}
      onClose={onClose}
      className="modal"
    >
      <img src={imageUrl} alt="Zoomed Image" className="zoom-image" />
    </Modal>
  );
};

export default ZoomableImage;
