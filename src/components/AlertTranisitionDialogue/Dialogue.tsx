import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { makeStyles } from "@mui/styles";
import LoginButtonComponent from "../Button/Button";
import { colors } from "../../theme/colors";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
  paper: {
    color: "black",
  },
});

interface AlertDialogSlideProps {
  open: boolean;
  handleClose: () => void;
  handleLogout: () => void;
  firstMessage: string;
  secondMessage: string;
  btnone: string;
  btnsecond: string;
}

const AlertDialogSlide: React.FC<AlertDialogSlideProps> = ({
  open,
  handleClose,
  handleLogout,
  firstMessage,
  secondMessage,
  btnone,
  btnsecond,
}) => {
  const classes = useStyles();
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      classes={{
        paper: classes.paper,
      }}
    >
      <DialogTitle
        style={{ fontFamily: "Public Sans", fontSize: 16, fontWeight: "bold" }}
      >
        {firstMessage}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          style={{
            fontFamily: "Public Sans",
            fontSize: 14,
            fontWeight: "400",
            color: "#637381",
          }}
        >
          {secondMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <LoginButtonComponent
          onClick={handleClose}
          variant="contained"
          style={{
            backgroundColor: "#919EAB",
            color: colors.white,
            fontFamily: "Public Sans",
            fontSize: 14,
            fontWeight: "400",
            width: "30%",
          }}
          name={btnone}
        />
        <LoginButtonComponent
          onClick={handleLogout}
          variant="contained"
          style={{
            backgroundColor: colors.white,
            color: colors.theme_color,
            fontFamily: "Public Sans",
            fontSize: 14,
            fontWeight: "bold",
            width: "30%",
          }}
          name={btnsecond}
        />
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialogSlide;
