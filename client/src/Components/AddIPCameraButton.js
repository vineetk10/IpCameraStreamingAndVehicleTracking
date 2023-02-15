import React from 'react'
import { Button } from 'react-bootstrap'
import { useHistory } from "react-router-dom";

function AddIPCameraButton() {
    const history = useHistory();

  function handleClick() {
    history.push("/addCamera");
  }
  return (
    <div>
       <Button variant="primary" size="lg" onClick={handleClick}>
        Add IP Camera
      </Button>
    </div>
  )
}

export default AddIPCameraButton