import React, { useState } from "react";

import DisplayUserCameras from "./DisplayUserCameras";
import {IoAddCircleSharp} from 'react-icons/io5'
import AddCamerarModal from "./AddCamerarModal";
// import Navbar from "../Components/Navbar";

const AddIPCamera = () => {
 
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
 
  const addCameraForm = () => {
    return (
      <>
      {/* <Navbar /> */}
      <div className="row" style={{margin: '5rem'}}>
        <span className="header__logo"><IoAddCircleSharp style={{color:"#FFCA2C" }} size={50} onClick={handleShow}/> Add Ip Camera</span>
        {show && <AddCamerarModal show ={show} handleClose={handleClose}/>}
      </div>
      <DisplayUserCameras/>
      </>
      
    );
  };

  return (
    <>
     <div style={{position:'absolute', right:'10px', marginTop:'10px'}}>
            <span className="header__logo"><IoAddCircleSharp style={{color:"#FFCA2C" }} size={50} onClick={handleShow}/> Add Ip Camera</span>
            {show && <AddCamerarModal show ={show} handleClose={handleClose}/>}
      </div>
            <DisplayUserCameras/>
    </>

  );
};

export default AddIPCamera;