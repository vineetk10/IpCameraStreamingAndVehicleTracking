import React from 'react'
import Button from 'react-bootstrap/Button';
import { useHistory } from "react-router-dom";



function ShowRecordingButton() {
        const history = useHistory();
    
      function handleClick() {
        history.push("/showRecordings");
      }
  return (
    <div>
       <Button variant="primary" size="lg" onClick={handleClick}>
       ShowRecordingButton
      </Button>
    </div>
  )
}

export default ShowRecordingButton