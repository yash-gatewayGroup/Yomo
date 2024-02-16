import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AlertDialogSlideProps {
  open: boolean;
  handleClose: () => void;
  handleLogout: () => void;
  firstMessage: string;
  secondMessage: string
  btnone: string,
  btnsecond: string
}

const AlertDialogSlide: React.FC<AlertDialogSlideProps> = ({ open, handleClose, handleLogout, firstMessage, secondMessage, btnone, btnsecond }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{firstMessage}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {secondMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {btnone}
        </Button>
        <Button onClick={handleLogout} color="primary" autoFocus>
          {btnsecond}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialogSlide;
