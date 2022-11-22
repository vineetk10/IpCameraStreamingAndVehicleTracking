import React from 'react'
import Button from 'react-bootstrap/Button';
import { useHistory } from "react-router-dom";

function StreamIpCamerasButton() {
  const history = useHistory();

  function handleClick() {
    history.push("/stream");
  }
  return (
    <div>
         <Button variant="primary" size="lg" onClick={handleClick}>
          Stream IP Cameras
      </Button>
    </div>
  )
}

export default StreamIpCamerasButton